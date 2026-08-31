/**
 * Pure engine driving item-creation label generation, required-field
 * validation, and default-claim planning from a table's item-form module
 * (see `<table>.js`). No Vue, no i18n, no Wikibase network calls — those
 * live in `composables/useItemForm.js`, which injects them via `ctx`
 * (`cascadeLabel` for `Source.cascadeThrough`) and applies the plans this
 * module returns onto the actual claim objects `Create.vue` renders.
 *
 * `required` is deliberately never configured directly — see
 * `getRequiredProperties`.
 */
import { evaluateCondition, normalizeSource, resolveSource } from './conditions.js'
import { getEntry, hasValue } from './normalize.js'
import { isCompleteDate, isoDatePrecision, todayWikibaseTime } from './formatters.js'

export { todayWikibaseTime, isCompleteDate } from './formatters.js'

export const GLOBAL_REQUIRED_PROPERTIES = ['P2', 'P476']

const FORMATTERS = { isoDatePrecision }

// Mirrors WikibaseService.BIBLIOGRAPHY_MAP (wikibase.service.js). Duplicated,
// not imported: that file pulls in Nuxt/Pinia auto-imports (useAuthStore,
// etc.) at module scope, which would break this module's "plain Node,
// Vue-free" contract.
const BIBLIOGRAPHY_MAP = { BETA: 'Q254471', BITECA: 'Q256810', BITAGAP: 'Q256809' }

const GLOBAL_DEFAULT_PROPERTY_ORDER = ['P476', 'P131', 'P799']
export const DEFAULT_CLAIMS_ALLOWLIST = ['P476', 'P131', 'P799', 'P590', 'P839']

/**
 * Derives which properties a table requires from its label recipe: a
 * property is required precisely because `buildLabel` needs it to produce a
 * label. Never configured separately — that's the duplication #527 exists to
 * remove. Throws if a required part's source can't be reduced to one or more
 * claim properties (e.g. a bare `cascadeThrough`), so a non-derivable recipe
 * fails loudly instead of silently dropping a requirement.
 *
 * Returns `{ required, groups }`: `required` are single properties that must
 * have a value; `groups` are "at least one of" alternatives (bibid's name
 * chain) — `reportAs` is the property whose label the validation error
 * should be attributed to.
 */
export function getRequiredProperties (form) {
  const required = []
  const groups = []
  for (const part of form?.label?.parts ?? []) {
    if (!part.required) continue
    const source = normalizeSource(part.source) ?? {}
    if (source.claim) {
      required.push(source.claim)
    } else if (source.firstOf?.length) {
      const properties = source.firstOf
        .map(normalizeSource)
        .filter(s => s?.claim)
        .map(s => s.claim)
      if (!properties.length) {
        throw new Error(`[item-forms] ${form.table}: required label part's firstOf has no derivable claim source`)
      }
      groups.push({ properties, reportAs: properties[0] })
    } else {
      throw new Error(`[item-forms] ${form.table}: required label part has a non-derivable source (${JSON.stringify(part.source)})`)
    }
  }
  return { required, groups }
}

/**
 * Builds the auto-generated label for a table, or `''` if a required part
 * couldn't be resolved — callers should only overwrite the user-editable
 * label field when this returns a non-empty string, matching the legacy
 * `if (generatedLabel) label.value = generatedLabel` behavior.
 */
export async function buildLabel (form, snapshot, ctx = {}) {
  const resolvedParts = {}
  const pieces = []

  for (const part of form?.label?.parts ?? []) {
    if (part.when && !evaluateCondition(part.when, { snapshot, resolvedParts })) {
      continue
    }

    const resolved = part.source ? await resolveSource(part.source, snapshot, ctx) : null
    let valueStr = null

    if (resolved) {
      if (part.format) {
        const formatter = FORMATTERS[part.format]
        if (!formatter) throw new Error(`[item-forms] unknown label format "${part.format}"`)
        valueStr = formatter(resolved.raw)
      } else if (part.map) {
        valueStr = Object.prototype.hasOwnProperty.call(part.map, resolved.raw)
          ? part.map[resolved.raw]
          : (part.mapFallback ?? '')
      } else {
        valueStr = resolved.text ?? null
      }
    }

    if (!valueStr) {
      if (part.required) return ''
      continue
    }

    if (part.id) resolvedParts[part.id] = resolved?.resolvedFrom ?? null

    const wrapped = part.wrap ? part.wrap.replace('%s', valueStr) : valueStr
    pieces.push((part.separator || '') + wrapped)
  }

  return pieces.join('')
}

/**
 * Full validation, in the exact order the create-button tooltip has always
 * used (only one reason is ever shown, so the order decides what the user
 * sees): 1. "at least one of" groups, 2. conditionalRequirements,
 * 3. GLOBAL_REQUIRED_PROPERTIES then label-derived required properties,
 * 4. the global P799 creation-date completeness rule. Returns a descriptor
 * `{ code, propertyId }` for the first failure, or `null` if the form is
 * valid — `useItemForm.js` turns `code` into `t(code, {propertyLabel})`.
 */
export function validateItemForm (form, snapshot) {
  const { required, groups } = getRequiredProperties(form)

  for (const group of groups) {
    const hasAny = group.properties.some(p => hasValue(getEntry(snapshot, p, 0)))
    if (!hasAny) {
      return { code: 'claim_value_missing', propertyId: group.reportAs }
    }
  }

  for (const rule of form.conditionalRequirements ?? []) {
    if (!evaluateCondition(rule.when, { snapshot })) continue
    const entries = snapshot?.[rule.require] || []
    if (!entries.some(hasValue)) {
      return { code: 'claim_value_missing', propertyId: rule.require }
    }
  }

  for (const propertyId of [...GLOBAL_REQUIRED_PROPERTIES, ...required]) {
    const entries = snapshot?.[propertyId] || []
    if (!entries.some(hasValue)) {
      return { code: 'claim_value_missing', propertyId }
    }
  }

  for (const entry of snapshot?.P799 ?? []) {
    if (!hasValue(entry)) continue
    const dateQualifiers = entry.qualifiers?.P106 ?? []
    if (!dateQualifiers.length || !dateQualifiers.every(q => q.raw != null && isCompleteDate(q.raw))) {
      return { code: 'incomplete_date', propertyId: 'P799' }
    }
  }

  return null
}

/** `{ key, duplicateInEnglish }`, or null when the table has no default description. */
export function getDefaultDescription (form) {
  return form.description ?? null
}

function snapshotFromCleanedClaims (cleanedClaims) {
  const snapshot = {}
  for (const [propertyId, entries] of Object.entries(cleanedClaims || {})) {
    snapshot[propertyId] = (entries || []).map(entry => ({ raw: entry.value, qualifiers: {} }))
  }
  return snapshot
}

/**
 * Injects claims that can't be expressed as a single wiki default value
 * (`Ui_ControlledVocabulary` allows only one `default_value` per property —
 * manid's P843 needs a *second* value, Q453706, alongside whatever the wiki
 * default already put there). Runs against the cleaned, save-ready claims
 * object and returns it (mutated in place) when a table declares
 * `extraClaimsOnSave`; returns it untouched otherwise.
 */
export function applyExtraClaimsOnSave (form, cleanedClaims) {
  if (!form.extraClaimsOnSave?.length) return cleanedClaims

  const snapshot = snapshotFromCleanedClaims(cleanedClaims)
  for (const rule of form.extraClaimsOnSave) {
    if (!evaluateCondition(rule.when, { snapshot })) continue
    const targetEntries = cleanedClaims[rule.add.property]
    if (!targetEntries?.length) continue
    if (!targetEntries.some(c => c.value === rule.add.value)) {
      targetEntries.push({ value: rule.add.value, qualifiers: {} })
    }
  }
  return cleanedClaims
}

/**
 * Resolves a table's alias values (e.g. manid/copid's P10 shelfmark, made
 * searchable as an alias — #571) against the pre-save ClaimSnapshot. Tables
 * without an `aliases` hook resolve to `[]`.
 */
export async function getAliasValues (form, snapshot, ctx) {
  const values = []
  for (const rule of form.aliases ?? []) {
    const resolved = await resolveSource(rule.source, snapshot, ctx)
    if (resolved?.text) values.push(resolved.text)
  }
  return values
}

export function getBibliographyClaimValue (database) {
  const bibliographyId = BIBLIOGRAPHY_MAP[database] || null
  return bibliographyId ? { id: bibliographyId } : null
}

export function generatePbId ({ database, table, itemNumber }) {
  return `${database} ${table} ${parseInt(itemNumber, 10) + 1}`
}

/**
 * Property display order: any of P476/P131/P799 not already placed by the
 * wiki's `Ui_SortedProperties_NewItem` order go first (P799 always last,
 * even among these three), followed by the wiki order itself.
 */
export function computePropertyOrder (wikiOrder) {
  const wikiKeys = Object.keys(wikiOrder || {})
  const defOnly = GLOBAL_DEFAULT_PROPERTY_ORDER.filter(p => !wikiKeys.includes(p))
  const defWithoutP799 = defOnly.filter(p => p !== 'P799')
  const trailingP799 = defOnly.includes('P799') ? ['P799'] : []
  return [...new Set([...defWithoutP799, ...wikiKeys, ...trailingP799])]
}

export function getQualifierPropertyIds (wikiOrder) {
  return [...new Set(['P700', 'P106', ...Object.values(wikiOrder || {}).flat()])]
}

function mergeOverride (base, extra) {
  if (!base) return extra
  return {
    ...base,
    ...extra,
    qualifiers: { ...(base.qualifiers || {}), ...(extra.qualifiers || {}) }
  }
}

/**
 * Plans default claim values for item creation: property/qualifier order
 * (from `wikiOrder`, i.e. `getClaimsOrderForNewItem(table)` — this function
 * never decides which properties are shown, only how the three structural
 * ones and the table's own `defaultClaims` are valued) plus an
 * `overrides` map consumed by `applyClaimOverride`. `form.defaultClaims`
 * keys are allowlisted to `DEFAULT_CLAIMS_ALLOWLIST` so they can't become a
 * backdoor for vocabulary that belongs in `Ui_ControlledVocabulary` instead.
 */
export function planDefaultClaims (form, ctx) {
  const { database, table, itemNumber, wikiOrder, now } = ctx

  const invalidKeys = Object.keys(form.defaultClaims || {}).filter(k => !DEFAULT_CLAIMS_ALLOWLIST.includes(k))
  if (invalidKeys.length) {
    throw new Error(`[item-forms] ${table}: defaultClaims keys must be a subset of [${DEFAULT_CLAIMS_ALLOWLIST.join(', ')}] (got ${invalidKeys.join(', ')})`)
  }

  const overrides = {
    // replaceQualifiers: the legacy code built P476 from scratch with an
    // empty qualifiers array, discarding anything Ui_SortedProperties_NewItem
    // declared for it (Create.vue: `buildClaim(entity, [], generatePbId(...), false)`).
    P476: { value: generatePbId({ database, table, itemNumber }), removable: false, replaceQualifiers: true },
    P131: {
      value: getBibliographyClaimValue(database),
      qualifiers: { P700: { value: { id: 'Q447226' } } },
      replaceQualifiers: true
    },
    P799: {
      qualifiers: { P106: { value: todayWikibaseTime(now), hidden: true } }
    }
  }

  for (const [propertyId, override] of Object.entries(form.defaultClaims || {})) {
    overrides[propertyId] = mergeOverride(overrides[propertyId], override)
  }

  return {
    propertyOrder: computePropertyOrder(wikiOrder),
    qualifierPropertyIds: getQualifierPropertyIds(wikiOrder),
    overrides
  }
}

/**
 * Layers an override plan entry onto a claim object already built (via
 * `buildClaim`/`buildQualifier` in `useItemForm.js`) from the live Wikibase
 * property entity. `createQualifier(qualifierPropertyId)` builds a fresh
 * qualifier row for an override that targets a qualifier the wiki config
 * didn't already declare (e.g. P799's hidden P106 date on a table that
 * doesn't list P106 in `Ui_SortedProperties_NewItem`) — return a falsy value
 * from it to skip an override with no entity data available to build from.
 */
export function applyClaimOverride (claim, override, createQualifier) {
  if (!override) return claim

  if (override.value !== undefined) claim.value.datavalue.value = override.value
  if (override.hidden !== undefined) claim.hidden = override.hidden
  if (override.removable !== undefined) claim.removable = override.removable

  if (override.replaceQualifiers) claim.qualifiers = []

  for (const [qualifierPropertyId, qualifierOverride] of Object.entries(override.qualifiers || {})) {
    let qualifier = claim.qualifiers.find(q => q.property?.id === qualifierPropertyId)
    if (!qualifier) {
      qualifier = createQualifier(qualifierPropertyId)
      if (!qualifier) continue
      claim.qualifiers.push(qualifier)
    }
    if (qualifierOverride.value !== undefined) qualifier.datavalue.value = qualifierOverride.value
    if (qualifierOverride.hidden !== undefined) qualifier.hidden = qualifierOverride.hidden
  }

  return claim
}
