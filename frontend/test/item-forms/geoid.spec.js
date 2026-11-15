import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getRequiredProperties, planDefaultClaims, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim } from '../helpers/snapshot.js'

describe('geoid item-form', () => {
  const form = getItemForm('geoid')

  it('derives only P34 as required -- P297 is optional here, unlike insid', () => {
    expect(getRequiredProperties(form)).toEqual({ required: ['P34'], groups: [] })
  })

  it('builds "name, region" when both are present, and just "name" when P297 is absent', async () => {
    const withRegion = normalizeClaims([claim('P34', 'Barcelona'), claim('P297', 'Catalonia')])
    await expect(buildLabel(form, withRegion)).resolves.toBe('Barcelona, Catalonia')

    const withoutRegion = normalizeClaims([claim('P34', 'Barcelona')])
    await expect(buildLabel(form, withoutRegion)).resolves.toBe('Barcelona')
  })

  it('is invalid without P34, valid without P297', () => {
    const base = [claim('P2', { id: 'Q1' }), claim('P476', 'BETA geoid 1')]
    expect(validateItemForm(form, normalizeClaims(base))).toEqual({ code: 'claim_value_missing', propertyId: 'P34' })
    expect(validateItemForm(form, normalizeClaims([...base, claim('P34', 'Barcelona')]))).toBeNull()
  })

  it('defaults P799 to hidden with value Q447227', () => {
    const plan = planDefaultClaims(form, { database: 'BETA', table: 'geoid', itemNumber: '1', wikiOrder: {}, now: new Date() })
    expect(plan.overrides.P799.value).toEqual({ id: 'Q447227' })
    expect(plan.overrides.P799.hidden).toBe(true)
  })
})
