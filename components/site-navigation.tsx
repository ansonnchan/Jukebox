'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  // The router and chats live downstream of Home, so they keep the Home tab lit.
  {
    href: '/home',
    label: 'Home',
    matches: (pathname: string) => pathname === '/home' || pathname === '/router' || pathname.startsWith('/chat'),
  },
  { href: '/personalities', label: 'Personalities', matches: (pathname: string) => pathname === '/personalities' },
]

export function SiteNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1.5 rounded-[14px] border border-[#b99e82]/18 bg-white/52 p-1 text-xs font-semibold tracking-[-0.01em] shadow-sm sm:text-sm">
      {navItems.map((item) => {
        const isActive = item.matches(pathname)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-[10px] px-3 py-1.5 text-[#756157] transition hover:bg-white/80 hover:text-[#3d2c26] sm:px-4 sm:py-2',
              isActive && 'bg-[#49352d] text-[#fff9ef] shadow-[0_5px_15px_rgba(73,53,45,.16)] hover:bg-[#5b4036] hover:text-white',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
