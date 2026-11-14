import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getRequiredProperties, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim } from '../helpers/snapshot.js'

// texid ("author, title") and libid ("name, location") share the same
// two-required-properties-with-a-comma shape as insid -- covered together
// since neither has any special case beyond which two properties.
describe.each([
  ['texid', 'P21', 'P11'],
  ['libid', 'P34', 'P47']
])('%s item-form', (table, firstProp, secondProp) => {
  const form = getItemForm(table)

  it(`derives ${firstProp} and ${secondProp} as required, in that order`, () => {
    expect(getRequiredProperties(form)).toEqual({ required: [firstProp, secondProp], groups: [] })
  })

  it('builds "first, second" when both are present', async () => {
    const snapshot = normalizeClaims([claim(firstProp, 'First'), claim(secondProp, 'Second')])
    await expect(buildLabel(form, snapshot)).resolves.toBe('First, Second')
  })

  it('generates no label when either is missing', async () => {
    await expect(buildLabel(form, normalizeClaims([claim(firstProp, 'First')]))).resolves.toBe('')
    await expect(buildLabel(form, normalizeClaims([claim(secondProp, 'Second')]))).resolves.toBe('')
  })

  it(`is invalid without ${secondProp}`, () => {
    const snapshot = normalizeClaims([claim('P2', { id: 'Q1' }), claim('P476', `BETA ${table} 1`), claim(firstProp, 'First')])
    expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: secondProp })
  })
})
