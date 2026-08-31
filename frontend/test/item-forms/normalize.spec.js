import { describe, expect, it } from 'vitest'
import { getEntry, getQualifierEntry, hasValue, normalizeClaims } from '~/service/item-forms/normalize.js'
import { claim, entityValue, extraValue, qualifier, timeValue } from '../helpers/snapshot.js'

describe('normalizeClaims', () => {
  it('normalizes a plain string claim', () => {
    const snapshot = normalizeClaims([claim('P11', 'Don Quijote')])
    expect(getEntry(snapshot, 'P11')).toEqual({ raw: 'Don Quijote', text: 'Don Quijote', qualifiers: {} })
  })

  it('normalizes an entity claim to its id (raw) and label (text)', () => {
    const snapshot = normalizeClaims([claim('P21', entityValue('Q1', 'Cervantes'))])
    expect(getEntry(snapshot, 'P21')).toMatchObject({ raw: 'Q1', text: 'Cervantes' })
  })

  it('falls back through label -> text -> long-form date -> id for an entity with no label', () => {
    const snapshot = normalizeClaims([claim('P21', { id: 'Q1' })])
    expect(getEntry(snapshot, 'P21').text).toBe('Q1')
  })

  it('formats a time-valued claim as a long-form date for its text, but keeps the raw time object', () => {
    const snapshot = normalizeClaims([claim('P49', timeValue('+2020-01-05T00:00:00Z'), { datatype: 'time' })])
    const entry = getEntry(snapshot, 'P49')
    expect(entry.text).toBe('January 5, 2020')
    expect(entry.raw).toEqual(timeValue('+2020-01-05T00:00:00Z'))
  })

  it('does NOT apply time formatting to a qualifier value (asymmetry with claims, preserved on purpose)', () => {
    const snapshot = normalizeClaims([
      claim('P799', entityValue('Q1'), { qualifiers: [qualifier('P106', timeValue('+2020-01-05T00:00:00Z'))] })
    ])
    const qEntry = getQualifierEntry(snapshot, 'P799', 'P106')
    expect(qEntry.text).toBeUndefined()
    expect(qEntry.raw).toEqual(timeValue('+2020-01-05T00:00:00Z'))
  })

  it('trims a leading/trailing space on a resolved string (#558)', () => {
    const snapshot = normalizeClaims([claim('P34', '  Barcelona  ')])
    expect(getEntry(snapshot, 'P34').text).toBe('Barcelona')
  })

  it('orders claimsValues after the primary value', () => {
    const snapshot = normalizeClaims([
      claim('P843', entityValue('Q453705'), { claimsValues: [extraValue(entityValue('Q453706'))] })
    ])
    expect(snapshot.P843.map(e => e.raw)).toEqual(['Q453705', 'Q453706'])
  })

  it('groups qualifiers by property id', () => {
    const snapshot = normalizeClaims([
      claim('P329', 'Library', {
        qualifiers: [qualifier('P10', 'MS 1'), qualifier('P1054', entityValue('Q9', 'Collection'))]
      })
    ])
    expect(getQualifierEntry(snapshot, 'P329', 'P10').text).toBe('MS 1')
    expect(getQualifierEntry(snapshot, 'P329', 'P1054').text).toBe('Collection')
  })

  it('treats a missing time string as invalid without throwing', () => {
    const snapshot = normalizeClaims([claim('P49', { time: 'not-a-real-time', precision: 11 }, { datatype: 'time' })])
    expect(() => getEntry(snapshot, 'P49')).not.toThrow()
  })

  it('skips claims with no property id', () => {
    expect(normalizeClaims([{ value: { datavalue: { value: 'x' } } }])).toEqual({})
  })

  it('returns an empty snapshot for no claims', () => {
    expect(normalizeClaims([])).toEqual({})
    expect(normalizeClaims(undefined)).toEqual({})
  })
})

describe('hasValue', () => {
  it('is true for a non-empty raw value, including falsy-but-present ones like 0', () => {
    expect(hasValue({ raw: 'Q1' })).toBe(true)
    expect(hasValue({ raw: 0 })).toBe(true)
  })

  it('is false for null/undefined/empty-string raw, or a missing entry', () => {
    expect(hasValue({ raw: null })).toBe(false)
    expect(hasValue({ raw: undefined })).toBe(false)
    expect(hasValue({ raw: '' })).toBe(false)
    expect(hasValue(null)).toBe(false)
  })
})
