'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { GentleLensDialog } from '@/components/gentle-lens-dialog'
import { PersonalitySelector } from '@/components/personality-selector'
import { ResponsePanel } from '@/components/response-panel'
import { VentInput } from '@/components/vent-input'
import { recordClientMetric } from '@/lib/client-metrics'
import { personalityLoadingScenes, personalityPortraits, personalityScenes } from '@/lib/personality-assets'
import { personalities, personalityChatPath, type PersonalityKey } from '@/lib/personalities'
import { shouldOfferGentleLens, type GentlePersona } from '@/lib/safety/gentle-lens'
import { useVentStore } from '@/store/vent-store'

interface ChatPageClientProps {
  personality: PersonalityKey
}

/** Every visit to /chat/[personality] opens with the persona's transition scene. */
const TRANSITION_MS = 1800

const loadingCopy: Record<PersonalityKey, { title: string; description: string }> = {
  cotton: { title: 'Making a soft place for your thought…', description: 'Cotton is gathering a little gentleness.' },
  aristotle: { title: 'Opening the right page…', description: 'Aristotle is tracing the threads of your thought.' },
  'venerable-ming': { title: 'Letting the water settle…', description: 'Ming is pouring a quiet cup of tea.' },
  angel: { title: 'Saving a little light for you…', description: 'Angel is finding the hopeful thread.' },
  'auntie-zhang': { title: 'Getting straight to the point…', description: 'Auntie Zhang is readying an honest word.' },
}

const cooldownMessages: Record<PersonalityKey, string> = {
  cotton: 'Take a breath. Try again in a moment.',
  aristotle: 'Pause for a moment. Clear thinking needs a little space.',
  'venerable-ming': 'Let the water settle. Try again in a moment.',
  angel: 'Take a breath. I am still here.',
  'auntie-zhang': 'Slow down. One clean attempt at a time.',
}

export function ChatPageClient({ personality }: ChatPageClientProps) {
  const router = useRouter()
  const currentVentText = useVentStore((state) => state.currentVentText)
  const currentVent = useVentStore((state) => state.currentVent)
  const compressedContext = useVentStore((state) => state.compressedContext)
  const transcriptMessages = useVentStore((state) => state.transcriptMessages)
  const setCurrentVentText = useVentStore((state) => state.setCurrentVentText)
  const setCurrentVent = useVentStore((state) => state.setCurrentVent)
  const setResponses = useVentStore((state) => state.setResponses)
  const setActivePersonality = useVentStore((state) => state.setActivePersonality)
  const addSessionMessage = useVentStore((state) => state.addSessionMessage)
  const setSafetyNote = useVentStore((state) => state.setSafetyNote)
  const setPendingSubmission = useVentStore((state) => state.setPendingSubmission)
  const resetSession = useVentStore((state) => state.resetSession)
  const [isTransitioning, setIsTransitioning] = useState(true)
  /** Set once this mount has posted a vent; the transcript itself lives in the store. */
  const [submittedText, setSubmittedText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generationKey, setGenerationKey] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastSubmittedAt, setLastSubmittedAt] = useState(0)
  const [submittedAcceptedSuggestedPersona, setSubmittedAcceptedSuggestedPersona] = useState<PersonalityKey | null>(null)
  const [gentleLensPromptOpen, setGentleLensPromptOpen] = useState(false)
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)
  const shouldFollowTranscriptRef = useRef(true)

  // The route is the source of truth for who is listening.
  useEffect(() => {
    setActivePersonality(personality)
  }, [personality, setActivePersonality])

  const scrollTranscriptToLatest = useCallback(() => {
    if (!shouldFollowTranscriptRef.current) return

    const container = transcriptScrollRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [])

  function trackTranscriptScroll(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget
    shouldFollowTranscriptRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 80
  }

  const sendVent = useCallback(
    (text: string, acceptedSuggestion: PersonalityKey | null) => {
      const trimmed = text.trim()
      if (!trimmed) return

      setError(null)
      setLastSubmittedAt(Date.now())
      shouldFollowTranscriptRef.current = true
      recordClientMetric('vent_submitted', { personality, characters: trimmed.length })
      setResponses({})
      setSafetyNote(null)
      setCurrentVent(trimmed)
      setSubmittedText(trimmed)
      setSubmittedAcceptedSuggestedPersona(acceptedSuggestion)
      addSessionMessage({ role: 'user', content: trimmed })
      setCurrentVentText('')
      setGenerationKey((key) => key + 1)
    },
    [addSessionMessage, personality, setCurrentVent, setCurrentVentText, setResponses, setSafetyNote],
  )

  // When the scene clears, send any vent handed over from /home or a gentler-lens switch.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsTransitioning(false)

      const pending = useVentStore.getState().pendingSubmission
      if (!pending) return

      setPendingSubmission(null)
      sendVent(pending.text, pending.acceptedSuggestedPersona)
    }, TRANSITION_MS)

    return () => window.clearTimeout(timeout)
  }, [sendVent, setPendingSubmission])

  function switchPersonality(next: PersonalityKey) {
    if (next === personality) return

    router.push(personalityChatPath(next))
  }

  function submit() {
    const trimmed = currentVentText.trim()

    if (!trimmed) {
      setError('Write something first. Even one sentence.')
      return
    }

    if (Date.now() - lastSubmittedAt < 4000) {
      setError(cooldownMessages[personality])
      return
    }

    if (shouldOfferGentleLens(trimmed, personality)) {
      setError(null)
      setGentleLensPromptOpen(true)
      return
    }

    sendVent(trimmed, null)
  }

  /** Switching lens means changing route, so hand the vent over and let /chat send it. */
  function chooseGentleLens(gentlePersonality: GentlePersona) {
    setGentleLensPromptOpen(false)

    const trimmed = currentVentText.trim()
    if (!trimmed) return

    setCurrentVentText('')
    setPendingSubmission({ text: trimmed, acceptedSuggestedPersona: null })
    setActivePersonality(gentlePersonality)
    router.push(personalityChatPath(gentlePersonality))
  }

  function clearConversation() {
    resetSession()
    setActivePersonality(personality)
    setSubmittedText('')
    setSubmittedAcceptedSuggestedPersona(null)
    setError(null)
    shouldFollowTranscriptRef.current = true
  }

  const active = personalities[personality]
  const hasTranscript = submittedText !== '' || transcriptMessages.length > 0

  if (isTransitioning) {
    return (
      <div className="mx-auto h-full min-h-0 w-full max-w-[1360px]">
        <section className="paper-shadow relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-[18px] border border-[#c9b49c]/30 bg-[#33271f]">
          <Image src={personalityLoadingScenes[personality]} alt="" fill priority placeholder="blur" className="object-cover object-center" sizes="(max-width: 1440px) 100vw, 1360px" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,20,15,.54),rgba(46,30,22,.28)_50%,rgba(31,20,15,.52))]" />
          <div className="relative z-10 mx-auto max-w-md px-6 text-center text-[#fff4e4]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#3d2b23]/35 text-2xl backdrop-blur-sm">{active.emoji}</span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.17em] text-white/75">Listening with {active.name}</p>
            <h1 className="mt-3 font-hand text-3xl font-bold leading-tight [text-shadow:0_2px_14px_rgba(25,14,9,.55)] sm:text-4xl">{loadingCopy[personality].title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/80">{loadingCopy[personality].description}</p>
            <span className="mx-auto mt-7 flex w-fit items-center gap-1.5" aria-label="Loading">
              <i className="h-2 w-2 animate-bounce rounded-full bg-[#fff0d8] [animation-delay:-.2s]" />
              <i className="h-2 w-2 animate-bounce rounded-full bg-[#fff0d8] [animation-delay:-.1s]" />
              <i className="h-2 w-2 animate-bounce rounded-full bg-[#fff0d8]" />
            </span>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1360px]">
      <section className="paper-shadow grid h-full min-h-0 overflow-hidden rounded-[18px] border border-[#c9b49c]/30 bg-[#f8efdf] lg:grid-cols-[72px_minmax(360px,440px)_1fr]">
        <PersonalitySelector value={personality} onValueChange={switchPersonality} variant="rail" />

        <div className="paper-texture flex min-h-0 min-w-0 flex-col border-[#cdbba6]/40 lg:border-r">
          <header className="relative border-b border-[#d9c8b6]/45 px-5 py-4 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8d7a6d]">Talking with</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image src={personalityPortraits[personality]} alt="" fill className="object-cover object-top" sizes="28px" />
              </span>
              <h1 className="font-hand text-2xl font-bold text-[#493a32]">{active.name}</h1>
              <span className="text-lg text-[#92a883]">{active.emoji}</span>
            </div>
            <MoreHorizontal className="absolute right-4 top-5 text-[#9f8b7d]" size={18} />
            {compressedContext ? <p className="mt-1 text-[9px] text-[#9a887b]">temporary context active</p> : null}
          </header>

          <div ref={transcriptScrollRef} onScroll={trackTranscriptScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            {hasTranscript ? (
              <ResponsePanel
                key={generationKey}
                originalText={submittedText || currentVent}
                autoGenerateKey={generationKey}
                acceptedSuggestedPersona={submittedAcceptedSuggestedPersona}
                onGeneratingChange={setIsGenerating}
                onTranscriptUpdated={scrollTranscriptToLatest}
                onClearConversation={clearConversation}
              />
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-8 text-center">
                <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md"><Image src={personalityPortraits[personality]} alt="" fill className="object-cover object-top" sizes="64px" /></span>
                <p className="mt-4 font-hand text-xl text-[#725f52]">I&apos;m here when you&apos;re ready.</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-[#968377]">Write the thought exactly as it arrived. It does not have to be polished.</p>
              </div>
            )}
          </div>

          <div className="border-t border-[#d9c8b6]/45 bg-[#fffaf0]/75 p-3.5">
            <VentInput value={currentVentText} onChange={setCurrentVentText} onSubmit={submit} isLoading={isGenerating} error={error} compact />
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden lg:min-h-0">
          <Image key={personality} src={personalityScenes[personality]} alt={`${active.name} in their illustrated space`} fill priority className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 58vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3c291f]/28 via-transparent to-white/5" />
          <div className="absolute bottom-4 right-4 rounded-full border border-white/30 bg-[#3b2921]/35 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur-md">
            Same thought. Different lens.
          </div>
        </div>
      </section>

      <GentleLensDialog
        open={gentleLensPromptOpen}
        currentPersonality={personality}
        onChoose={chooseGentleLens}
        onClose={() => setGentleLensPromptOpen(false)}
      />
    </div>
  )
}
