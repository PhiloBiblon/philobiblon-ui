import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getRequiredProperties, planDefaultClaims, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim, qualifier } from '../helpers/snapshot.js'

describe('copid item-form', () => {
  const form = getItemForm('copid')

  it('derives P329 and P839 as required (position is optional)', () => {
    expect(getRequiredProperties(form)).toEqual({ required: ['P329', 'P839'], groups: [] })
  })

  it('reports P329 first when both are missing -- a deliberate, minor order change from the legacy P839-first check (see copid.js)', () => {
    const snapshot = normalizeClaims([claim('P2', { id: 'Q1' }), claim('P476', 'BETA copid 1')])
    expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P329' })
  })

  it('builds "holding. edition" without a position', async () => {
    const snapshot = normalizeClaims([claim('P329', 'Holding'), claim('P839', 'Edition')])
    await expect(buildLabel(form, snapshot)).resolves.toBe('Holding. Edition')
  })

  it('builds "holding, position. edition" with a direct P10 claim', async () => {
    const snapshot = normalizeClaims([claim('P329', 'Holding'), claim('P10', 'f. 3r'), claim('P839', 'Edition')])
    await expect(buildLabel(form, snapshot)).resolves.toBe('Holding, f. 3r. Edition')
  })

  it('falls back to a P10 qualifier on P329 when there is no direct P10 claim', async () => {
    const snapshot = normalizeClaims([
      claim('P329', 'Holding', { qualifiers: [qualifier('P10', 'f. 3r')] }),
      claim('P839', 'Edition')
    ])
    await expect(buildLabel(form, snapshot)).resolves.toBe('Holding, f. 3r. Edition')
  })

  it('is invalid without P839', () => {
    const snapshot = normalizeClaims([claim('P2', { id: 'Q1' }), claim('P476', 'BETA copid 1'), claim('P329', 'Holding')])
    expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P839' })
  })

  it('marks P839 (the edition) as not removable', () => {
    const plan = planDefaultClaims(form, { database: 'BETA', table: 'copid', itemNumber: '1', wikiOrder: {}, now: new Date() })
    expect(plan.overrides.P839).toEqual({ removable: false })
  })
})
