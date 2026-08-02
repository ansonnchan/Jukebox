'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Cat, CircleHelp } from 'lucide-react'
import { GentleLensDialog } from '@/components/gentle-lens-dialog'
import { PersonaSuggestionInput } from '@/components/persona-suggestion-input'
import { PersonalitySelector } from '@/components/personality-selector'
import { routePersona, type PersonaRouteResult } from '@/lib/ai/persona-router'
import { personalityChatPath, type PersonalityKey } from '@/lib/personalities'
import {
  shouldOfferGentleLens,
  shouldOfferGentleLensFromServer,
  type GentlePersona,
} from '@/lib/safety/gentle-lens'
import { useVentStore } from '@/store/vent-store'
import heroArtwork from '@/assets/jukebox-hero-v2.png'
import matchingCharactersLeft from '@/assets/matching-characters-left.png'
import matchingCharactersRight from '@/assets/matching-characters-right.png'

type HomeStage = 'selecting' | 'suggesting'

const PERSONA_SUGGESTION_MIN_CHARS = 50

function suggestionKey(text: string, suggestion: PersonaRouteResult | null) {
  if (!suggestion) return null
  const trimmed = text.trim()

  return `${suggestion.suggestedPersona}:${trimmed.slice(0, 120)}:${Math.floor(trimmed.length / 80)}`
}

export function HomePageClient() {
  const router = useRouter()
  const currentVentText = useVentStore((state) => state.currentVentText)
  const setCurrentVentText = useVentStore((state) => state.setCurrentVentText)
  const setActivePersonality = useVentStore((state) => state.setActivePersonality)
  const setPendingSubmission = useVentStore((state) => state.setPendingSubmission)
  const [stage, setStage] = useState<HomeStage>('selecting')
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const [isCheckingSuggestion, setIsCheckingSuggestion] = useState(false)
  const [personaSuggestion, setPersonaSuggestion] = useState<PersonaRouteResult | null>(null)
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null)
  const [gentleLensPromptOpen, setGentleLensPromptOpen] = useState(false)

  function openChat(personality: PersonalityKey) {
    setActivePersonality(personality)
    router.push(personalityChatPath(personality))
  }

  /** Hand the already-written vent to the chat route so it sends once the transition ends. */
  function openChatWithVent(personality: PersonalityKey, acceptedSuggestedPersona: PersonalityKey | null) {
    const trimmed = currentVentText.trim()

    if (!trimmed) {
      openChat(personality)
      return
    }

    setPendingSubmission({ text: trimmed, acceptedSuggestedPersona })
    openChat(personality)
  }

  function goToStage(nextStage: HomeStage) {
    setStage(nextStage)
    setSuggestionError(null)
    setPersonaSuggestion(null)
  }

  function changeSuggestionText(value: string) {
    setCurrentVentText(value)
    setSuggestionError(null)
    setPersonaSuggestion(null)
    setDismissedSuggestionKey(null)
  }

  async function requestPersonaSuggestion() {
    const trimmed = currentVentText.trim()

    if (stage !== 'suggesting') return

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
    stage === 'suggesting' &&
    currentVentText.trim().length >= PERSONA_SUGGESTION_MIN_CHARS &&
    personaSuggestion &&
    currentSuggestionKey !== dismissedSuggestionKey
      ? personaSuggestion
      : null

  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1360px]">
      {stage === 'selecting' ? (
        <section className="paper-texture paper-shadow relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-[#cbb79f]/25 px-4 py-5 sm:px-7 sm:py-6 lg:px-4">
          <span className="absolute left-[8%] top-[15%] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#f1bec4]/55" />
          <span className="absolute right-[8%] top-[11%] h-2 w-2 rotate-12 rounded-full bg-[#efc4c8]/55" />
          <div className="mx-auto mb-3 max-w-2xl text-center">
            <p className="font-hand text-base text-[#947864]">Who would you like to hear today?</p>
            <h1 className="mt-0.5 font-hand text-3xl font-bold text-[#493a32] sm:text-4xl">Choose a personality</h1>
            <p className="mt-1 text-xs text-[#78685d] sm:text-sm">Each has a different way of seeing the world.</p>
          </div>
          <PersonalitySelector value={null} onValueChange={openChat} variant="cards" className="mx-auto w-full max-w-[1120px] flex-1" />
          <div className="relative mt-2 flex justify-center">
            <button type="button" onClick={() => goToStage('suggesting')} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d9c7b4]/55 bg-[#f7e9d6] px-4 text-xs font-semibold text-[#6b574b] shadow-[0_5px_12px_rgba(91,62,43,.08)] transition hover:-translate-y-0.5 hover:bg-[#fff5e7] sm:text-sm">
              <CircleHelp size={15} strokeWidth={1.8} /> Not sure? We&apos;ll help you choose. <ArrowRight size={14} />
            </button>
          </div>
          <Cat className="absolute bottom-3 right-5 text-[#a98c77]/45" size={34} strokeWidth={1.2} />
        </section>
      ) : (
        <section className="paper-shadow relative h-full min-h-0 overflow-hidden rounded-[18px] border border-[#c9b49c]/30 bg-[#33271f]">
          <Image src={heroArtwork} alt="A warm illustrated study for sharing a thought" fill priority className="object-cover object-center" sizes="(max-width: 1440px) 100vw, 1360px" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,21,16,.83),rgba(57,36,25,.6)_52%,rgba(32,21,16,.76)),radial-gradient(circle_at_48%_55%,transparent,rgba(24,14,10,.3))]" />
          <div className="absolute left-6 top-6 z-20 hidden w-48 -rotate-3 border border-[#c99d64] bg-[#f5dfad] p-4 text-[#624931] shadow-[0_10px_24px_rgba(16,10,8,.32)] lg:block">
            <span className="absolute left-1/2 top-0 h-5 w-20 -translate-x-1/2 -translate-y-2 rotate-2 bg-[#dfbd82]/70" />
            <p className="font-hand text-sm font-bold leading-5">We&apos;ll introduce you to someone who gets it.</p>
            <Cat className="ml-auto mt-2" size={21} strokeWidth={1.3} />
          </div>
          <button type="button" onClick={() => goToStage('selecting')} className="absolute left-4 top-4 z-10 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-[#2d1f19]/40 px-3 text-xs font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/15 lg:left-auto lg:right-4">
            <ArrowLeft size={14} /> Choose a voice
          </button>
          <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[760px] items-center px-4 py-12 sm:px-8">
            <PersonaSuggestionInput
              value={currentVentText}
              suggestion={visibleSuggestion}
              error={suggestionError}
              isChecking={isCheckingSuggestion}
              onChange={changeSuggestionText}
              onRequestSuggestion={requestPersonaSuggestion}
              onUseSuggested={useSuggestedPersonality}
              variant="scene"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between" aria-label="Five listening personalities are ready to help">
            <Image src={matchingCharactersLeft} alt="" className="h-auto w-[clamp(210px,25vw,360px)]" sizes="(max-width: 768px) 210px, 360px" />
            <Image src={matchingCharactersRight} alt="" className="h-auto w-[clamp(260px,32vw,450px)] translate-y-16" sizes="(max-width: 768px) 260px, 450px" />
          </div>
        </section>
      )}

      <GentleLensDialog
        open={gentleLensPromptOpen}
        currentPersonality={null}
        onChoose={chooseGentleLens}
        onClose={() => setGentleLensPromptOpen(false)}
      />
    </div>
  )
}
