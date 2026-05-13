'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, Activity } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDateTime, MOOD_LABELS, MOOD_COLORS } from '@/lib/utils'
import { MotherHealthModal } from '@/components/mother/MotherHealthModal'
import { useToast } from '@/components/ui/use-toast'
import type { MotherHealthRecord } from '@/types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const tabs = [
  { id: 'today', label: 'Hoje' },
  { id: 'history', label: 'Histórico' },
  { id: 'charts', label: 'Gráficos' },
]

export default function MotherPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('today')
  const [records, setRecords] = useState<MotherHealthRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<MotherHealthRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createSupabaseClient()

  const loadRecords = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('mother_health_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(30)

    setRecords(data || [])
    const today = data?.find(r => {
      const d = new Date(r.recorded_at)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    })
    setTodayRecord(today || null)
  }, [])

  useEffect(() => { loadRecords() }, [loadRecords])

  const onSaved = () => {
    setShowModal(false)
    loadRecords()
    toast({ title: 'Registro salvo! 💜' })
  }

  const chartData = records
    .slice(0, 14)
    .reverse()
    .filter(r => r.systolic_pressure)
    .map(r => ({
      date: format(new Date(r.recorded_at), 'dd/MM'),
      sistolica: r.systolic_pressure,
      diastolica: r.diastolic_pressure,
    }))

  const moodData = records
    .slice(0, 14)
    .reverse()
    .filter(r => r.mood)
    .map(r => ({
      date: format(new Date(r.recorded_at), 'dd/MM'),
      humor: { great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }[r.mood!] || 3,
    }))

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, hsl(262 80% 97%) 0%, hsl(347 87% 97%) 100%)'
      }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-lavender-200/20 blur-3xl" />
        <div className="pt-14 pb-6 px-5 relative">
          <h1 className="font-display text-2xl font-medium text-foreground">Minha Saúde 💜</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pós-parto e bem-estar</p>

          {todayRecord && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-card/80 backdrop-blur rounded-2xl border border-border/60 grid grid-cols-3 gap-3"
            >
              <div className="text-center">
                <p className="text-2xl">{MOOD_LABELS[todayRecord.mood || 'neutral'].emoji}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Humor</p>
              </div>
              <div className="text-center border-x border-border/60">
                <p className="text-base font-semibold text-foreground">
                  {todayRecord.systolic_pressure
                    ? `${todayRecord.systolic_pressure}/${todayRecord.diastolic_pressure}`
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Pressão</p>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">
                  {todayRecord.sleep_hours ? `${todayRecord.sleep_hours}h` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Sono</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/60 px-5">
        <div className="flex gap-1 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-lavender-50 dark:bg-purple-950/30 text-lavender-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Today tab */}
            {activeTab === 'today' && (
              <div>
                {!todayRecord ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <span className="text-5xl mb-3">💜</span>
                    <p className="text-muted-foreground text-sm">Nenhum registro hoje</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Como você está se sentindo?</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Vitals */}
                    <div className="bg-card rounded-2xl p-4 border border-border/60">
                      <p className="text-sm font-medium text-foreground mb-3">Sinais vitais</p>
                      <div className="grid grid-cols-2 gap-3">
                        <VitalItem
                          label="Pressão"
                          value={todayRecord.systolic_pressure
                            ? `${todayRecord.systolic_pressure}/${todayRecord.diastolic_pressure} mmHg`
                            : '—'}
                          icon="💗"
                          alert={todayRecord.systolic_pressure && todayRecord.systolic_pressure > 140}
                        />
                        <VitalItem label="FC" value={todayRecord.heart_rate ? `${todayRecord.heart_rate} bpm` : '—'} icon="❤️" />
                        <VitalItem label="Temperatura" value={todayRecord.temperature ? `${todayRecord.temperature}°C` : '—'} icon="🌡️" />
                        <VitalItem label="Sono" value={todayRecord.sleep_hours ? `${todayRecord.sleep_hours}h` : '—'} icon="😴" />
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="bg-card rounded-2xl p-4 border border-border/60">
                      <p className="text-sm font-medium text-foreground mb-3">Sintomas</p>
                      <div className="flex flex-wrap gap-2">
                        {todayRecord.has_headache && <Tag label="Dor de cabeça" color="red" />}
                        {todayRecord.has_nausea && <Tag label="Náusea" color="orange" />}
                        {todayRecord.has_fever && <Tag label="Febre" color="red" />}
                        {!todayRecord.has_headache && !todayRecord.has_nausea && !todayRecord.has_fever && (
                          <p className="text-sm text-muted-foreground">✅ Sem sintomas registrados</p>
                        )}
                      </div>
                    </div>

                    {/* Mood */}
                    <div className="bg-card rounded-2xl p-4 border border-border/60 flex items-center gap-3">
                      <span className="text-4xl">{MOOD_LABELS[todayRecord.mood || 'neutral'].emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Humor: {MOOD_LABELS[todayRecord.mood || 'neutral'].label}
                        </p>
                        {todayRecord.energy_level && (
                          <p className="text-xs text-muted-foreground">
                            Energia: {'⚡'.repeat(todayRecord.energy_level)}
                          </p>
                        )}
                      </div>
                    </div>

                    {todayRecord.notes && (
                      <div className="bg-card rounded-2xl p-4 border border-border/60">
                        <p className="text-xs text-muted-foreground italic">{todayRecord.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* History tab */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {records.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <span className="text-5xl mb-3">📅</span>
                    <p className="text-muted-foreground text-sm">Nenhum histórico ainda</p>
                  </div>
                ) : (
                  records.map(r => (
                    <div key={r.id} className="bg-card rounded-2xl p-4 border border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{MOOD_LABELS[r.mood || 'neutral'].emoji}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {MOOD_LABELS[r.mood || 'neutral'].label}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(r.recorded_at)}</p>
                          </div>
                        </div>
                        {r.systolic_pressure && (
                          <p className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded-lg">
                            {r.systolic_pressure}/{r.diastolic_pressure}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.has_headache && <Tag label="Cefaleia" color="red" />}
                        {r.has_nausea && <Tag label="Náusea" color="orange" />}
                        {r.has_fever && <Tag label="Febre" color="red" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Charts tab */}
            {activeTab === 'charts' && (
              <div className="space-y-6">
                {chartData.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Pressão arterial</p>
                    <div className="bg-card rounded-2xl p-4 border border-border/60">
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorSist" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[60, 160]} />
                          <Tooltip />
                          <Area type="monotone" dataKey="sistolica" stroke="#f43f5e" fill="url(#colorSist)" strokeWidth={2} />
                          <Area type="monotone" dataKey="diastolica" stroke="#fb923c" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <span className="text-5xl mb-3">📊</span>
                    <p className="text-muted-foreground text-sm">Dados insuficientes para gráficos</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Registre mais dados para ver tendências</p>
                  </div>
                )}

                {moodData.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Humor ao longo do tempo</p>
                    <div className="bg-card rounded-2xl p-4 border border-border/60">
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={moodData}>
                          <defs>
                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip />
                          <Area type="monotone" dataKey="humor" stroke="#a855f7" fill="url(#colorMood)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center shadow-xl shadow-lavender-500/30 text-white"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      <MotherHealthModal open={showModal} onClose={() => setShowModal(false)} onSaved={onSaved} />
    </div>
  )
}

function VitalItem({ label, value, icon, alert }: { label: string; value: string; icon: string; alert?: any }) {
  return (
    <div className={`p-3 rounded-xl ${alert ? 'bg-red-50 dark:bg-red-950/20' : 'bg-muted/50'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`text-sm font-semibold ${alert ? 'text-red-600' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function Tag({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/30',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[color] || colors.red}`}>
      {label}
    </span>
  )
}
