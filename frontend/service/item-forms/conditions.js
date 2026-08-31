/**
 * Source resolution (`{claim}`/`{qualifier}`/`{firstOf}`/`{anyOf}`/
 * `{cascadeThrough}`) and condition evaluation (`claimHasValue`/
 * `claimPresent`/`all`/`partResolvedFrom`) shared by `engine.js`. Pure
 * except for `cascadeThrough`, whose actual entity fetch is injected via
 * `ctx.cascadeLabel` (see `useItemForm.js`) — this module never talks to
 * Wikibase itself.
 */
import { getEntry, getQualifierEntry, hasValue } from './normalize.js'

export function normalizeSource (source) {
  return typeof source === 'string' ? { claim: source } : source
}

/**
 * Resolves a Source against a ClaimSnapshot to `{ text, raw, resolvedFrom }`,
 * or `null` if nothing usable is present. `resolvedFrom` is the property id
 * the value ultimately came from — consumed by `partResolvedFrom` conditions
 * on later label parts (e.g. bibid's P820 role qualifier, shown only when
 * the name resolved from P845).
 */
export async function resolveSource (source, snapshot, ctx) {
  const spec = normalizeSource(source)
  if (!spec) return null

  if (spec.claim) {
    const entry = getEntry(snapshot, spec.claim, 0)
    if (!hasValue(entry)) return null
    return { text: entry.text, raw: entry.raw, resolvedFrom: spec.claim }
  }

  if (spec.qualifier) {
    const { of, id } = spec.qualifier
    const entry = getQualifierEntry(snapshot, of, id, 0)
    if (!hasValue(entry)) return null
    return { text: entry.text, raw: entry.raw, resolvedFrom: id }
  }

  if (spec.firstOf) {
    for (const candidate of spec.firstOf) {
      const resolved = await resolveSource(candidate, snapshot, ctx)
      if (resolved) return resolved
    }
    return null
  }

  if (spec.anyOf) {
    for (const candidate of spec.anyOf) {
      const resolved = await resolveSource(candidate, snapshot, ctx)
      if (resolved) return resolved
    }
    return null
  }

  if (spec.cascadeThrough) {
    const { claim, viaProperty } = spec.cascadeThrough
    const entry = getEntry(snapshot, claim, 0)
    const entityId = entry?.raw
    if (typeof entityId !== 'string' || !entityId) return null
    if (typeof ctx?.cascadeLabel !== 'function') {
      throw new Error('[item-forms] cascadeThrough source requires ctx.cascadeLabel')
    }
    const text = await ctx.cascadeLabel(entityId, viaProperty)
    if (!text) return null
    return { text, raw: entityId, resolvedFrom: claim }
  }

  throw new Error(`[item-forms] unrecognized Source: ${JSON.stringify(source)}`)
}

export function evaluateCondition (condition, evalCtx) {
  if (!condition) return true
  const { snapshot, resolvedParts } = evalCtx

  if (condition.all) {
    return condition.all.every(c => evaluateCondition(c, evalCtx))
  }

  if (condition.claimHasValue) {
    const { property, anyOf } = condition.claimHasValue
    const entries = snapshot?.[property] || []
    return entries.some(entry => hasValue(entry) && (!anyOf || anyOf.includes(entry.raw)))
  }

  if (condition.claimPresent) {
    const entries = snapshot?.[condition.claimPresent] || []
    return entries.some(hasValue)
  }

  if (condition.partResolvedFrom) {
    const { part, property } = condition.partResolvedFrom
    return resolvedParts?.[part] === property
  }

  throw new Error(`[item-forms] unrecognized condition: ${JSON.stringify(condition)}`)
}
