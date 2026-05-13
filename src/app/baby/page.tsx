'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Moon, Droplets, Baby, Thermometer, ChevronRight, Play, Square } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDateTime, formatDuration, MILK_TYPE_LABELS, DIAPER_TYPE_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { SleepModal } from '@/components/baby/SleepModal'
import { FeedingModal } from '@/components/baby/FeedingModal'
import { DiaperModal } from '@/components/baby/DiaperModal'
import { HealthModal } from '@/components/baby/HealthModal'
import type { SleepRecord, FeedingRecord, DiaperRecord } from '@/types'

const tabs = [
  { id: 'feeding', label: 'Mamadas', icon: '🍼' },
  { id: 'sleep', label: 'Sono', icon: '😴' },
  { id: 'diaper', label: 'Fraldas', icon: '👶' },
  { id: 'health', label: 'Saúde', icon: '🩺' },
]

export default function BabyPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'feeding')
  const [babyId, setBabyId] = useState<string | null>(null)
  const [babyName, setBabyName] = useState('')
  const [showModal, setShowModal] = useState<string | null>(null)

  const [feedings, setFeedings] = useState<FeedingRecord[]>([])
  const [sleeps, setSleeps] = useState<SleepRecord[]>([])
  const [diapers, setDiapers] = useState<DiaperRecord[]>([])
  const [activeSleep, setActiveSleep] = useState<SleepRecord | null>(null)

  const supabase = createSupabaseClient()

  const loadBaby = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('babies')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (data) {
      setBabyId(data.id)
      setBabyName(data.name)
    }
  }, [])

  const loadFeedings = useCallback(async () => {
    if (!babyId) return
    const { data } = await supabase
      .from('feeding_records')
      .select('*')
      .eq('baby_id', babyId)
      .order('fed_at', { ascending: false })
      .limit(20)
    setFeedings(data || [])
  }, [babyId])

  const loadSleeps = useCallback(async () => {
    if (!babyId) return
    const { data } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('baby_id', babyId)
      .order('sleep_start', { ascending: false })
      .limit(20)
    setSleeps(data || [])
    setActiveSleep(data?.find(s => !s.sleep_end) || null)
  }, [babyId])

  const loadDiapers = useCallback(async () => {
    if (!babyId) return
    const { data } = await supabase
      .from('diaper_records')
      .select('*')
      .eq('baby_id', babyId)
      .order('changed_at', { ascending: false })
      .limit(20)
    setDiapers(data || [])
  }, [babyId])

  useEffect(() => { loadBaby() }, [loadBaby])
  useEffect(() => {
    if (babyId) {
      loadFeedings()
      loadSleeps()
      loadDiapers()
    }
  }, [babyId, loadFeedings, loadSleeps, loadDiapers])

  useEffect(() => {
    const action = searchParams.get('action')
    if (action) setShowModal(action)
  }, [searchParams])

  const stopSleep = async () => {
    if (!activeSleep) return
    const { error } = await supabase
      .from('sleep_records')
      .update({ sleep_end: new Date().toISOString() })
      .eq('id', activeSleep.id)

    if (!error) {
      toast({ title: 'Sono finalizado! 😴' })
      loadSleeps()
    }
  }

  const onSaved = () => {
    setShowModal(null)
    loadFeedings()
    loadSleeps()
    loadDiapers()
    toast({ title: 'Registro salvo! ✅' })
  }

  const colorAccent: Record<string, string> = {
    feeding: 'bg-rose-500',
    sleep: 'bg-lavender-500',
    diaper: 'bg-peach-400',
    health: 'bg-sage-500',
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="hero-gradient pt-14 pb-4 px-5">
        <h1 className="font-display text-2xl font-medium text-foreground">
          {babyName || 'Bebê'} 👶
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Registros do dia</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/60 px-5">
        <div className="flex gap-1 py-2 no-scrollbar overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-2">
        {/* Active sleep banner */}
        {activeTab === 'sleep' && activeSleep && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl bg-lavender-50 dark:bg-purple-950/30 border border-lavender-200 dark:border-purple-900/40 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-lavender-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">Dormindo agora</p>
                <p className="text-xs text-muted-foreground">
                  Iniciou às {formatDateTime(activeSleep.sleep_start)}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={stopSleep}
              className="gap-1.5 rounded-xl border-lavender-300 text-lavender-700"
            >
              <Square className="w-3 h-3 fill-current" />
              Finalizar
            </Button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {/* Feeding tab */}
            {activeTab === 'feeding' && (
              <div className="space-y-3">
                {feedings.length === 0 ? (
                  <EmptyState emoji="🍼" label="Nenhuma mamada registrada hoje" />
                ) : (
                  feedings.map(f => (
                    <div key={f.id} className="bg-card rounded-2xl p-4 border border-border/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{MILK_TYPE_LABELS[f.milk_type]}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatDateTime(f.fed_at)}
                            {f.amount_ml && ` · ${f.amount_ml}ml`}
                            {f.duration_minutes && ` · ${f.duration_minutes}min`}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-xl">
                          🍼
                        </div>
                      </div>
                      {f.notes && <p className="text-xs text-muted-foreground mt-2 italic">{f.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sleep tab */}
            {activeTab === 'sleep' && (
              <div className="space-y-3">
                {sleeps.length === 0 ? (
                  <EmptyState emoji="😴" label="Nenhum período de sono registrado" />
                ) : (
                  sleeps.map(s => (
                    <div key={s.id} className="bg-card rounded-2xl p-4 border border-border/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {s.sleep_end ? formatDuration(s.duration_minutes || 0) : '⏳ Em andamento'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatDateTime(s.sleep_start)}
                            {s.sleep_end && ` → ${formatDateTime(s.sleep_end)}`}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-lavender-50 dark:bg-purple-950/30 flex items-center justify-center text-xl">
                          😴
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Diaper tab */}
            {activeTab === 'diaper' && (
              <div className="space-y-3">
                {diapers.length === 0 ? (
                  <EmptyState emoji="👶" label="Nenhuma troca registrada hoje" />
                ) : (
                  diapers.map(d => (
                    <div key={d.id} className="bg-card rounded-2xl p-4 border border-border/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{DIAPER_TYPE_LABELS[d.diaper_type]}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatDateTime(d.changed_at)}
                            {d.has_diarrhea && ' · ⚠️ Diarreia'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-peach-50 dark:bg-orange-950/30 flex items-center justify-center text-xl">
                          👶
                        </div>
                      </div>
                      {d.notes && <p className="text-xs text-muted-foreground mt-2 italic">{d.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Health tab */}
            {activeTab === 'health' && (
              <EmptyState emoji="🩺" label="Registre a saúde do bebê" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(activeTab)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-500/30 text-white"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Modals */}
      {babyId && (
        <>
          <FeedingModal
            open={showModal === 'feeding'}
            onClose={() => setShowModal(null)}
            babyId={babyId}
            onSaved={onSaved}
          />
          <SleepModal
            open={showModal === 'sleep'}
            onClose={() => setShowModal(null)}
            babyId={babyId}
            onSaved={onSaved}
          />
          <DiaperModal
            open={showModal === 'diaper'}
            onClose={() => setShowModal(null)}
            babyId={babyId}
            onSaved={onSaved}
          />
          <HealthModal
            open={showModal === 'health'}
            onClose={() => setShowModal(null)}
            babyId={babyId}
            onSaved={onSaved}
          />
        </>
      )}
    </div>
  )
}

function EmptyState({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-3">{emoji}</span>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-muted-foreground/60 text-xs mt-1">Toque no + para registrar</p>
    </div>
  )
}
