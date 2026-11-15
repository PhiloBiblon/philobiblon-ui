/**
 * Item-creation form definition for the copid table. Pure data — see
 * insid.js for the module contract's general shape.
 */
export default function createItemForm () {
  return {
    table: 'copid',
    // Deliberate, minor behavior change: the pre-#527 code checked P839
    // before P329 (`Create.vue:208`, just the order two `.add()` calls
    // happened to be written in -- not a meaningful design choice), so when
    // BOTH were empty the create-button tooltip named P839 first. Deriving
    // `required` from the label recipe (below) makes it name P329 first
    // instead, matching the order the label itself uses. Every other
    // table's legacy add-order already matched its label order.
    label: {
      // `${P329}[, ${position}]. ${P839}`, position from a P10 claim or
      // (as a fallback) a P10 qualifier on P329.
      parts: [
        { source: { claim: 'P329' }, required: true },
        {
          source: { anyOf: [{ claim: 'P10' }, { qualifier: { of: 'P329', id: 'P10' } }] },
          required: false,
          separator: ', '
        },
        { source: { claim: 'P839' }, required: true, separator: '. ' }
      ]
    },
    defaultClaims: { P839: { removable: false } },
    // Same P10 shelfmark alias as manid (#571) -- Create.vue:570 applied it
    // to both tables.
    aliases: [
      { source: { anyOf: [{ claim: 'P10' }, { qualifier: { of: 'P329', id: 'P10' } }] } }
    ]
  }
}
