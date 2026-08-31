/**
 * Item-creation form definition for the manid table. Pure data — see
 * insid.js for the module contract's general shape.
 *
 * Exercises every optional mechanism: a value map (P2 -> label prefix), a
 * claim-or-qualifier fallback source (`anyOf`), a conditional requirement
 * (P843 mandatory for editions), a save-time claim injection (Q453706
 * alongside the wiki's own P843 default — Ui_ControlledVocabulary only
 * supports one default_value per property, so it can't express that
 * second value), and an alias hook (#571).
 */
export default function createItemForm () {
  return {
    table: 'manid',
    label: {
      // `${prefix}${P329}[ (${collection})][, ${position}]`
      parts: [
        { source: { claim: 'P2' }, required: false, map: { Q15: 'MS: ', Q20: 'Ed.: ' }, mapFallback: '' },
        { source: { claim: 'P329' }, required: true },
        {
          source: { anyOf: [{ claim: 'P1054' }, { qualifier: { of: 'P329', id: 'P1054' } }] },
          required: false,
          separator: ' ',
          wrap: '(%s)'
        },
        {
          source: { anyOf: [{ claim: 'P10' }, { qualifier: { of: 'P329', id: 'P10' } }] },
          required: false,
          separator: ', '
        }
      ]
    },
    conditionalRequirements: [
      { when: { claimHasValue: { property: 'P2', anyOf: ['Q20'] } }, require: 'P843' }
    ],
    extraClaimsOnSave: [
      {
        when: {
          all: [
            { claimHasValue: { property: 'P2', anyOf: ['Q20'] } },
            { claimPresent: 'P843' }
          ]
        },
        add: { property: 'P843', value: 'Q453706' }
      }
    ],
    aliases: [
      { source: { anyOf: [{ claim: 'P10' }, { qualifier: { of: 'P329', id: 'P10' } }] } }
    ]
  }
}
