import { redirect } from 'next/navigation'
import { normalizePersonalityKey, personalityChatPath } from '@/lib/personalities'

interface RootPageProps {
  searchParams: Promise<{
    personality?: string | string[]
  }>
}

/** `/` is an entry point only: it forwards to /home, or straight into a chat for older links. */
export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams
  const value = Array.isArray(params.personality) ? params.personality[0] : params.personality
  const personality = normalizePersonalityKey(value)

  redirect(personality ? personalityChatPath(personality) : '/home')
}
