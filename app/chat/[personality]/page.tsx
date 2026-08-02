import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ChatPageClient } from '@/components/chat-page-client'
import {
  normalizePersonalityKey,
  personalities,
  personalityChatPath,
  personalityKeyFromSlug,
  personalitySlugList,
} from '@/lib/personalities'

interface ChatPageProps {
  params: Promise<{
    personality: string
  }>
}

export function generateStaticParams() {
  return personalitySlugList.map((personality) => ({ personality }))
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { personality: slug } = await params
  const key = personalityKeyFromSlug(slug)

  if (!key) return { title: 'Jukebox' }

  return {
    title: `${personalities[key].name} — Jukebox`,
    description: personalities[key].tagline,
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { personality: slug } = await params
  const key = personalityKeyFromSlug(slug)

  if (!key) {
    // Full keys like `venerable-ming` are valid names, so send them to the canonical slug.
    const fallback = normalizePersonalityKey(slug)
    if (fallback) redirect(personalityChatPath(fallback))

    notFound()
  }

  return <ChatPageClient key={key} personality={key} />
}
