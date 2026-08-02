import { VentPageClient } from '@/components/vent-page-client'
import { normalizePersonalityKey, type PersonalityKey } from '@/lib/personalities'

interface HomePageProps {
  searchParams: Promise<{
    personality?: string | string[]
  }>
}

function parsePersonalityParam(value: string | string[] | undefined): PersonalityKey | null {
  const firstValue = Array.isArray(value) ? value[0] : value
  return normalizePersonalityKey(firstValue)
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const initialPersonality = parsePersonalityParam(params.personality)

  return <VentPageClient key={initialPersonality ?? 'none'} initialPersonality={initialPersonality} />
}
