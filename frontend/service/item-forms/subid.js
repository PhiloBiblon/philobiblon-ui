/**
 * Item-creation form definition for the subid table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'subid',
    label: {
      // `${P34}`
      parts: [
        { source: { claim: 'P34' }, required: true }
      ]
    }
  }
}
