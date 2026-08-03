import type { PersonalityKey } from '@/lib/personalities'

export type GentlePersona = Extract<PersonalityKey, 'cotton' | 'angel'>

const elevatedSafetyPatterns = [
  /\bi\s+can(?:'|no)t\s+(?:go\s+on|do\s+this|take\s+it|cope)\b/i,
  /\bi\s+do\s+not\s+want\s+to\s+(?:be\s+here|exist|wake\s+up)\b/i,
  /\bi\s+don't\s+want\s+to\s+(?:be\s+here|exist|wake\s+up)\b/i,
  /\b(?:hopeless|worthless|empty|unbearable|pointless)\b/i,
  /\b(?:panic\s+attack|severe\s+panic|breaking\s+point|no\s+way\s+out)\b/i,
  /\bfalling\s+apart\b/i,
  /\b(?:no\s+reason\s+to\s+live|better\s+off\s+without\s+me|everyone\s+would\s+be\s+better\s+off)\b/i,
  /\b(?:wish\s+i\s+was\s+dead|wish\s+i\s+were\s+dead|want\s+to\s+disappear|i\s+want\s+to\s+die)\b/i,
  /\bi\s+(?:might|may)\s+do\s+something\s+(?:bad|dangerous|unsafe)\b/i,
  /\bi\s+do\s+not\s+trust\s+myself\b/i,
  /\bi\s+don't\s+trust\s+myself\b/i,
]

const urgentSafetyPatterns = [
  /\b(kill|hurt|harm)\s+myself\b/i,
  /\b(end|take)\s+my\s+life\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bself[-\s]?harm\b/i,
  /\bi\s*(?:am|'m)?\s*(?:going to|gonna|about to)\s+(?:hurt|harm|kill)\b/i,
  /\b(?:hurt|kill)\s+someone\b/i,
  /\bnot\s+safe\s+right\s+now\b/i,
  /\bcan(?:'|no)t\s+keep\s+myself\s+safe\b/i,
  /\bimmediate\s+danger\b/i,
  /\bi\s+have\s+a\s+plan\b/i,
  /\bthis\s+is\s+my\s+(?:final|last)\s+(?:message|note|goodbye)\b/i,
  /\bsaying\s+goodbye\b/i,
]

/** Cotton and Angel are already the gentle lenses, so there is nothing softer to offer. */
export function shouldOfferGentleLens(message: string, personality: PersonalityKey) {
  if (personality === 'cotton' || personality === 'angel') return false

  return (
    elevatedSafetyPatterns.some((pattern) => pattern.test(message)) ||
    urgentSafetyPatterns.some((pattern) => pattern.test(message))
  )
}

export async function shouldOfferGentleLensFromServer(message: string, personality: PersonalityKey) {
  try {
    const response = await fetch('/api/safety', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, personality }),
    })

    if (!response.ok) return false

    const result = (await response.json()) as { shouldOfferGentleLens?: unknown }
    return result.shouldOfferGentleLens === true
  } catch {
    return false
  }
}
