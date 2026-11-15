/**
 * Item-creation form definition for the cnum table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'cnum',
    label: {
      // `${P590}, ${P8}`
      parts: [
        { source: { claim: 'P590' }, required: true },
        { source: { claim: 'P8' }, required: true, separator: ', ' }
      ]
    },
    defaultClaims: { P590: { removable: false } },
    description: { key: 'item.cnum_description', duplicateInEnglish: true }
  }
}
