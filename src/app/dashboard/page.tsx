'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { formatDuration, formatTime } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function DashboardPage() {
  const { theme, setTheme } = useTheme()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const statCards = [
    { label: 'Mamadas hoje', value: '—', sub: 'Nenhuma ainda', icon: '🍼', color: 'bg-rose-50 text-rose-600', href: '/baby' },
    { label: 'Sono total', value: '—', sub: 'Nenhum ainda', icon: '😴', color: 'bg-purple-50 text-purple-600', href: '/baby' },
    { label: 'Trocas hoje', value: '—', sub: 'Nenhuma ainda', icon: '👶', color: 'bg-orange-50 text-orange-500', href: '/baby' },
    { label: 'Última mamada', value: '—', sub: 'Nenhuma hoje', icon: '⏱️', color: 'bg-green-50 text-green-600', href: '/baby' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative hero-gradient pt-14 pb-8 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-rose-300/15 blur-3xl" />
        <div className="relative flex items-start justify-between mb-6">
          <div>
            <motion.p {...fadeInUp} className="text-muted-foreground text-sm">{greeting},</motion.p>
            <motion.h1 {...fadeInUp} transition={{ delay: 0.05 }} className="font-display text-2xl font-medium text-foreground">
              BabyCare 👋
            </motion.h1>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center border border-border/60 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Link href="/settings"
            className="flex items-center gap-3 bg-card/80 backdrop-blur rounded-3xl p-4 border border-dashed border-rose-300 dark:border-rose-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-2xl">👶</div>
            <div>
              <p className="font-medium text-foreground text-sm">Configure seu bebê</p>
              <p className="text-muted-foreground text-xs">Adicione o nome e data de nascimento</p>
            </div>
          </Link>
        </motion.div>
      </div>

      <div className="px-5 pt-5 pb-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Resumo de hoje</p>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
              <Link href={card.href} className="block stat-card hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 ${card.color}`}>{card.icon}</div>
                <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Ações rápidas</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '🍼', label: 'Mamada', href: '/baby' },
            { icon: '😴', label: 'Sono', href: '/baby' },
            { icon: '👶', label: 'Fralda', href: '/baby' },
            { icon: '💜', label: 'Saúde', href: '/mother' },
          ].map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <Link href={action.href} className="action-btn">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mx-5 mt-4 p-4 rounded-3xl bg-gradient-to-br from-purple-50 to-rose-50 dark:from-purple-950/30 dark:to-rose-950/20 border border-purple-100 dark:border-purple-900/30">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-foreground">Dica do dia</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Bebês recém-nascidos precisam mamar a cada 2-3h. Use o BabyCare para monitorar os intervalos.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
