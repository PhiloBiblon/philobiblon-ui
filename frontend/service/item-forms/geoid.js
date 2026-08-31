/**
 * Item-creation form definition for the geoid table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'geoid',
    label: {
      // `${P34}` with `, ${P297}` only when present. Contrast with insid,
      // where P297 is required.
      parts: [
        { source: { claim: 'P34' }, required: true },
        { source: { claim: 'P297' }, required: false, separator: ', ' }
      ]
    },
    defaultClaims: { P799: { value: { id: 'Q447227' }, hidden: true } }
  }
}
