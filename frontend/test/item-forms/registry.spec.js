import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { getRequiredProperties } from '~/service/item-forms/engine.js'

const ALL_TABLES = ['bibid', 'bioid', 'cnum', 'copid', 'geoid', 'insid', 'libid', 'manid', 'subid', 'texid']

// Transcribed from Create.vue's pre-#527 getCreateDisabledReason
// (commit e9d3eff, lines ~206-225): what each table required, and in what
// order the requiredPropertyIds Set was built (which decided which single
// reason the create-button tooltip showed first when more than one
// property was missing). getRequiredProperties() must reproduce this for
// every table -- this is the invariant that makes reintroducing the
// required/label duplication impossible: `required` and `groups` can only
// ever come from label.parts.
//
// The one deliberate exception is copid, whose legacy order (P839 before
// P329) was an accident of two `.add()` calls, not a real design choice --
// see the comment in copid.js.
const LEGACY_REQUIRED = {
  bibid: { required: ['P11'], groups: [{ properties: ['P247', 'P21', 'P845', 'P1134'], reportAs: 'P247' }] },
  bioid: { required: ['P34'], groups: [] },
  cnum: { required: ['P590', 'P8'], groups: [] },
  copid: { required: ['P329', 'P839'], groups: [] }, // legacy order was P839, P329 -- see copid.js
  geoid: { required: ['P34'], groups: [] },
  insid: { required: ['P34', 'P297'], groups: [] },
  libid: { required: ['P34', 'P47'], groups: [] },
  manid: { required: ['P329'], groups: [] },
  subid: { required: ['P34'], groups: [] },
  texid: { required: ['P21', 'P11'], groups: [] }
}

describe('item-forms registry', () => {
  it('registers all 10 item tables', () => {
    for (const table of ALL_TABLES) {
      expect(getItemForm(table)?.table, table).toBe(table)
    }
  })

  it('returns null for an unregistered/unknown table', () => {
    expect(getItemForm('nope')).toBeNull()
    expect(getItemForm(undefined)).toBeNull()
  })

  it.each(ALL_TABLES)('%s: the module is plain data (no functions, no class instances)', (table) => {
    // JSON.stringify can't check this: it silently drops functions instead of throwing.
    const offending = []
    const walk = (value, path) => {
      if (value === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof value)) return
      if (Array.isArray(value)) {
        value.forEach((item, i) => walk(item, `${path}[${i}]`))
        return
      }
      const proto = typeof value === 'object' ? Object.getPrototypeOf(value) : undefined
      if (proto !== Object.prototype && proto !== null) {
        offending.push(`${path}: ${typeof value}`)
        return
      }
      for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`)
    }
    walk(getItemForm(table), table)
    expect(offending).toEqual([])
  })

  it.each(ALL_TABLES)('%s: getRequiredProperties matches the legacy Create.vue derivation exactly', (table) => {
    expect(getRequiredProperties(getItemForm(table))).toEqual(LEGACY_REQUIRED[table])
  })

  it('getRequiredProperties never throws for any registered table (totality)', () => {
    for (const table of ALL_TABLES) {
      expect(() => getRequiredProperties(getItemForm(table))).not.toThrow()
    }
  })

  it('required ∪ flatten(groups) is exactly the set of properties referenced by required label parts', () => {
    for (const table of ALL_TABLES) {
      const form = getItemForm(table)
      const { required, groups } = getRequiredProperties(form)
      const derivedFromRequired = new Set([...required, ...groups.flatMap(g => g.properties)])

      const expectedProperties = new Set()
      for (const part of form.label.parts) {
        if (!part.required) continue
        const source = typeof part.source === 'string' ? { claim: part.source } : part.source
        if (source.claim) expectedProperties.add(source.claim)
        if (source.firstOf) {
          for (const alt of source.firstOf) {
            const altSource = typeof alt === 'string' ? { claim: alt } : alt
            if (altSource.claim) expectedProperties.add(altSource.claim)
          }
        }
      }

      expect(derivedFromRequired, table).toEqual(expectedProperties)
    }
  })
})
