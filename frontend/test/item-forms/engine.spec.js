import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_CLAIMS_ALLOWLIST,
  GLOBAL_REQUIRED_PROPERTIES,
  applyClaimOverride,
  applyExtraClaimsOnSave,
  buildLabel,
  computePropertyOrder,
  getAliasValues,
  getBibliographyClaimValue,
  getDefaultDescription,
  getQualifierPropertyIds,
  getRequiredProperties,
  planDefaultClaims,
  validateItemForm
} from '~/service/item-forms/engine.js'
import { entry, snapshot } from '../helpers/snapshot.js'

// Small inline fixture forms — exercise the engine's mechanics in isolation
// from the real table modules (those get their own parity suite once all 10
// are registered).

const twoRequiredForm = {
  table: 'fixture-two-required',
  label: {
    parts: [
      { source: { claim: 'P34' }, required: true },
      { source: { claim: 'P297' }, required: true, separator: ', ' }
    ]
  }
}

const groupForm = {
  table: 'fixture-group',
  label: {
    parts: [
      { id: 'name', source: { firstOf: ['P247', 'P21'] }, required: true },
      { source: { claim: 'P11' }, required: true, separator: ', ' }
    ]
  }
}

describe('getRequiredProperties', () => {
  it('derives single required properties in label-part order', () => {
    expect(getRequiredProperties(twoRequiredForm)).toEqual({ required: ['P34', 'P297'], groups: [] })
  })

  it('ignores non-required parts', () => {
    const form = { table: 'x', label: { parts: [{ source: { claim: 'P1' }, required: false }] } }
    expect(getRequiredProperties(form)).toEqual({ required: [], groups: [] })
  })

  it('derives an "at least one of" group from a required firstOf part, reportAs the first property', () => {
    expect(getRequiredProperties(groupForm)).toEqual({
      required: ['P11'],
      groups: [{ properties: ['P247', 'P21'], reportAs: 'P247' }]
    })
  })

  it('drops a cascadeThrough alternative from the derived group (it rides on its sibling claim entry)', () => {
    const form = {
      table: 'fixture-cascade',
      label: {
        parts: [{ id: 'name', source: { firstOf: ['P247', { cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }, 'P21'] }, required: true }]
      }
    }
    expect(getRequiredProperties(form).groups).toEqual([{ properties: ['P247', 'P21'], reportAs: 'P247' }])
  })

  it('throws for a required part with a non-derivable source', () => {
    const form = { table: 'fixture-bad', label: { parts: [{ source: { cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }, required: true }] } }
    expect(() => getRequiredProperties(form)).toThrow(/non-derivable/)
  })

  it('throws for a required firstOf with no claim alternative at all', () => {
    const form = {
      table: 'fixture-bad-group',
      label: {
        parts: [{
          source: { firstOf: [{ cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }] },
          required: true
        }]
      }
    }
    expect(() => getRequiredProperties(form)).toThrow(/no derivable claim source/)
  })
})

describe('buildLabel', () => {
  it('joins required parts with their own separators', async () => {
    const snap = snapshot({ P34: entry('Q1', 'Barcelona'), P297: entry('Q2', 'Catalonia') })
    await expect(buildLabel(twoRequiredForm, snap)).resolves.toBe('Barcelona, Catalonia')
  })

  it('returns "" (does not partially generate) when a required part is missing', async () => {
    const snap = snapshot({ P34: entry('Q1', 'Barcelona') })
    await expect(buildLabel(twoRequiredForm, snap)).resolves.toBe('')
  })

  it('silently omits an optional part that has no value, without a stray separator', async () => {
    const form = {
      table: 'fixture-optional',
      label: {
        parts: [
          { source: { claim: 'P34' }, required: true },
          { source: { claim: 'P297' }, required: false, separator: ', ' }
        ]
      }
    }
    await expect(buildLabel(form, snapshot({ P34: entry('Q1', 'Barcelona') }))).resolves.toBe('Barcelona')
  })

  it('applies wrap after format/map resolution', async () => {
    const form = {
      table: 'fixture-wrap',
      label: { parts: [{ source: { claim: 'P1' }, required: true, wrap: '(%s)' }] }
    }
    await expect(buildLabel(form, snapshot({ P1: entry('Q1', 'x') }))).resolves.toBe('(x)')
  })

  it('applies a map with mapFallback for an unmapped value, and omits an optional part entirely when absent', async () => {
    const form = {
      table: 'fixture-map',
      label: { parts: [{ source: { claim: 'P2' }, required: false, map: { Q15: 'MS: ' }, mapFallback: '' }, { source: { claim: 'P329' }, required: true }] }
    }
    await expect(buildLabel(form, snapshot({ P2: entry('Q99', 'Other'), P329: entry('Q1', 'Holding') }))).resolves.toBe('Holding')
    await expect(buildLabel(form, snapshot({ P329: entry('Q1', 'Holding') }))).resolves.toBe('Holding')
    await expect(buildLabel(form, snapshot({ P2: entry('Q15', 'MS'), P329: entry('Q1', 'Holding') }))).resolves.toBe('MS: Holding')
  })

  it('skips a part gated by a false `when`, without resolving its source', async () => {
    const cascadeLabel = vi.fn()
    const form = {
      table: 'fixture-when',
      label: {
        parts: [
          { id: 'name', source: { claim: 'P247' }, required: true },
          { source: { claim: 'P820' }, required: false, when: { partResolvedFrom: { part: 'name', property: 'P845' } } }
        ]
      }
    }
    const snap = snapshot({ P247: entry('Q1', 'Surname'), P820: entry('Q2', 'Role') })
    await expect(buildLabel(form, snap, { cascadeLabel })).resolves.toBe('Surname')
    expect(cascadeLabel).not.toHaveBeenCalled()
  })
})

describe('validateItemForm', () => {
  it('returns null when every requirement is satisfied', () => {
    const snap = snapshot({ P2: entry('Q1'), P476: entry('BETA insid 1'), P34: entry('x'), P297: entry('y') })
    expect(validateItemForm(twoRequiredForm, snap)).toBeNull()
  })

  it('checks groups before conditionalRequirements, before globals+derived, before the P799 rule', () => {
    const form = {
      table: 'fixture-order',
      label: { parts: [{ id: 'name', source: { firstOf: ['P247', 'P21'] }, required: true }, { source: { claim: 'P11' }, required: true, separator: ', ' }] },
      conditionalRequirements: [{ when: { claimHasValue: { property: 'P2', anyOf: ['Q20'] } }, require: 'P843' }]
    }
    // Nothing at all filled in: the group failure (bibid name) must win over
    // both the conditional (P2 isn't even Q20 here) and the P11/global checks.
    expect(validateItemForm(form, snapshot({}))).toEqual({ code: 'claim_value_missing', propertyId: 'P247' })

    // Group satisfied, P2=Q20 but P843 missing: conditional wins over P11/globals.
    const snap2 = snapshot({ P247: entry('Q1'), P2: entry('Q20') })
    expect(validateItemForm(form, snap2)).toEqual({ code: 'claim_value_missing', propertyId: 'P843' })

    // Group + conditional satisfied, P476 (a global) still missing: globals surface before P11.
    const snap3 = snapshot({ P247: entry('Q1'), P2: entry('Q20'), P843: entry('Q1') })
    expect(validateItemForm(form, snap3)).toEqual({ code: 'claim_value_missing', propertyId: 'P476' })
  })

  it('reports GLOBAL_REQUIRED_PROPERTIES (P2, P476) even when the table label recipe never uses them', () => {
    expect(GLOBAL_REQUIRED_PROPERTIES).toEqual(['P2', 'P476'])
    const snap = snapshot({ P34: entry('x'), P297: entry('y') })
    expect(validateItemForm(twoRequiredForm, snap)).toEqual({ code: 'claim_value_missing', propertyId: 'P2' })
  })

  it('flags an incomplete P799 date (month/year precision) after every required field is satisfied', () => {
    const snap = snapshot({
      P2: entry('Q1'), P476: entry('x'), P34: entry('x'), P297: entry('y'),
      P799: entry('Q447226', 'x', { P106: [entry({ time: '+2020-01-01T00:00:00Z', precision: 10 })] })
    })
    expect(validateItemForm(twoRequiredForm, snap)).toEqual({ code: 'incomplete_date', propertyId: 'P799' })
  })

  it('does not flag P799 when its own value is empty (a default/unfilled row)', () => {
    const snap = snapshot({ P2: entry('Q1'), P476: entry('x'), P34: entry('x'), P297: entry('y'), P799: entry(null, null) })
    expect(validateItemForm(twoRequiredForm, snap)).toBeNull()
  })

  it('accepts a P799 date given as a complete ISO string qualifier', () => {
    const snap = snapshot({
      P2: entry('Q1'), P476: entry('x'), P34: entry('x'), P297: entry('y'),
      P799: entry('Q447226', 'x', { P106: [entry('2020-01-01')] })
    })
    expect(validateItemForm(twoRequiredForm, snap)).toBeNull()
  })
})

describe('getDefaultDescription', () => {
  it('returns the form\'s description config, or null when absent', () => {
    expect(getDefaultDescription({ description: { key: 'item.cnum_description', duplicateInEnglish: true } }))
      .toEqual({ key: 'item.cnum_description', duplicateInEnglish: true })
    expect(getDefaultDescription({})).toBeNull()
  })
})

describe('applyExtraClaimsOnSave', () => {
  const manidLikeForm = {
    table: 'fixture-manid',
    extraClaimsOnSave: [{
      when: { all: [{ claimHasValue: { property: 'P2', anyOf: ['Q20'] } }, { claimPresent: 'P843' }] },
      add: { property: 'P843', value: 'Q453706' }
    }]
  }

  it('adds the extra value when the condition holds and it is not already present', () => {
    const cleaned = { P2: [{ value: 'Q20' }], P843: [{ value: 'Q453705' }] }
    applyExtraClaimsOnSave(manidLikeForm, cleaned)
    expect(cleaned.P843.map(c => c.value)).toEqual(['Q453705', 'Q453706'])
  })

  it('is idempotent when the extra value is already present', () => {
    const cleaned = { P2: [{ value: 'Q20' }], P843: [{ value: 'Q453705' }, { value: 'Q453706' }] }
    applyExtraClaimsOnSave(manidLikeForm, cleaned)
    expect(cleaned.P843.map(c => c.value)).toEqual(['Q453705', 'Q453706'])
  })

  it('does nothing when P843 is absent (cleanClaims already dropped the empty row)', () => {
    const cleaned = { P2: [{ value: 'Q20' }] }
    applyExtraClaimsOnSave(manidLikeForm, cleaned)
    expect(cleaned).toEqual({ P2: [{ value: 'Q20' }] })
  })

  it('does nothing for P2 = manuscript (Q15)', () => {
    const cleaned = { P2: [{ value: 'Q15' }], P843: [{ value: 'Q453705' }] }
    applyExtraClaimsOnSave(manidLikeForm, cleaned)
    expect(cleaned.P843.map(c => c.value)).toEqual(['Q453705'])
  })

  it('returns the input untouched (same reference) for a table with no extraClaimsOnSave', () => {
    const cleaned = { P2: [{ value: 'Q20' }], P843: [{ value: 'Q453705' }] }
    const result = applyExtraClaimsOnSave({ table: 'insid' }, cleaned)
    expect(result).toBe(cleaned)
    expect(cleaned.P843).toEqual([{ value: 'Q453705' }])
  })
})

describe('getAliasValues', () => {
  const aliasForm = {
    table: 'fixture-alias',
    aliases: [{ source: { anyOf: [{ claim: 'P10' }, { qualifier: { of: 'P329', id: 'P10' } }] } }]
  }

  it('resolves from the direct claim when present', async () => {
    const snap = snapshot({ P10: entry('MS 1', 'MS 1') })
    await expect(getAliasValues(aliasForm, snap)).resolves.toEqual(['MS 1'])
  })

  it('falls back to the qualifier when the direct claim is absent', async () => {
    const snap = snapshot({ P329: entry('Q1', 'Library', { P10: [entry('MS 2', 'MS 2')] }) })
    await expect(getAliasValues(aliasForm, snap)).resolves.toEqual(['MS 2'])
  })

  it('resolves to [] when neither is present, and for a table with no aliases hook', async () => {
    await expect(getAliasValues(aliasForm, snapshot({}))).resolves.toEqual([])
    await expect(getAliasValues({ table: 'insid' }, snapshot({ P10: entry('MS 1', 'MS 1') }))).resolves.toEqual([])
  })
})

describe('getBibliographyClaimValue', () => {
  it('maps each bibliography to its Q-id', () => {
    expect(getBibliographyClaimValue('BETA')).toEqual({ id: 'Q254471' })
    expect(getBibliographyClaimValue('BITECA')).toEqual({ id: 'Q256810' })
    expect(getBibliographyClaimValue('BITAGAP')).toEqual({ id: 'Q256809' })
  })

  it('returns null for an unknown bibliography', () => {
    expect(getBibliographyClaimValue('NOPE')).toBeNull()
  })
})

describe('computePropertyOrder / getQualifierPropertyIds', () => {
  it('puts P476/P131 first (in that order) when the wiki order omits them, P799 always trailing', () => {
    expect(computePropertyOrder({ P34: [], P297: [] })).toEqual(['P476', 'P131', 'P34', 'P297', 'P799'])
  })

  it('respects the wiki-declared position when a property is already listed there', () => {
    expect(computePropertyOrder({ P131: [], P34: [] })).toEqual(['P476', 'P131', 'P34', 'P799'])
  })

  it('never duplicates P799 when the wiki order already lists it', () => {
    expect(computePropertyOrder({ P34: [], P799: ['P106'] })).toEqual(['P476', 'P131', 'P34', 'P799'])
  })

  it('collects unique qualifier property ids, always including P700 and P106', () => {
    expect(getQualifierPropertyIds({ P329: ['P1054', 'P10'], P799: ['P106'] }))
      .toEqual(['P700', 'P106', 'P1054', 'P10'])
  })
})

describe('planDefaultClaims', () => {
  const now = new Date('2020-01-05T12:00:00Z')

  it('plans the three global overrides (PBID, bibliography, hidden creation-date qualifier)', () => {
    const plan = planDefaultClaims({ table: 'insid' }, { database: 'BETA', table: 'insid', itemNumber: '41', wikiOrder: { P34: [] }, now })
    expect(plan.overrides.P476).toEqual({ value: 'BETA insid 42', removable: false, replaceQualifiers: true })
    expect(plan.overrides.P131).toMatchObject({ value: { id: 'Q254471' }, replaceQualifiers: true })
    expect(plan.overrides.P131.qualifiers.P700.value).toEqual({ id: 'Q447226' })
    expect(plan.overrides.P799.qualifiers.P106).toEqual({
      value: { time: '+2020-01-05T00:00:00Z', precision: 11, calendar: 'gregorian' },
      hidden: true
    })
  })

  it('merges a table\'s own defaultClaims on top of the globals (geoid/bioid hidden P799 value)', () => {
    const form = { table: 'geoid', defaultClaims: { P799: { value: { id: 'Q447227' }, hidden: true } } }
    const plan = planDefaultClaims(form, { database: 'BETA', table: 'geoid', itemNumber: '1', wikiOrder: {}, now })
    expect(plan.overrides.P799.value).toEqual({ id: 'Q447227' })
    expect(plan.overrides.P799.hidden).toBe(true)
    // the global hidden P106 qualifier survives the merge
    expect(plan.overrides.P799.qualifiers.P106.hidden).toBe(true)
  })

  it('sets removable: false only where a table\'s own defaultClaims says so', () => {
    const cnumPlan = planDefaultClaims({ table: 'cnum', defaultClaims: { P590: { removable: false } } }, { database: 'BETA', table: 'cnum', itemNumber: '1', wikiOrder: {}, now })
    expect(cnumPlan.overrides.P590).toEqual({ removable: false })
    const insidPlan = planDefaultClaims({ table: 'insid' }, { database: 'BETA', table: 'insid', itemNumber: '1', wikiOrder: {}, now })
    expect(insidPlan.overrides.P590).toBeUndefined()
  })

  it('throws when defaultClaims uses a key outside the allowlist', () => {
    expect(DEFAULT_CLAIMS_ALLOWLIST).toEqual(['P476', 'P131', 'P799', 'P590', 'P839'])
    const form = { table: 'fixture-bad', defaultClaims: { P34: { value: 'x' } } }
    expect(() => planDefaultClaims(form, { database: 'BETA', table: 'fixture-bad', itemNumber: '1', wikiOrder: {}, now }))
      .toThrow(/allowlist|P34/)
  })
})

describe('applyClaimOverride', () => {
  function makeClaim (qualifiers = []) {
    return { value: { datavalue: { value: null } }, qualifiers, hidden: false, removable: true }
  }

  it('sets value, hidden, and removable', () => {
    const claim = applyClaimOverride(makeClaim(), { value: { id: 'Q1' }, hidden: true, removable: false }, () => null)
    expect(claim.value.datavalue.value).toEqual({ id: 'Q1' })
    expect(claim.hidden).toBe(true)
    expect(claim.removable).toBe(false)
  })

  it('updates an existing qualifier in place', () => {
    const claim = makeClaim([{ property: { id: 'P106' }, datavalue: { value: null } }])
    applyClaimOverride(claim, { qualifiers: { P106: { value: 'x', hidden: true } } }, () => null)
    expect(claim.qualifiers).toHaveLength(1)
    expect(claim.qualifiers[0].datavalue.value).toBe('x')
    expect(claim.qualifiers[0].hidden).toBe(true)
  })

  it('creates a missing qualifier via createQualifier', () => {
    const createQualifier = vi.fn(id => ({ property: { id }, datavalue: { value: null } }))
    const claim = applyClaimOverride(makeClaim(), { qualifiers: { P106: { value: 'x' } } }, createQualifier)
    expect(createQualifier).toHaveBeenCalledWith('P106')
    expect(claim.qualifiers).toHaveLength(1)
  })

  it('skips a qualifier override when createQualifier can\'t build one', () => {
    const claim = applyClaimOverride(makeClaim(), { qualifiers: { P106: { value: 'x' } } }, () => null)
    expect(claim.qualifiers).toHaveLength(0)
  })

  it('replaceQualifiers discards existing qualifiers before applying the override (P131 vs P799 semantics)', () => {
    const claim = makeClaim([{ property: { id: 'P999' }, datavalue: { value: 'keep-me' } }])
    applyClaimOverride(claim, { qualifiers: { P700: { value: { id: 'Q447226' } } }, replaceQualifiers: true }, id => ({ property: { id }, datavalue: { value: null } }))
    expect(claim.qualifiers.map(q => q.property.id)).toEqual(['P700'])
  })

  it('replaceQualifiers clears qualifiers even without a qualifiers override to merge in (P476 semantics)', () => {
    const claim = makeClaim([{ property: { id: 'P999' }, datavalue: { value: 'keep-me' } }])
    applyClaimOverride(claim, { value: 'BETA insid 42', replaceQualifiers: true }, () => null)
    expect(claim.qualifiers).toEqual([])
  })

  it('returns the claim unchanged for a nullish override', () => {
    const claim = makeClaim()
    expect(applyClaimOverride(claim, null, () => null)).toBe(claim)
  })
})
