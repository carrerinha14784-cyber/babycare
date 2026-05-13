'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Baby, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/baby', icon: Baby, label: 'Bebê' },
  { href: '/mother', icon: Heart, label: 'Mãe' },
  { href: '/settings', icon: Settings, label: 'Config' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/60 bottom-nav">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 relative py-2 px-4 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-rose-50 dark:bg-rose-950/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 relative z-10 transition-colors',
                  isActive ? 'text-rose-500' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium relative z-10 transition-colors',
                  isActive ? 'text-rose-500' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
