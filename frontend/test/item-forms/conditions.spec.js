import { describe, expect, it, vi } from 'vitest'
import { evaluateCondition, resolveSource } from '~/service/item-forms/conditions.js'
import { entry, snapshot } from '../helpers/snapshot.js'

describe('resolveSource', () => {
  it('resolves a bare string as claim shorthand', async () => {
    const snap = snapshot({ P34: entry('Q1', 'Barcelona') })
    await expect(resolveSource('P34', snap)).resolves.toEqual({ text: 'Barcelona', raw: 'Q1', resolvedFrom: 'P34' })
  })

  it('resolves a claim source', async () => {
    const snap = snapshot({ P34: entry('Q1', 'Barcelona') })
    await expect(resolveSource({ claim: 'P34' }, snap)).resolves.toMatchObject({ text: 'Barcelona' })
  })

  it('returns null for a claim with no value', async () => {
    expect(await resolveSource({ claim: 'P34' }, snapshot({}))).toBeNull()
    expect(await resolveSource({ claim: 'P34' }, snapshot({ P34: entry(null, null) }))).toBeNull()
  })

  it('resolves a qualifier source, tagging resolvedFrom with the qualifier id', async () => {
    const snap = snapshot({ P329: entry('Q1', 'Library', { P10: [entry('MS 1', 'MS 1')] }) })
    await expect(resolveSource({ qualifier: { of: 'P329', id: 'P10' } }, snap))
      .resolves.toEqual({ text: 'MS 1', raw: 'MS 1', resolvedFrom: 'P10' })
  })

  it('firstOf tries alternatives in order and returns the first resolvable one', async () => {
    const snap = snapshot({ P845: entry('Q2', 'Creator') })
    const resolved = await resolveSource({ firstOf: ['P247', 'P21', 'P845', 'P1134'] }, snap)
    expect(resolved).toEqual({ text: 'Creator', raw: 'Q2', resolvedFrom: 'P845' })
  })

  it('firstOf returns null when nothing resolves', async () => {
    expect(await resolveSource({ firstOf: ['P247', 'P21'] }, snapshot({}))).toBeNull()
  })

  it('anyOf tries alternatives in order, claim before qualifier', async () => {
    const snap = snapshot({ P329: entry('Q1', 'Library', { P10: [entry('MS 1', 'MS 1')] }) })
    const resolved = await resolveSource({ anyOf: [{ claim: 'P10' }, { qualifier: { of: 'P329', id: 'P10' } }] }, snap)
    expect(resolved).toEqual({ text: 'MS 1', raw: 'MS 1', resolvedFrom: 'P10' })
  })

  it('cascadeThrough fetches through the referenced entity via ctx.cascadeLabel', async () => {
    const snap = snapshot({ P21: entry('Q1', 'Cervantes') })
    const cascadeLabel = vi.fn().mockResolvedValue('Saavedra')
    const resolved = await resolveSource({ cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }, snap, { cascadeLabel })
    expect(cascadeLabel).toHaveBeenCalledWith('Q1', 'P247')
    expect(resolved).toEqual({ text: 'Saavedra', raw: 'Q1', resolvedFrom: 'P21' })
  })

  it('cascadeThrough returns null when the referenced claim has no entity id', async () => {
    const cascadeLabel = vi.fn()
    expect(await resolveSource({ cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }, snapshot({}), { cascadeLabel }))
      .toBeNull()
    expect(cascadeLabel).not.toHaveBeenCalled()
  })

  it('cascadeThrough returns null when ctx.cascadeLabel resolves to nothing', async () => {
    const snap = snapshot({ P21: entry('Q1', 'Cervantes') })
    const cascadeLabel = vi.fn().mockResolvedValue(null)
    expect(await resolveSource({ cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }, snap, { cascadeLabel }))
      .toBeNull()
  })

  it('throws without ctx.cascadeLabel', async () => {
    const snap = snapshot({ P21: entry('Q1', 'Cervantes') })
    await expect(resolveSource({ cascadeThrough: { claim: 'P21', viaProperty: 'P247' } }, snap, {}))
      .rejects.toThrow(/cascadeLabel/)
  })

  it('throws for an unrecognized source shape', async () => {
    await expect(resolveSource({ nonsense: true }, snapshot({}))).rejects.toThrow(/unrecognized Source/)
  })
})

describe('evaluateCondition', () => {
  it('is true for a missing condition', () => {
    expect(evaluateCondition(undefined, { snapshot: snapshot({}) })).toBe(true)
  })

  it('claimHasValue with anyOf matches only the listed raw values', () => {
    const snap = snapshot({ P2: entry('Q20', 'Edition') })
    expect(evaluateCondition({ claimHasValue: { property: 'P2', anyOf: ['Q20'] } }, { snapshot: snap })).toBe(true)
    expect(evaluateCondition({ claimHasValue: { property: 'P2', anyOf: ['Q15'] } }, { snapshot: snap })).toBe(false)
  })

  it('claimHasValue checks every entry, not just the first (manid P2 = [Q15, Q20] still matches Q20)', () => {
    const snap = snapshot({ P2: [entry('Q15', 'Manuscript'), entry('Q20', 'Edition')] })
    expect(evaluateCondition({ claimHasValue: { property: 'P2', anyOf: ['Q20'] } }, { snapshot: snap })).toBe(true)
  })

  it('claimHasValue without anyOf matches any non-empty value', () => {
    const snap = snapshot({ P34: entry('Q1', 'Barcelona') })
    expect(evaluateCondition({ claimHasValue: { property: 'P34' } }, { snapshot: snap })).toBe(true)
  })

  it('claimPresent is true when at least one entry has a value', () => {
    expect(evaluateCondition({ claimPresent: 'P843' }, { snapshot: snapshot({ P843: entry('Q1', 'x') }) })).toBe(true)
    expect(evaluateCondition({ claimPresent: 'P843' }, { snapshot: snapshot({}) })).toBe(false)
  })

  it('all requires every sub-condition to hold', () => {
    const snap = snapshot({ P2: entry('Q20', 'Edition'), P843: entry('Q1', 'x') })
    const condition = { all: [{ claimHasValue: { property: 'P2', anyOf: ['Q20'] } }, { claimPresent: 'P843' }] }
    expect(evaluateCondition(condition, { snapshot: snap })).toBe(true)
    expect(evaluateCondition(condition, { snapshot: snapshot({ P2: entry('Q20', 'Edition') }) })).toBe(false)
  })

  it('partResolvedFrom reads a prior label part\'s resolution', () => {
    const evalCtx = { snapshot: snapshot({}), resolvedParts: { name: 'P845' } }
    expect(evaluateCondition({ partResolvedFrom: { part: 'name', property: 'P845' } }, evalCtx)).toBe(true)
    expect(evaluateCondition({ partResolvedFrom: { part: 'name', property: 'P247' } }, evalCtx)).toBe(false)
  })

  it('throws for an unrecognized condition shape', () => {
    expect(() => evaluateCondition({ nonsense: true }, { snapshot: snapshot({}) })).toThrow(/unrecognized condition/)
  })
})
