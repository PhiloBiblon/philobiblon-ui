import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getDefaultDescription, getRequiredProperties, planDefaultClaims, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim } from '../helpers/snapshot.js'

describe('cnum item-form', () => {
  const form = getItemForm('cnum')

  it('derives P590 and P8 as required', () => {
    expect(getRequiredProperties(form)).toEqual({ required: ['P590', 'P8'], groups: [] })
  })

  it('builds "work, partOf"', async () => {
    const snapshot = normalizeClaims([claim('P590', 'Work'), claim('P8', 'Chapter 1')])
    await expect(buildLabel(form, snapshot)).resolves.toBe('Work, Chapter 1')
  })

  it('is invalid without P8', () => {
    const snapshot = normalizeClaims([claim('P2', { id: 'Q1' }), claim('P476', 'BETA cnum 1'), claim('P590', 'Work')])
    expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P8' })
  })

  it('marks P590 (the work) as not removable', () => {
    const plan = planDefaultClaims(form, { database: 'BETA', table: 'cnum', itemNumber: '1', wikiOrder: {}, now: new Date() })
    expect(plan.overrides.P590).toEqual({ removable: false })
  })

  it('declares a bilingual default description, unlike every other table', () => {
    expect(getDefaultDescription(form)).toEqual({ key: 'item.cnum_description', duplicateInEnglish: true })
    for (const other of ['insid', 'bibid', 'geoid', 'bioid', 'subid', 'texid', 'libid', 'copid', 'manid']) {
      expect(getDefaultDescription(getItemForm(other))).toBeNull()
    }
  })
})
