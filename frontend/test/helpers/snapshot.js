/**
 * Builders for `initialClaims`-shaped fixtures (the array
 * `components/item/Create.vue` mutates and feeds to
 * `service/item-forms/normalize.js#normalizeClaims`) and for `ClaimSnapshot`
 * fixtures directly, so item-forms specs read as data rather than setup
 * code.
 */

/** A claim value pointing at another entity, e.g. `entityValue('Q20', 'Edition')`. */
export function entityValue (id, label) {
  return label !== undefined ? { id, label } : { id }
}

/** A Wikibase time value at a given precision (11 = day, 10 = month, 9 = year). */
export function timeValue (time, precision = 11) {
  return { time, precision, calendar: 'gregorian' }
}

/** One qualifier entry, as stored on a claim's `qualifiers` array. */
export function qualifier (propertyId, value, { label } = {}) {
  return {
    property: { id: propertyId, label: label ?? propertyId, datatype: 'wikibase-item' },
    datavalue: { value }
  }
}

/** One claimsValues entry (a repeated value on the same property). */
export function extraValue (value, { qualifiers = [] } = {}) {
  return { datavalue: { value }, qualifiers, references: [] }
}

/**
 * One `initialClaims` entry. `value` is the primary value (a string, a
 * `{id, label}` pair, a time object, or `null`/`undefined` for an
 * empty/default row). `qualifiers` and `claimsValues` mirror what
 * `Create.vue`'s `buildClaim`/qualifier editor produce.
 */
export function claim (propertyId, value, { label, datatype = 'wikibase-item', qualifiers = [], claimsValues = [], removable } = {}) {
  return {
    property: { id: propertyId, label: label ?? propertyId, datatype },
    mainsnak: { property: propertyId },
    value: { property: propertyId, datatype, datavalue: { value: value ?? null } },
    qualifiers,
    claimsValues,
    ...(removable !== undefined ? { removable } : {})
  }
}

/** Assembles several `claim(...)` results into an `initialClaims` array. */
export function initialClaims (...claims) {
  return claims
}

/** A ClaimSnapshot entry, for tests that build snapshots directly rather than via normalizeClaims. */
export function entry (raw, text = raw, qualifiers = {}) {
  return { raw: raw ?? null, text: text ?? null, qualifiers }
}

/** A ClaimSnapshot built directly from `{ propertyId: entry | entry[] }`. */
export function snapshot (props) {
  const result = {}
  for (const [propertyId, value] of Object.entries(props)) {
    result[propertyId] = Array.isArray(value) ? value : [value]
  }
  return result
}
