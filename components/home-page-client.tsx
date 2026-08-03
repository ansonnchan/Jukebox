'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Cat, CircleHelp } from 'lucide-react'
import { PersonalitySelector } from '@/components/personality-selector'
import { personalityChatPath, type PersonalityKey } from '@/lib/personalities'
import { useVentStore } from '@/store/vent-store'

export function HomePageClient() {
  const router = useRouter()
  const setActivePersonality = useVentStore((state) => state.setActivePersonality)

  function openChat(personality: PersonalityKey) {
    setActivePersonality(personality)
    router.push(personalityChatPath(personality))
  }

  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1360px]">
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
          <Link href="/router" className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d9c7b4]/55 bg-[#f7e9d6] px-4 text-xs font-semibold text-[#6b574b] shadow-[0_5px_12px_rgba(91,62,43,.08)] transition hover:-translate-y-0.5 hover:bg-[#fff5e7] sm:text-sm">
            <CircleHelp size={15} strokeWidth={1.8} /> Not sure? We&apos;ll help you choose. <ArrowRight size={14} />
          </Link>
        </div>
        <Cat className="absolute bottom-3 right-5 text-[#a98c77]/45" size={34} strokeWidth={1.2} />
      </section>
    </div>
  )
}
