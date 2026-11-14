/**
 * Item-creation form definition for the libid table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'libid',
    label: {
      // `${P34}, ${P47}`
      parts: [
        { source: { claim: 'P34' }, required: true },
        { source: { claim: 'P47' }, required: true, separator: ', ' }
      ]
    }
  }
}
