'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/personalities', label: 'Personalities' },
  { href: '/vent', label: 'Talk now' },
]

export function SiteNavigation({ overImage = false }: { overImage?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      'flex items-center gap-1.5 text-xs font-semibold tracking-[-0.01em] sm:text-sm',
      overImage
        ? 'rounded-[14px] border border-white/10 bg-[#160e0b]/34 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,.12)] backdrop-blur-md'
        : 'rounded-[14px] border border-[#b99e82]/18 bg-white/52 p-1 shadow-sm',
    )}>
      {navItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-[10px] px-3 py-1.5 transition sm:px-4 sm:py-2',
              overImage
                ? 'text-[#fff5e8]/76 hover:bg-white/10 hover:text-white'
                : 'text-[#756157] hover:bg-white/80 hover:text-[#3d2c26]',
              isActive && (overImage
                ? 'bg-[#e8a36a] text-[#2c170f] shadow-[0_5px_18px_rgba(26,12,7,.3)] hover:bg-[#f0b178] hover:text-[#2c170f]'
                : 'bg-[#49352d] text-[#fff9ef] shadow-[0_5px_15px_rgba(73,53,45,.16)] hover:bg-[#5b4036] hover:text-white'),
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
