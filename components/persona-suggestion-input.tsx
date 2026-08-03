'use client'

import { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { WhyPersonaPanel } from '@/components/why-persona-panel'
import type { PersonaRouteResult } from '@/lib/ai/persona-router'
import { cn } from '@/lib/utils'

interface PersonaSuggestionInputProps {
  value: string
  suggestion: PersonaRouteResult | null
  error?: string | null
  /** Shortest vent the router can read a lens from. */
  minChars: number
  isChecking?: boolean
  onChange: (value: string) => void
  onRequestSuggestion: () => void
  onUseSuggested: () => void
  className?: string
}

export function PersonaSuggestionInput({ value, suggestion, error, minChars, isChecking = false, onChange, onRequestSuggestion, onUseSuggested, className }: PersonaSuggestionInputProps) {
  const length = value.trim().length
  const meetsMinimum = length >= minChars


  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    onRequestSuggestion()
  }

  return (
    <div className={cn('relative flex w-full flex-col text-left', className)}>
      {/* A sticker-style outline sits behind the box so it reads as pasted onto the page. */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-2 -z-10 rotate-[-0.5deg] rounded-[22px] border-2 border-dashed border-[#d8bf9a]/45" />

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="For example: I feel behind even though I’m trying my best..."
        className="relative h-[clamp(190px,29vh,330px)] w-full shrink-0 resize-none rounded-[18px] border-[3px] border-[#e5bd8c]/85 bg-[#fff8e9] px-6 py-5 text-sm leading-7 text-[#55483e] shadow-[0_8px_22px_rgba(120,84,52,.1)] outline-none transition placeholder:font-hand placeholder:text-[#a28d7a] focus:border-[#c9a06a] focus:shadow-[0_12px_30px_rgba(120,84,52,.16)] sm:text-[15px]"
      />

      <p className="font-hand relative mt-2.5 text-xs text-[#9a8677] sm:text-[13px]">
        At least {minChars} characters, so there is enough to read a lens from.
      </p>

      <div className="relative mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-xs text-[#8a7768]">
          {error ? <span className="text-[#a15f59]">{error}</span> : <span>Your words stay in this session.</span>}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className={cn('text-xs tabular-nums', meetsMinimum ? 'text-[#7f9670]' : 'text-[#9c8a7c]')}>
            {length.toLocaleString()} / {minChars}
          </span>
          <Button type="button" size="md" variant="primary" className="bg-[#9e88bf] text-white shadow-[0_7px_18px_rgba(34,19,42,.2)] hover:bg-[#8b75aa]" onClick={onRequestSuggestion} disabled={isChecking}>
            {isChecking ? 'Finding a lens...' : 'Suggest a lens'}
          </Button>
        </div>
      </div>

      {suggestion ? <WhyPersonaPanel suggestion={suggestion} onUseSuggested={onUseSuggested} className="mt-3" /> : null}
    </div>
  )
}
