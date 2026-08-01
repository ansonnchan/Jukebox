'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Disclaimer } from '@/components/disclaimer'
import { PersonalityTheme } from '@/components/personality-theme'
import { SiteNavigation } from '@/components/site-navigation'
import jukeboxIcon from '@/assets/jukebox.png'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isVent = pathname === '/vent'

  return (
    <>
      <PersonalityTheme />
      <div className={cn('min-h-screen', isVent && 'flex h-svh min-h-[700px] flex-col overflow-hidden')}>
        {!isLanding ? <header className="sticky top-0 z-50 shrink-0 border-b border-[#a8846f]/15 bg-[#fff9ee]/88 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
            <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Jukebox home">
              <Image src={jukeboxIcon} alt="" className="h-9 w-9 object-contain drop-shadow-[0_5px_10px_rgba(91,48,32,.16)] transition-transform group-hover:-rotate-3 group-hover:scale-105" sizes="36px" />
              <span className="font-display block text-[20px] font-bold leading-none tracking-[-0.035em] text-[#3d2a24]">Jukebox</span>
            </Link>

            <SiteNavigation />
          </div>
        </header> : null}

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'mx-auto w-full',
              isLanding
                ? 'max-w-none p-0'
                : isVent
                  ? 'flex min-h-0 flex-1 max-w-[1440px] px-4 py-3 sm:px-7 lg:px-10'
                : 'max-w-[1440px] px-4 pb-8 pt-4 sm:px-7 sm:pt-6 lg:px-10',
            )}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {!isLanding ? <div className={cn('mx-auto w-full max-w-[1440px] px-5 sm:px-8', isVent && 'shrink-0')}><Disclaimer compact={isVent} /></div> : null}
      </div>
    </>
  )
}
