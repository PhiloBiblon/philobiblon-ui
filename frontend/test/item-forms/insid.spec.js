import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getRequiredProperties, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim, entityValue } from '../helpers/snapshot.js'

// insid is the pilot table for the #527 migration: exactly two required
// claims with no optional parts, map, conditional, default override, or
// save-time hook -- it exercises the whole pipeline with no special case.

describe('insid item-form (pilot table)', () => {
  const form = getItemForm('insid')

  it('is registered', () => {
    expect(form?.table).toBe('insid')
  })

  it('derives P34 and P297 as required, matching Create.vue:210 (legacy)', () => {
    expect(getRequiredProperties(form)).toEqual({ required: ['P34', 'P297'], groups: [] })
  })

  it('builds "name, region" when both are present', async () => {
    const snapshot = normalizeClaims([claim('P34', 'Institution'), claim('P297', 'Region')])
    await expect(buildLabel(form, snapshot)).resolves.toBe('Institution, Region')
  })

  it('generates no label when either is missing', async () => {
    await expect(buildLabel(form, normalizeClaims([claim('P34', 'Institution')]))).resolves.toBe('')
    await expect(buildLabel(form, normalizeClaims([claim('P297', 'Region')]))).resolves.toBe('')
  })

  it('is invalid until P2, P476, P34 and P297 all have a value', () => {
    const complete = normalizeClaims([
      claim('P2', entityValue('Q1')),
      claim('P476', 'BETA insid 1'),
      claim('P34', 'Institution'),
      claim('P297', 'Region')
    ])
    expect(validateItemForm(form, complete)).toBeNull()

    const missingRegion = normalizeClaims([
      claim('P2', entityValue('Q1')),
      claim('P476', 'BETA insid 1'),
      claim('P34', 'Institution')
    ])
    expect(validateItemForm(form, missingRegion)).toEqual({ code: 'claim_value_missing', propertyId: 'P297' })
  })
})
