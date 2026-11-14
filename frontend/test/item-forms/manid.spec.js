import { describe, expect, it } from 'vitest'
import { getItemForm } from '~/service/item-forms/index.js'
import { applyExtraClaimsOnSave, buildLabel, getAliasValues, getRequiredProperties, validateItemForm } from '~/service/item-forms/engine.js'
import { normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim, entityValue, qualifier } from '../helpers/snapshot.js'

describe('manid item-form', () => {
  const form = getItemForm('manid')

  it('derives only P329 as required from the label recipe (P2/P843 come from other mechanisms)', () => {
    expect(getRequiredProperties(form)).toEqual({ required: ['P329'], groups: [] })
  })

  describe('label', () => {
    it('builds the bare holding with no prefix/collection/position', async () => {
      await expect(buildLabel(form, normalizeClaims([claim('P329', 'Holding')]))).resolves.toBe('Holding')
    })

    it('prefixes "MS: " for Q15 and "Ed.: " for Q20', async () => {
      const ms = normalizeClaims([claim('P2', entityValue('Q15')), claim('P329', 'Holding')])
      await expect(buildLabel(form, ms)).resolves.toBe('MS: Holding')

      const ed = normalizeClaims([claim('P2', entityValue('Q20')), claim('P329', 'Holding')])
      await expect(buildLabel(form, ed)).resolves.toBe('Ed.: Holding')
    })

    it('adds no prefix for an unmapped P2 value, and no stray punctuation', async () => {
      const snapshot = normalizeClaims([claim('P2', entityValue('Q99')), claim('P329', 'Holding')])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Holding')
    })

    it('shows the collection from a direct P1054 claim', async () => {
      const snapshot = normalizeClaims([claim('P329', 'Holding'), claim('P1054', 'Collection')])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Holding (Collection)')
    })

    it('falls back to a P1054 qualifier on P329 when there is no direct claim', async () => {
      const snapshot = normalizeClaims([claim('P329', 'Holding', { qualifiers: [qualifier('P1054', 'Collection')] })])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Holding (Collection)')
    })

    it('prefers the direct P1054 claim over the P329 qualifier when both are present', async () => {
      const snapshot = normalizeClaims([
        claim('P329', 'Holding', { qualifiers: [qualifier('P1054', 'Qualifier Collection')] }),
        claim('P1054', 'Direct Collection')
      ])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Holding (Direct Collection)')
    })

    it('combines prefix, collection and position', async () => {
      const snapshot = normalizeClaims([
        claim('P2', entityValue('Q20')),
        claim('P329', 'Holding'),
        claim('P1054', 'Collection'),
        claim('P10', 'f. 3r')
      ])
      await expect(buildLabel(form, snapshot)).resolves.toBe('Ed.: Holding (Collection), f. 3r')
    })
  })

  describe('validation', () => {
    it('requires P843 only when P2 is an edition (Q20)', () => {
      const base = [claim('P2', entityValue('Q20')), claim('P476', 'BETA manid 1'), claim('P329', 'Holding')]
      expect(validateItemForm(form, normalizeClaims(base))).toEqual({ code: 'claim_value_missing', propertyId: 'P843' })

      const manuscript = [claim('P2', entityValue('Q15')), claim('P476', 'BETA manid 1'), claim('P329', 'Holding')]
      expect(validateItemForm(form, normalizeClaims(manuscript))).toBeNull()
    })

    it('the P843 conditional error surfaces before the P329 required error (matches the legacy check order)', () => {
      const snapshot = normalizeClaims([claim('P2', entityValue('Q20'))])
      expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P843' })
    })

    it('is satisfied for an edition with P843 filled in', () => {
      const snapshot = normalizeClaims([
        claim('P2', entityValue('Q20')), claim('P476', 'BETA manid 1'),
        claim('P329', 'Holding'), claim('P843', entityValue('Q453705'))
      ])
      expect(validateItemForm(form, snapshot)).toBeNull()
    })
  })

  describe('extraClaimsOnSave (Q453706 injection)', () => {
    it('adds Q453706 alongside the wiki default for an edition with P843 set', () => {
      const cleaned = { P2: [{ value: 'Q20' }], P843: [{ value: 'Q453705' }] }
      applyExtraClaimsOnSave(form, cleaned)
      expect(cleaned.P843.map(c => c.value)).toEqual(['Q453705', 'Q453706'])
    })

    it('does nothing for a manuscript (Q15)', () => {
      const cleaned = { P2: [{ value: 'Q15' }], P843: [{ value: 'Q453705' }] }
      applyExtraClaimsOnSave(form, cleaned)
      expect(cleaned.P843.map(c => c.value)).toEqual(['Q453705'])
    })
  })

  describe('aliases (P10 shelfmark, #571)', () => {
    it('resolves from a direct P10 claim', async () => {
      const snapshot = normalizeClaims([claim('P10', 'f. 3r')])
      await expect(getAliasValues(form, snapshot)).resolves.toEqual(['f. 3r'])
    })

    it('falls back to the P10 qualifier on P329', async () => {
      const snapshot = normalizeClaims([claim('P329', 'Holding', { qualifiers: [qualifier('P10', 'f. 3r')] })])
      await expect(getAliasValues(form, snapshot)).resolves.toEqual(['f. 3r'])
    })

    it('resolves to [] when P10 is absent', async () => {
      await expect(getAliasValues(form, normalizeClaims([claim('P329', 'Holding')]))).resolves.toEqual([])
    })
  })
})

describe('copid item-form aliases (P10 shelfmark, shared mechanism with manid)', () => {
  it('resolves the same way as manid', async () => {
    const form = getItemForm('copid')
    const snapshot = normalizeClaims([claim('P10', 'f. 3r')])
    await expect(getAliasValues(form, snapshot)).resolves.toEqual(['f. 3r'])
  })
})
