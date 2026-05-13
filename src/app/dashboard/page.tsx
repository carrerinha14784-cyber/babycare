'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Sun, Plus, Baby, Clock, Droplets, Zap } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDuration, formatTime, calculateAge } from '@/lib/utils'
import type { Profile, Baby as BabyType, DailySummary } from '@/types'

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export default function DashboardPage() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [baby, setBaby] = useState<BabyType | null>(null)
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [lastFeeding, setLastFeeding] = useState<string | null>(null)
  const [activeSleeep, setActiveSleep] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Load active baby
      const { data: babyData } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      setBaby(babyData)

      if (babyData) {
        // Load daily summary
        const { data: summaryData } = await supabase
          .from('daily_baby_summary')
          .select('*')
          .eq('baby_id', babyData.id)
          .single()
        setSummary(summaryData)

        // Last feeding
        const { data: feedingData } = await supabase
          .from('feeding_records')
          .select('fed_at')
          .eq('baby_id', babyData.id)
          .order('fed_at', { ascending: false })
          .limit(1)
          .single()
        setLastFeeding(feedingData?.fed_at || null)

        // Active sleep
        const { data: sleepData } = await supabase
          .from('sleep_records')
          .select('id')
          .eq('baby_id', babyData.id)
          .is('sleep_end', null)
          .single()
        setActiveSleep(!!sleepData)
      }
    }
    load()
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || 'Mamãe'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const statCards = [
    {
      label: 'Mamadas hoje',
      value: summary?.total_feedings ?? '—',
      sub: summary?.total_ml ? `${summary.total_ml}ml total` : 'Nenhuma ainda',
      icon: '🍼',
      color: 'rose',
      href: '/baby?tab=feeding',
    },
    {
      label: 'Sono total',
      value: summary?.total_sleep_minutes
        ? formatDuration(summary.total_sleep_minutes)
        : '—',
      sub: summary?.sleep_sessions ? `${summary.sleep_sessions} período(s)` : 'Nenhum ainda',
      icon: '😴',
      color: 'lavender',
      href: '/baby?tab=sleep',
    },
    {
      label: 'Trocas hoje',
      value: summary?.total_diapers ?? '—',
      sub: summary?.poop_count ? `${summary.poop_count} fezes` : 'Nenhuma ainda',
      icon: '👶',
      color: 'peach',
      href: '/baby?tab=diaper',
    },
    {
      label: 'Última mamada',
      value: lastFeeding ? formatTime(lastFeeding) : '—',
      sub: lastFeeding ? 'registrada' : 'Nenhuma hoje',
      icon: '⏱️',
      color: 'sage',
      href: '/baby?tab=feeding',
    },
  ]

  const colorMap: Record<string, string> = {
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600',
    lavender: 'bg-lavender-50 dark:bg-purple-950/30 text-lavender-600',
    peach: 'bg-peach-50 dark:bg-orange-950/30 text-orange-500',
    sage: 'bg-sage-50 dark:bg-green-950/30 text-sage-600',
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative hero-gradient pt-14 pb-8 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-rose-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-lavender-300/15 blur-2xl" />

        <div className="relative flex items-start justify-between mb-6">
          <div>
            <motion.p {...fadeInUp} className="text-muted-foreground text-sm">
              {greeting},
            </motion.p>
            <motion.h1
              {...fadeInUp}
              transition={{ delay: 0.05 }}
              className="font-display text-2xl font-medium text-foreground"
            >
              {firstName} 👋
            </motion.h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center border border-border/60 shadow-sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center border border-border/60 shadow-sm">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Baby card */}
        {baby ? (
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur rounded-3xl p-4 border border-border/60 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-2xl shadow-md">
                {baby.gender === 'female' ? '👧' : '👦'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-base">{baby.name}</p>
                <p className="text-muted-foreground text-sm">{calculateAge(baby.birth_date)}</p>
              </div>
              {activeSleeep && (
                <div className="flex items-center gap-1.5 bg-lavender-100 dark:bg-purple-950/50 text-lavender-600 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-lavender-500 animate-pulse" />
                  <span className="text-xs font-medium">Dormindo</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <Link
              href="/baby"
              className="flex items-center gap-3 bg-card/80 backdrop-blur rounded-3xl p-4 border border-dashed border-rose-300 dark:border-rose-800 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Adicionar bebê</p>
                <p className="text-muted-foreground text-xs">Comece registrando seu bebê</p>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Stats grid */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Resumo de hoje</p>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Link href={card.href} className="block stat-card hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 ${colorMap[card.color]}`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Ações rápidas</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '🍼', label: 'Mamada', href: '/baby?action=feeding' },
            { icon: '😴', label: 'Sono', href: '/baby?action=sleep' },
            { icon: '👶', label: 'Fralda', href: '/baby?action=diaper' },
            { icon: '💜', label: 'Saúde', href: '/mother?action=health' },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link href={action.href} className="action-btn">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-4 p-4 rounded-3xl bg-gradient-to-br from-lavender-50 to-rose-50 dark:from-purple-950/30 dark:to-rose-950/20 border border-lavender-100 dark:border-purple-900/30"
      >
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-foreground">Dica do dia</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Bebês recém-nascidos precisam mamar a cada 2-3h. Use o BabyCare para monitorar os intervalos e garantir a nutrição adequada.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
