import { describe, expect, it } from 'vitest'
import {
  normalizePersonalityKey,
  personalities,
  personalityChatPath,
  personalityKeyFromSlug,
  personalityList,
  personalitySlugList,
  personalitySlugs,
  type PersonalityKey,
} from '@/lib/personalities'

describe('personality slugs', () => {
  it('gives every personality a unique slug', () => {
    expect(personalitySlugList).toHaveLength(personalityList.length)
    expect(new Set(personalitySlugList).size).toBe(personalityList.length)
  })

  it('uses the short names the chat routes are built from', () => {
    expect(personalitySlugs['venerable-ming']).toBe('ming')
    expect(personalitySlugs['auntie-zhang']).toBe('zhang')
  })

  it('round-trips every key through its slug', () => {
    for (const personality of personalityList) {
      expect(personalityKeyFromSlug(personalitySlugs[personality.key])).toBe(personality.key)
    }
  })

  it('builds a chat path per personality', () => {
    expect(personalityChatPath('venerable-ming')).toBe('/chat/ming')
    expect(personalityChatPath('cotton')).toBe('/chat/cotton')
  })

  it('rejects slugs that are not personalities', () => {
    expect(personalityKeyFromSlug('bogus')).toBeNull()
    expect(personalityKeyFromSlug('')).toBeNull()
    expect(personalityKeyFromSlug(undefined)).toBeNull()
    // Full keys are not slugs; the route redirects those to the canonical path instead.
    expect(personalityKeyFromSlug('venerable-ming')).toBeNull()
  })
})

describe('normalizePersonalityKey', () => {
  it('accepts both full keys and slugs', () => {
    for (const key of Object.keys(personalities) as PersonalityKey[]) {
      expect(normalizePersonalityKey(key)).toBe(key)
      expect(normalizePersonalityKey(personalitySlugs[key])).toBe(key)
    }
  })

  it('rejects anything else', () => {
    expect(normalizePersonalityKey('nobody')).toBeNull()
    expect(normalizePersonalityKey(null)).toBeNull()
    expect(normalizePersonalityKey(42)).toBeNull()
  })
})
