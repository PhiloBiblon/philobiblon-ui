import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getRequiredProperties, planDefaultClaims, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim } from '../helpers/snapshot.js'

// bioid and subid share the exact same recipe (a single required P34), the
// only difference being bioid's hidden Q447227 P799 default -- covered
// together to make that similarity, and that one difference, explicit.
describe.each([
  ['bioid', true],
  ['subid', false]
])('%s item-form', (table, hasHiddenP799Default) => {
  const form = getItemForm(table)

  it('derives P34 as the only required property', () => {
    expect(getRequiredProperties(form)).toEqual({ required: ['P34'], groups: [] })
  })

  it('builds the label as just the P34 value', async () => {
    await expect(buildLabel(form, normalizeClaims([claim('P34', 'Cervantes')]))).resolves.toBe('Cervantes')
  })

  it('generates no label without P34', async () => {
    await expect(buildLabel(form, normalizeClaims([]))).resolves.toBe('')
  })

  it('is invalid without P34', () => {
    const snapshot = normalizeClaims([claim('P2', { id: 'Q1' }), claim('P476', `BETA ${table} 1`)])
    expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P34' })
  })

  it(`${hasHiddenP799Default ? 'defaults' : 'does not default'} P799 to a hidden Q447227`, () => {
    const plan = planDefaultClaims(form, { database: 'BETA', table, itemNumber: '1', wikiOrder: {}, now: new Date() })
    if (hasHiddenP799Default) {
      expect(plan.overrides.P799.value).toEqual({ id: 'Q447227' })
      expect(plan.overrides.P799.hidden).toBe(true)
    } else {
      expect(plan.overrides.P799.value).toBeUndefined()
      expect(plan.overrides.P799.hidden).toBeUndefined()
    }
  })
})
