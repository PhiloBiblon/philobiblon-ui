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

// The real stripHtml needs a DOM (see useItemForm.js); the engine only needs
// *a* tag stripper injected, so a regex stand-in is enough here.
function ctx (extra = {}) {
  return { stripHtml: value => value.replace(/<[^>]+>/g, '').trim(), ...extra }
}

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
      await expect(buildLabel(form, snapshot, ctx({ cascadeLabel }))).resolves.toBe('Saavedra, Don Quijote')
      expect(cascadeLabel).not.toHaveBeenCalled()
    })

    it('cascades through P21 to the referenced entity\'s own P247 when P247 is absent (#574)', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue('Saavedra (cascaded)')
      const snapshot = normalizeClaims([
        claim('P21', entityValue('Q1', 'Cervantes')),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, ctx({ cascadeLabel }))).resolves.toBe('Saavedra (cascaded), Don Quijote')
      expect(cascadeLabel).toHaveBeenCalledWith('Q1', 'P247')
    })

    it('falls back to the author\'s own label when the P21 cascade resolves to nothing', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue(null)
      const snapshot = normalizeClaims([
        claim('P21', entityValue('Q1', 'Cervantes')),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, ctx({ cascadeLabel }))).resolves.toBe('Cervantes, Don Quijote')
    })

    it('cascades through P845 (creator) to its own P247 when P247/P21 are absent, and shows the P820 role qualifier', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue('Saavedra (via creator)')
      const snapshot = normalizeClaims([
        claim('P845', entityValue('Q2', 'Person Creator'), { qualifiers: [qualifier('P820', entityValue('Q9', 'editor'))] }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, ctx({ cascadeLabel }))).resolves.toBe('Saavedra (via creator) (editor), Don Quijote')
      expect(cascadeLabel).toHaveBeenCalledWith('Q2', 'P247')
    })

    it('falls back to P845\'s own label when the creator has no P247 (e.g. an organisation), still showing the role qualifier', async () => {
      const cascadeLabel = vi.fn().mockResolvedValue(null)
      const snapshot = normalizeClaims([
        claim('P845', entityValue('Q2', 'Workshop'), { qualifiers: [qualifier('P820', entityValue('Q9', 'printer'))] }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, ctx({ cascadeLabel }))).resolves.toBe('Workshop (printer), Don Quijote')
    })

    it('never attempts the P845 cascade when P845 itself is absent', async () => {
      const cascadeLabel = vi.fn()
      await expect(buildLabel(form, normalizeClaims([claim('P1134', 'Anonymous'), claim('P11', 'Don Quijote')]), ctx({ cascadeLabel })))
        .resolves.toBe('Anonymous, Don Quijote')
      expect(cascadeLabel).not.toHaveBeenCalled()
    })

    it('moves P845 and its role to the end, role lowercased, when the name resolved from elsewhere (#579)', async () => {
      const snapshot = normalizeClaims([
        claim('P247', 'Saavedra'),
        claim('P845', entityValue('Q2', 'Workshop'), { qualifiers: [qualifier('P820', entityValue('Q9', 'Printer'))] }),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, Don Quijote (printer Workshop)')
    })

    it('adds no trailing creator when P845 has no role', async () => {
      const snapshot = normalizeClaims([
        claim('P247', 'Saavedra'),
        claim('P845', entityValue('Q2', 'Workshop')),
        claim('P11', 'Don Quijote')
      ])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, Don Quijote')
    })

    it('falls back to P1134 as the last resort', async () => {
      const snapshot = normalizeClaims([claim('P1134', 'Anonymous'), claim('P11', 'Don Quijote')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Anonymous, Don Quijote')
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
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe(`Saavedra (${expected}), Don Quijote`)
    })

    it('accepts a plain string date', async () => {
      const snapshot = normalizeClaims([claim('P247', 'Saavedra'), claim('P49', '1605'), claim('P11', 'Don Quijote')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra (1605), Don Quijote')
    })
  })

  describe('title and container (#580)', () => {
    it('strips HTML markup from the title', async () => {
      const snapshot = normalizeClaims([claim('P247', 'Saavedra'), claim('P11', 'El <i>Quijote</i> ')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, El Quijote')
    })

    it.each(['Q395111', 'Q395198', 'Q394503', 'Q1815987'])('quotes the title for article-like type %s', async (type) => {
      const snapshot = normalizeClaims([claim('P2', entityValue(type)), claim('P247', 'Saavedra'), claim('P11', 'Un artículo')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, “Un artículo”')
    })

    it('does not quote the title for any other type', async () => {
      const snapshot = normalizeClaims([claim('P2', entityValue('Q1')), claim('P247', 'Saavedra'), claim('P11', 'Un libro')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, Un libro')
    })

    it('keeps a "$" in the title verbatim when quoting it', async () => {
      const snapshot = normalizeClaims([claim('P2', entityValue('Q395111')), claim('P247', 'Saavedra'), claim('P11', 'Cost: $& more')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, “Cost: $& more”')
    })

    it('appends the P64 container, preferring it over the legacy P1137', async () => {
      const snapshot = normalizeClaims([
        claim('P247', 'Saavedra'),
        claim('P11', 'Un artículo'),
        claim('P64', entityValue('Q7', '<i>Revista</i>')),
        claim('P1137', 'Legacy')
      ])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, Un artículo, Revista')
    })

    it('falls back to the legacy P1137 container when P64 is absent', async () => {
      const snapshot = normalizeClaims([claim('P247', 'Saavedra'), claim('P11', 'Un artículo'), claim('P1137', 'Legacy')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('Saavedra, Un artículo, Legacy')
    })

    it('orders date, quoted title, container and trailing creator', async () => {
      const snapshot = normalizeClaims([
        claim('P2', entityValue('Q395111')),
        claim('P247', 'Saavedra'),
        claim('P49', '1605'),
        claim('P11', 'Un artículo'),
        claim('P64', entityValue('Q7', 'Revista')),
        claim('P845', entityValue('Q2', 'Workshop'), { qualifiers: [qualifier('P820', entityValue('Q9', 'Editor'))] })
      ])
      await expect(buildLabel(form, snapshot, ctx()))
        .resolves.toBe('Saavedra (1605), “Un artículo”, Revista (editor Workshop)')
    })

    it('generates no label when the title is only markup', async () => {
      const snapshot = normalizeClaims([claim('P247', 'Saavedra'), claim('P11', '<i></i>')])
      await expect(buildLabel(form, snapshot, ctx())).resolves.toBe('')
    })
  })

  it('generates no label when the title (P11) is missing, even with a resolvable name', async () => {
    await expect(buildLabel(form, normalizeClaims([claim('P247', 'Saavedra')]), ctx())).resolves.toBe('')
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

    it('requires the P820 role on every filled P845, before the plain required properties (#579)', () => {
      const snapshot = normalizeClaims([
        claim('P845', entityValue('Q2', 'Workshop'), {
          qualifiers: [qualifier('P820', entityValue('Q9', 'printer'))],
          claimsValues: [extraValue(entityValue('Q3', 'Other'))]
        })
      ])
      expect(validateItemForm(form, snapshot))
        .toEqual({ code: 'qualifier_value_missing', propertyId: 'P845', qualifierId: 'P820' })
    })

    it('does not ask for a role on an empty P845', () => {
      const snapshot = normalizeClaims([
        claim('P2', entityValue('Q1')),
        claim('P476', 'BETA bibid 1'),
        claim('P247', 'Saavedra'),
        claim('P845', null, { qualifiers: [qualifier('P820', null)] }),
        claim('P11', 'Don Quijote')
      ])
      expect(validateItemForm(form, snapshot)).toBeNull()
    })

    it('reports the name group under P247 when no alternative has a primary value', () => {
      const snapshot = normalizeClaims([claim('P2', entityValue('Q1')), claim('P476', 'BETA bibid 1')])
      expect(validateItemForm(form, snapshot)).toEqual({ code: 'claim_value_missing', propertyId: 'P247' })
    })
  })
})
