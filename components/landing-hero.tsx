import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Headphones, LockKeyhole } from 'lucide-react'
import heroArtwork from '@/assets/jukebox-hero-night.png'
import jukeboxIcon from '@/assets/jukebox.png'
import { SiteNavigation } from '@/components/site-navigation'

export function LandingHero() {
  return (
    <section className="relative isolate h-svh min-h-[680px] w-full overflow-hidden bg-[#170e0b]">
      <Image
        src={heroArtwork}
        alt="A cozy late-night listening room with a jukebox, vinyl records, and a city view at dusk"
        fill
        priority
        placeholder="blur"
        className="object-cover object-[42%_center] sm:object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,9,7,.34)_0%,rgba(20,10,8,.12)_38%,rgba(15,8,7,.38)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_48%,rgba(25,12,10,.1)_0%,rgba(25,12,10,.3)_42%,transparent_70%),linear-gradient(180deg,rgba(10,6,5,.28)_0%,transparent_26%,transparent_62%,rgba(10,6,5,.46)_100%)]" />

      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-[1680px] items-center justify-between px-5 py-5 text-[#fffaf0] sm:px-8 sm:py-7 lg:px-12">
        <Link href="/" className="group inline-flex items-center gap-3" aria-label="Jukebox home">
          <Image src={jukeboxIcon} alt="" className="h-11 w-11 object-contain drop-shadow-[0_8px_18px_rgba(8,3,2,.45)] transition-transform group-hover:-rotate-3 group-hover:scale-105" sizes="44px" />
          <span className="font-display hidden text-2xl font-bold leading-none tracking-[-0.045em] [text-shadow:0_2px_14px_rgba(12,6,4,.55)] sm:block">Jukebox</span>
        </Link>

        <SiteNavigation overImage />
      </header>

      <div className="absolute inset-x-0 top-1/2 z-10 mx-auto w-full max-w-[1680px] -translate-y-[43%] px-5 text-[#fffaf1] sm:px-8 lg:px-12">
        <div className="max-w-[680px] sm:ml-[36%] lg:ml-[43%]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[10px] border border-[#f2c292]/24 bg-[#21130e]/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f4c998] shadow-[0_8px_24px_rgba(10,5,3,.15)] backdrop-blur-md sm:text-[11px]">
            <Headphones size={14} strokeWidth={1.7} /> A listening room for your thoughts
          </div>
          <h1 className="font-display text-[clamp(2.75rem,13vw,4rem)] font-semibold leading-[.88] tracking-[-0.065em] text-[#fff5e7] [text-shadow:0_4px_24px_rgba(18,8,5,.68)] sm:text-[clamp(3.2rem,6.3vw,6.4rem)]">
            Same thought.<br />Different lens.
          </h1>
          <p className="mt-6 max-w-[470px] text-sm font-medium leading-7 text-[#fff4e7]/82 [text-shadow:0_2px_12px_rgba(22,10,7,.85)] sm:text-[15px]">
            Share what&apos;s on your mind and hear it reflected through different perspectives.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/vent" className="group inline-flex h-12 items-center gap-2.5 rounded-[13px] border border-[#f4b67d]/35 bg-[#d98252] px-5 text-sm font-bold text-[#28140d] shadow-[0_12px_32px_rgba(15,6,3,.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#eda06a] hover:shadow-[0_16px_38px_rgba(15,6,3,.38)]">
              Start reflecting <ArrowRight className="transition-transform group-hover:translate-x-0.5" size={16} />
            </Link>
            <Link href="/personalities" className="inline-flex h-12 items-center rounded-[13px] border border-[#ffe6ce]/24 bg-[#170d09]/38 px-5 text-sm font-semibold text-[#fff4e8]/90 shadow-[0_10px_28px_rgba(12,5,3,.16)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[#ffe6ce]/42 hover:bg-[#26150f]/55 hover:text-white">
              Meet the personalities
            </Link>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium leading-5 text-white/60 [text-shadow:0_1px_8px_rgba(18,8,5,.68)]">
            <LockKeyhole size={12} /> No sign-up. No history. Everything stays with you.
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="absolute bottom-5 left-5 z-10 hidden items-end gap-1 rounded-[10px] border border-white/10 bg-[#140b08]/34 px-3 py-2 backdrop-blur-sm sm:flex">
        {[10, 17, 13, 21, 8].map((height, index) => (
          <span key={index} className="w-1 rounded-full bg-[#e8a36a]/70" style={{ height }} />
        ))}
      </div>
    </section>
  )
}
