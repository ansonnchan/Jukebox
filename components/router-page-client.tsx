'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Cat, Music2, Music4, Sparkle, Sparkles, Star } from 'lucide-react'
import { GentleLensDialog } from '@/components/gentle-lens-dialog'
import { PersonaSuggestionInput } from '@/components/persona-suggestion-input'
import { routePersona, type PersonaRouteResult } from '@/lib/ai/persona-router'
import { personalityChatPath, type PersonalityKey } from '@/lib/personalities'
import { cn } from '@/lib/utils'
import {
  shouldOfferGentleLens,
  shouldOfferGentleLensFromServer,
  type GentlePersona,
} from '@/lib/safety/gentle-lens'
import { useVentStore } from '@/store/vent-store'
import matchingCharactersLeft from '@/assets/matching-characters-left.png'
import matchingCharactersRight from '@/assets/matching-characters-right.png'

const PERSONA_SUGGESTION_MIN_CHARS = 50

/**
 * Doodles scattered down the margins, clear of the centred writing column and of the
 * characters along the bottom edge.
 */
const doodles = [
  { Icon: Star, className: 'left-[5%] top-[13%] -rotate-12 text-[#dfb887]', size: 19 },
  { Icon: Sparkles, className: 'left-[11%] top-[27%] rotate-6 text-[#e3aeb6]', size: 15 },
  { Icon: Music2, className: 'left-[6%] top-[43%] -rotate-[9deg] text-[#c3b192]', size: 21 },
  { Icon: Star, className: 'left-[13%] top-[58%] rotate-[18deg] text-[#e0c295]', size: 13 },
  { Icon: Sparkle, className: 'left-[8%] top-[70%] -rotate-6 text-[#d8b7bd]', size: 16 },
  { Icon: Sparkles, className: 'right-[6%] top-[16%] -rotate-[8deg] text-[#dfb887]', size: 17 },
  { Icon: Star, className: 'right-[12%] top-[29%] rotate-12 text-[#e3aeb6]', size: 18 },
  { Icon: Music4, className: 'right-[5%] top-[45%] rotate-[7deg] text-[#c3b192]', size: 20 },
  { Icon: Star, className: 'right-[14%] top-[59%] -rotate-[15deg] text-[#e0c295]', size: 12 },
  { Icon: Sparkle, className: 'right-[8%] top-[71%] rotate-6 text-[#d8b7bd]', size: 15 },
  { Icon: Star, className: 'left-[34%] top-[7%] rotate-[14deg] text-[#e6cba1]', size: 12 },
  { Icon: Sparkle, className: 'right-[32%] top-[6%] -rotate-12 text-[#e2b3bb]', size: 13 },
]

const confetti = [
  'left-[17%] top-[20%] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#f1bec4]/75',
  'right-[18%] top-[12%] h-2 w-2 rounded-full bg-[#efc4c8]/75',
  'left-[9%] top-[35%] h-2 w-2 rotate-12 rounded-[2px] bg-[#d9c5a9]/85',
  'right-[10%] top-[37%] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#dcc9ad]/75',
  'left-[19%] top-[50%] h-1.5 w-1.5 rounded-full bg-[#e5b9c0]/70',
  'right-[20%] top-[52%] h-2 w-2 rotate-[30deg] rounded-[2px] bg-[#dfc7a4]/75',
  'left-[4%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#d9c5a9]/80',
  'right-[4%] top-[25%] h-1.5 w-1.5 rounded-full bg-[#e5b9c0]/70',
]

function suggestionKey(text: string, suggestion: PersonaRouteResult | null) {
  if (!suggestion) return null
  const trimmed = text.trim()

  return `${suggestion.suggestedPersona}:${trimmed.slice(0, 120)}:${Math.floor(trimmed.length / 80)}`
}

export function RouterPageClient() {
  const router = useRouter()
  const currentVentText = useVentStore((state) => state.currentVentText)
  const setCurrentVentText = useVentStore((state) => state.setCurrentVentText)
  const setActivePersonality = useVentStore((state) => state.setActivePersonality)
  const setPendingSubmission = useVentStore((state) => state.setPendingSubmission)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const [isCheckingSuggestion, setIsCheckingSuggestion] = useState(false)
  const [personaSuggestion, setPersonaSuggestion] = useState<PersonaRouteResult | null>(null)
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null)
  const [gentleLensPromptOpen, setGentleLensPromptOpen] = useState(false)

  /** Hand the already-written vent to the chat route so it sends once the transition ends. */
  function openChatWithVent(personality: PersonalityKey, acceptedSuggestedPersona: PersonalityKey | null) {
    const trimmed = currentVentText.trim()

    if (trimmed) setPendingSubmission({ text: trimmed, acceptedSuggestedPersona })
    setActivePersonality(personality)
    router.push(personalityChatPath(personality))
  }

  function changeText(value: string) {
    setCurrentVentText(value)
    setSuggestionError(null)
    setPersonaSuggestion(null)
    setDismissedSuggestionKey(null)
  }

  async function requestPersonaSuggestion() {
    const trimmed = currentVentText.trim()

    setIsCheckingSuggestion(true)

    if (shouldOfferGentleLens(trimmed, 'auntie-zhang')) {
      setSuggestionError(null)
      setIsCheckingSuggestion(false)
      setGentleLensPromptOpen(true)
      return
    }

    const serverSuggestsGentleLens = await shouldOfferGentleLensFromServer(trimmed, 'auntie-zhang')
    if (serverSuggestsGentleLens) {
      setSuggestionError(null)
      setIsCheckingSuggestion(false)
      setGentleLensPromptOpen(true)
      return
    }

    if (trimmed.length < PERSONA_SUGGESTION_MIN_CHARS) {
      setSuggestionError('Write a little more so we have enough to find the right voice.')
      setPersonaSuggestion(null)
      setIsCheckingSuggestion(false)
      return
    }

    const suggestion = routePersona(trimmed)
    setSuggestionError(null)
    setPersonaSuggestion(suggestion.confidence >= 0.4 ? suggestion : null)
    setIsCheckingSuggestion(false)
  }

  function useSuggestedPersonality() {
    if (!personaSuggestion) return

    const personality = personaSuggestion.suggestedPersona

    setDismissedSuggestionKey(suggestionKey(currentVentText, personaSuggestion))
    openChatWithVent(personality, personality)
  }

  function chooseGentleLens(personality: GentlePersona) {
    setGentleLensPromptOpen(false)
    openChatWithVent(personality, null)
  }

  const currentSuggestionKey = suggestionKey(currentVentText, personaSuggestion)
  const visibleSuggestion =
    currentVentText.trim().length >= PERSONA_SUGGESTION_MIN_CHARS &&
    personaSuggestion &&
    currentSuggestionKey !== dismissedSuggestionKey
      ? personaSuggestion
      : null

  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1360px]">
      <section className="paper-texture paper-shadow relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-[#cbb79f]/25 px-4 py-5 sm:px-7 sm:py-6">
        {/* Stars, notes, and confetti scattered across the paper. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
          {doodles.map(({ Icon, className, size }) => (
            <Icon key={className} className={cn('absolute', className)} size={size} strokeWidth={1.5} />
          ))}
          {confetti.map((className) => (
            <span key={className} className={cn('absolute', className)} />
          ))}
          <Cat className="absolute left-[7%] top-[7%] -rotate-6 text-[#b2947e]/70" size={30} strokeWidth={1.3} />
          <Sparkles className="absolute right-[7%] top-[8%] rotate-12 text-[#cbb79a]/80" size={22} strokeWidth={1.4} />
        </div>

        <Link
          href="/home"
          className="relative z-20 ml-auto inline-flex h-9 w-fit items-center gap-1.5 rounded-full border border-[#d9c7b4]/70 bg-[#f7e9d6]/85 px-3.5 text-xs font-semibold text-[#6b574b] shadow-[0_4px_10px_rgba(91,62,43,.07)] transition hover:-translate-y-0.5 hover:bg-[#fff5e7]"
        >
          <ArrowLeft size={14} /> Choose a voice
        </Link>

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[820px] flex-1 flex-col justify-center pb-[clamp(96px,15vh,150px)] pt-3">
          <div className="mx-auto mb-5 max-w-2xl text-center">
            <p className="font-hand inline-flex items-center gap-1.5 text-base text-[#947864]">
              <Sparkles size={15} strokeWidth={1.8} /> We&apos;ll introduce you to someone who gets it.
            </p>
            <h1 className="mt-1 font-hand text-3xl font-bold tracking-[-0.02em] text-[#493a32] sm:text-[42px]">
              Not sure who to talk to?
            </h1>
            <p className="mt-2 text-xs leading-6 text-[#78685d] sm:text-sm">
              Write a little about how you feel. We&apos;ll suggest a perspective that might help.
            </p>
          </div>

          <PersonaSuggestionInput
            value={currentVentText}
            suggestion={visibleSuggestion}
            error={suggestionError}
            minChars={PERSONA_SUGGESTION_MIN_CHARS}
            isChecking={isCheckingSuggestion}
            onChange={changeText}
            onRequestSuggestion={requestPersonaSuggestion}
            onUseSuggested={useSuggestedPersonality}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex items-end justify-between" aria-label="Five listening personalities are ready to help">
          <Image src={matchingCharactersLeft} alt="" className="h-auto w-[clamp(160px,19vw,280px)]" sizes="(max-width: 768px) 160px, 280px" />
          <Image src={matchingCharactersRight} alt="" className="h-auto w-[clamp(200px,24vw,350px)] translate-y-12" sizes="(max-width: 768px) 200px, 350px" />
        </div>
      </section>

      <GentleLensDialog
        open={gentleLensPromptOpen}
        currentPersonality={null}
        onChoose={chooseGentleLens}
        onClose={() => setGentleLensPromptOpen(false)}
      />
    </div>
  )
}
