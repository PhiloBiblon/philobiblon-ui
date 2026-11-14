/**
 * Item-creation form definition for the insid table. Pure data, importable
 * from Nuxt and Node — no Vue imports (see engine.js).
 *
 * `required` is DERIVED from label.parts by engine.getRequiredProperties: a
 * property is required precisely because the generated label needs it.
 * Never list required properties separately.
 */
export default function createItemForm () {
  return {
    table: 'insid',
    label: {
      // `${P34}, ${P297}`
      parts: [
        { source: { claim: 'P34' }, required: true },
        { source: { claim: 'P297' }, required: true, separator: ', ' }
      ]
    }
  }
}
