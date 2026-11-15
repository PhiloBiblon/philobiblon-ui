/**
 * Item-creation form definition for the bioid table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'bioid',
    label: {
      // `${P34}`
      parts: [
        { source: { claim: 'P34' }, required: true }
      ]
    },
    defaultClaims: { P799: { value: { id: 'Q447227' }, hidden: true } }
  }
}
