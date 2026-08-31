/**
 * Normalizes `Create.vue`'s `initialClaims` (the array of Wikibase-claim-
 * shaped working rows the claim editor mutates) into a ClaimSnapshot:
 * `{ [propertyId]: Entry[] }`, `Entry = { raw, text, qualifiers }`,
 * `qualifiers = { [qualifierPropertyId]: Entry[] }`.
 *
 * `entries[0]` is always the claim's primary value; `entries[1..]` are its
 * claimsValues (repeated values on the same property), in storage order.
 *
 * Two legacy read models get unified here, deliberately entry by entry,
 * because they disagree on what counts as "empty":
 *  - `raw` reproduces `generateClaimsData`'s extraction
 *    (`datavalue.value.id ?? datavalue.value`), used for presence checks —
 *    `0`/`false` count as present (`raw != null && raw !== ''`).
 *  - `text` reproduces `getClaimValue`'s display projection
 *    (`label || text || <long-form date> || id`, trimmed) — falsy values
 *    (including `0`/`false`) are treated as absent, matching `getClaimValue`.
 *    Qualifier entries use `getQualifierValue`'s narrower projection instead
 *    (`label || text || id`, no time formatting) — real asymmetry in the
 *    current code, preserved on purpose.
 */
import { longDate } from './formatters.js'

function trimIfString (val) {
  return typeof val === 'string' ? val.trim() : val
}

function extractRaw (valueLike) {
  const val = valueLike?.datavalue?.value
  return val?.id ?? val
}

function resolveClaimText (valueLike) {
  const val = valueLike?.datavalue?.value
  if (!val) return null
  if (typeof val === 'object') {
    if (val.time !== undefined) {
      return trimIfString(val.label || val.text || longDate(val.time) || val.id)
    }
    return trimIfString(val.label || val.text || val.id)
  }
  return trimIfString(val)
}

function resolveQualifierText (valueLike) {
  const val = valueLike?.datavalue?.value
  if (!val) return null
  if (typeof val === 'object') {
    return trimIfString(val.label || val.text || val.id)
  }
  return trimIfString(val)
}

function normalizeQualifierEntries (qualifiers) {
  const result = {}
  for (const qualifier of qualifiers || []) {
    const qualifierId = qualifier?.property?.id ?? qualifier?.property
    if (!qualifierId) continue
    result[qualifierId] = result[qualifierId] || []
    result[qualifierId].push({
      raw: extractRaw(qualifier),
      text: resolveQualifierText(qualifier)
    })
  }
  return result
}

export function normalizeClaims (initialClaims) {
  const snapshot = {}
  for (const claim of initialClaims || []) {
    const propertyId = claim?.property?.id
    if (!propertyId) continue
    snapshot[propertyId] = snapshot[propertyId] || []
    snapshot[propertyId].push({
      raw: extractRaw(claim.value),
      text: resolveClaimText(claim.value),
      qualifiers: normalizeQualifierEntries(claim.qualifiers)
    })
    for (const value of Object.values(claim.claimsValues || {})) {
      snapshot[propertyId].push({
        raw: extractRaw(value),
        text: resolveClaimText(value),
        qualifiers: normalizeQualifierEntries(value.qualifiers)
      })
    }
  }
  return snapshot
}

export function getEntry (snapshot, propertyId, index = 0) {
  return snapshot?.[propertyId]?.[index] ?? null
}

export function getQualifierEntry (snapshot, propertyId, qualifierId, index = 0) {
  return getEntry(snapshot, propertyId)?.qualifiers?.[qualifierId]?.[index] ?? null
}

export function hasValue (entry) {
  return entry != null && entry.raw != null && entry.raw !== ''
}
