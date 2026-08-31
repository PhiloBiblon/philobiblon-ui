import { describe, expect, it, vi } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { buildLabel, getRequiredProperties, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim, entityValue, extraValue, qualifier, timeValue } from '../helpers/snapshot.js'

// bibid is the second table migrated (before the remaining eight), on
// purpose: its name is a fallback chain across FOUR properties, two of
// which (P21, P845) need an async cascadeThrough lookup through a
// different entity entirely (#574) -- this proves the async primitive
// works before anything else leans on it.

describe('bibid item-form', () => {
  const form = getItemForm('bibid')

  it('is registered', () => {
    expect(form?.table).toBe('bibid')
  })

  it('derives the name fallback chain as an "at least one of" group, dropping both cascade alternatives, plus P11 as required', () => {
    expect(getRequiredProperties(form)).toEqual({
      required: ['P11'],
      groups: [{ properties: ['P247', 'P21', 'P845', 'P1134'], reportAs: 'P247' }]
    })
  })

  describe('name resolution (fallback chain)', () => {
    it('prefers a direct P247 over everything else, and never calls either cascade', async () => {
      const cascadeLabel = vi.fn()
      const snapshot = normalizeClaims([
        claim('P247', 'Saavedra'),
        claim('P21', entityValue('Q1', 'Cervantes')),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, { cascadeLabel })).resolves.toBe('Saavedra, Don Quijote')
      expect(cascadeLabel).not.toHaveBeenCalled()
    })

    it('cascades through P21 to the referenced entity\'s own P247 when P247 is absent (#574)', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue('Saavedra (cascaded)')
      const snapshot = normalizeClaims([
        claim('P21', entityValue('Q1', 'Cervantes')),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, { cascadeLabel })).resolves.toBe('Saavedra (cascaded), Don Quijote')
      expect(cascadeLabel).toHaveBeenCalledWith('Q1', 'P247')
    })

    it('falls back to the author\'s own label when the P21 cascade resolves to nothing', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue(null)
      const snapshot = normalizeClaims([
        claim('P21', entityValue('Q1', 'Cervantes')),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, { cascadeLabel })).resolves.toBe('Cervantes, Don Quijote')
    })

    it('cascades through P845 (creator) to its own P247 when P247/P21 are absent, and shows the P820 role qualifier', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue('Saavedra (via creator)')
      const snapshot = normalizeClaims([
        claim('P845', entityValue('Q2', 'Person Creator'), { qualifiers: [qualifier('P820', entityValue('Q9', 'editor'))] }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, { cascadeLabel })).resolves.toBe('Saavedra (via creator) (editor), Don Quijote')
      expect(cascadeLabel).toHaveBeenCalledWith('Q2', 'P247')
    })

    it('falls back to P845\'s own label when the creator has no P247 (e.g. an organisation), still showing the role qualifier', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue(null)
      const snapshot = normalizeClaims([
        claim('P845', entityValue('Q2', 'Workshop'), { qualifiers: [qualifier('P820', entityValue('Q9', 'printer'))] }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, { cascadeLabel })).resolves.toBe('Workshop (printer), Don Quijote')
    })

    it('never attempts the P845 cascade when P845 itself is absent', async () => {
      const cascadeLabel = vi.fn()
      await expect(buildLabel(form, normalizeClaims([claim('P1134', 'Anonymous'), claim('P11', 'Don Quijote')]), { cascadeLabel }))
        .resolves.toBe('Anonymous, Don Quijote')
      expect(cascadeLabel).not.toHaveBeenCalled()
    })

    it('does NOT show a role qualifier when the name resolved from P247 (not P845)', async () => {
      const snapshot = normalizeClaims([
        claim('P247', 'Saavedra'),
        claim('P845', entityValue('Q2', 'Workshop'), { qualifiers: [qualifier('P820', entityValue('Q9', 'printer'))] }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Saavedra, Don Quijote')
    })

    it('falls back to P1134 as the last resort', async () => {
      const snapshot = normalizeClaims([claim('P1134', 'Anonymous'), claim('P11', 'Don Quijote')])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Anonymous, Don Quijote')
    })
  })

  describe('P49 (date) at each precision, and as a plain string', () => {
    it.each([
      [11, '+1605-01-16T00:00:00Z', '1605-01-16'],
      [10, '+1605-01-16T00:00:00Z', '1605-01'],
      [9, '+1605-01-16T00:00:00Z', '1605']
    ])('precision %i', async (precision, time, expected) => {
      const snapshot = normalizeClaims([
        claim('P247', 'Saavedra'),
        claim('P49', timeValue(time, precision), { datatype: 'time' }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot)).resolves.toBe(`Saavedra (${expected}), Don Quijote`)
    })

    it('accepts a plain string date', async () => {
      const snapshot = normalizeClaims([claim('P247', 'Saavedra'), claim('P49', '1605'), claim('P11', 'Don Quijote')])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Saavedra (1605), Don Quijote')
    })
  })

  it('generates no label when the title (P11) is missing, even with a resolvable name', async () => {
    await expect(buildLabel(form, normalizeClaims([claim('P247', 'Saavedra')]))).resolves.toBe('')
  })

  describe('validateItemForm', () => {
    it('the name group only inspects each candidate\'s primary value, not claimsValues (matches the legacy [0]-only check)', () => {
      const snapshot = normalizeClaims([
        claim('P2', entityValue('Q1')),
        claim('P476', 'BETA bibid 1'),
        // P247's primary slot is empty; a repeated (claimsValues) entry does NOT satisfy the group.
        claim('P247', null, { claimsValues: [extraValue('Saavedra')] }),
        claim('P11', 'Don Quijote')
      ])
      expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P247' })
    })

    it('reports the name group under P247 when no alternative has a primary value', () => {
      const snapshot = normalizeClaims([claim('P2', entityValue('Q1')), claim('P476', 'BETA bibid 1')])
      expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P247' })
    })
  })
})
