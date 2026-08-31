# item-forms

`service/item-forms/` is the single source of truth for what happens on item
creation (`pages/item/[table]/create.vue` -> `components/item/Create.vue`):
the auto-generated label, which claims are required, default claim values,
a default description, save-time claim injection, and aliases. It replaced
per-table `if (props.table === ...)`/`switch (props.table)` logic that used
to live directly in `Create.vue` (#527).

## Why

`required` and the generated-label recipe used to be the same fact written
twice: a property was required exactly because the label needed it. Keeping
them in two places (or splitting them across code and wiki config, as an
earlier design for #527 tried) meant they could silently drift. Deriving
`required` from the label recipe makes that impossible.

## Layout

```
service/item-forms/
  index.js       # table -> module registry (static imports)
  engine.js      # pure functions: label building, validation, default-claim
                  # planning, save-time injection, aliases
  normalize.js   # initialClaims -> ClaimSnapshot (the one read model)
  conditions.js  # Source resolution + condition evaluation
  formatters.js  # date formatting/precision helpers
  <table>.js     # one pure-data module per item table (10 total)
composables/
  useItemForm.js # thin Vue/i18n/Wikibase adapter around engine.js
```

`engine.js` and everything it imports are plain JS with no Vue, i18n, or
Wikibase calls -- importable from Node, which is what makes them unit
testable (see [testing.md](testing.md)). `useItemForm.js` is the only place
that translates (`t(code, {propertyLabel})`) or talks to Wikibase (resolving
`Source.cascadeThrough`).

## Module contract

```js
export default function createItemForm () {
  return {
    table: 'insid',
    label: { parts: [ LabelPart, ... ] },       // sole source of `required`
    conditionalRequirements: [ Rule ],           // optional
    defaultClaims: { [propertyId]: Override },   // optional, allowlisted
    description: { key, duplicateInEnglish },    // optional (cnum only)
    extraClaimsOnSave: [ Rule ],                 // optional (manid only)
    aliases: [ { source: Source } ]              // optional (manid/copid)
  }
}
```

A `LabelPart` is `{ id?, source, required, separator?, wrap?, map?,
mapFallback?, format?, when? }`. Each part carries its own separator, so an
absent optional part disappears from the label without leaving a stray
comma. A `Source` is exactly one of:

- `{ claim: 'P34' }` (or the bare string `'P34'`) -- a claim's primary value
- `{ qualifier: { of: 'P329', id: 'P10' } }` -- a qualifier on another claim
- `{ firstOf: [Source, ...] }` / `{ anyOf: [Source, ...] }` -- try each in
  order, first non-empty wins (semantically identical; `firstOf` reads as a
  fallback chain across different properties, `anyOf` as alternative shapes
  for the same value)
- `{ cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }` -- an async
  lookup through the entity `claim` points at, reading *that* entity's
  `viaProperty` (bibid's surname cascade, #574 -- see `bibid.js`)

See `manid.js` (map + conditionalRequirements + extraClaimsOnSave + aliases)
and `bibid.js` (firstOf + cascadeThrough + `partResolvedFrom`) for the
non-trivial examples.

## Where a new default/requirement belongs

| Need | Where |
|---|---|
| A claim/qualifier appears on new-item creation, and in what order | `Ui_SortedProperties_NewItem` (wiki page) |
| Autocomplete query / `default_value` per property+bibliography | `Ui_ControlledVocabulary` (wiki page) |
| Which properties the label needs -> which are required | The table's `label.parts` in `service/item-forms/<table>.js` |
| A structural default (PBID, bibliography, creation-date qualifier) or a `hidden`/`removable` override | `engine.js`'s global overrides, or the table's `defaultClaims` |
| Something that can't be a single wiki `default_value`, or a value injected only at save time | `extraClaimsOnSave` |
| An alias derived from claim data | `aliases` |

**Never add a `props.table === 'x'` conditional to a component.** If a table
needs special handling that doesn't fit the contract above, extend the
contract (as `cascadeThrough` and `aliases` were added for #574/#571)
instead of reaching for an inline table check -- that's exactly the
per-table logic this module exists to replace.

## Tests

`test/item-forms/` has a parity suite per table plus engine-mechanics specs
(see [testing.md](testing.md)) -- `test/item-forms/registry.spec.js` in
particular pins `getRequiredProperties()` against a `LEGACY_REQUIRED`
fixture transcribed from the pre-#527 code, for all 10 tables.
