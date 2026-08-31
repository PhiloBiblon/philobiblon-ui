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
 * alternative the `name` part actually used.
 */
export default function createItemForm () {
  return {
    table: 'bibid',
    label: {
      // `${name}[ (${role})][ (${date})], ${P11}`
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
        { source: { claim: 'P11' }, required: true, separator: ', ' }
      ]
    }
  }
}
