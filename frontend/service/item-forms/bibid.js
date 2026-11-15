/**
 * Item-creation form definition for the bibid table. Pure data — see
 * insid.js for the module contract's general shape.
 *
 * The `name` part is a fallback chain across FOUR different properties, two
 * of which need an async lookup through a different entity entirely: P247
 * (family name) is sometimes recorded on the referenced person's own
 * entity rather than on the bibid item directly, so it's read by cascading
 * through P21 (author) -- or, if that's empty too, through P845 (creator)
 * -- to that entity's own P247 (#574). A creator without a P247 (e.g. an
 * organisation such as an auction house) keeps its full P845 label instead.
 * The role qualifier (P820) is shown whenever the name ends up resolving
 * from P845, cascaded or not -- `partResolvedFrom` reads back which
 * alternative the `name` part actually used. When the name comes from
 * elsewhere, P845 and its role go at the end instead, as "(role creator)",
 * and every filled P845 must carry its P820 role (#579).
 *
 * The P11 title may carry HTML markup (e.g. <i>), which the label drops; it
 * is quoted for article-like P2 types, and followed by the container the
 * work was published in (#580).
 */

// P2 values whose bibid label quotes the P11 title (#580)
const QUOTED_TITLE_TYPES = ['Q395111', 'Q395198', 'Q394503', 'Q1815987']

export default function createItemForm () {
  return {
    table: 'bibid',
    label: {
      // `${name}[ (${role})][ (${date})], ${title}[, ${container}][ (${role} ${creator})]`
      parts: [
        {
          id: 'name',
          source: {
            firstOf: [
              'P247',
              { cascadeThrough: { claim: 'P21', viaProperty: 'P247' } },
              'P21',
              { cascadeThrough: { claim: 'P845', viaProperty: 'P247' } },
              'P845',
              'P1134'
            ]
          },
          required: true
        },
        {
          source: { qualifier: { of: 'P845', id: 'P820' } },
          required: false,
          separator: ' ',
          wrap: '(%s)',
          when: { partResolvedFrom: { part: 'name', property: 'P845' } }
        },
        {
          source: { claim: 'P49' },
          required: false,
          separator: ' ',
          wrap: '(%s)',
          format: 'isoDatePrecision'
        },
        {
          source: { claim: 'P11' },
          required: true,
          separator: ', ',
          transform: 'stripHtml',
          wrapWhen: { when: { claimHasValue: { property: 'P2', anyOf: QUOTED_TITLE_TYPES } }, wrap: '“%s”' }
        },
        // P64 (Published in, an item) is the container going forward; P1137
        // (* Published in, a string) is the legacy one, kept as fallback.
        {
          source: { firstOf: ['P64', 'P1137'] },
          required: false,
          separator: ', ',
          transform: 'stripHtml'
        },
        {
          source: { qualifier: { of: 'P845', id: 'P820' } },
          required: false,
          separator: ' ',
          transform: 'lowercaseFirst',
          with: { creator: 'P845' },
          wrap: '(%s {creator})',
          when: { not: { partResolvedFrom: { part: 'name', property: 'P845' } } }
        }
      ]
    },
    requiredQualifiers: [{ of: 'P845', id: 'P820' }]
  }
}
