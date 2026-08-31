/**
 * Item-creation form definition for the texid table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'texid',
    label: {
      // `${P21}, ${P11}`
      parts: [
        { source: { claim: 'P21' }, required: true },
        { source: { claim: 'P11' }, required: true, separator: ', ' }
      ]
    }
  }
}
