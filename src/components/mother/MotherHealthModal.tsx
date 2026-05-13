'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { MOOD_LABELS } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const MOODS = ['great', 'good', 'neutral', 'bad', 'terrible'] as const

export function MotherHealthModal({ open, onClose, onSaved }: Props) {
  const [mood, setMood] = useState<string>('neutral')
  const [hasHeadache, setHasHeadache] = useState(false)
  const [hasNausea, setHasNausea] = useState(false)
  const [hasFever, setHasFever] = useState(false)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      systolic_pressure: '',
      diastolic_pressure: '',
      heart_rate: '',
      temperature: '',
      sleep_hours: '',
      notes: '',
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('mother_health_records').insert({
      user_id: user.id,
      mood,
      has_headache: hasHeadache,
      has_nausea: hasNausea,
      has_fever: hasFever,
      energy_level: energyLevel,
      systolic_pressure: data.systolic_pressure ? parseInt(data.systolic_pressure) : null,
      diastolic_pressure: data.diastolic_pressure ? parseInt(data.diastolic_pressure) : null,
      heart_rate: data.heart_rate ? parseInt(data.heart_rate) : null,
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      sleep_hours: data.sleep_hours ? parseFloat(data.sleep_hours) : null,
      notes: data.notes || null,
    })

    setIsLoading(false)
    if (!error) {
      reset()
      setMood('neutral')
      setHasHeadache(false)
      setHasNausea(false)
      setHasFever(false)
      setEnergyLevel(3)
      onSaved()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-3xl p-6 mx-4 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Como você está? 💜</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Mood */}
          <div>
            <Label className="mb-2 block">Humor do dia</Label>
            <div className="flex justify-between gap-1">
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all ${
                    mood === m
                      ? 'border-lavender-400 bg-lavender-50 dark:bg-purple-950/30'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-xl">{MOOD_LABELS[m].emoji}</span>
                  <span className="text-[9px] text-muted-foreground">{MOOD_LABELS[m].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div>
            <Label className="mb-2 block">Nível de energia</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergyLevel(n)}
                  className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-all ${
                    energyLevel >= n
                      ? 'border-peach-400 bg-peach-50 dark:bg-orange-950/30 text-orange-500'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  ⚡
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <Label className="mb-2 block">Sintomas</Label>
            <div className="space-y-2">
              {[
                { label: '🤕 Dor de cabeça', value: hasHeadache, setter: setHasHeadache },
                { label: '🤢 Náusea', value: hasNausea, setter: setHasNausea },
                { label: '🌡️ Febre', value: hasFever, setter: setHasFever },
              ].map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => s.setter(!s.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                    s.value
                      ? 'border-red-300 bg-red-50 dark:bg-red-950/20 text-red-600'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.value ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                    {s.value ? 'Sim' : 'Não'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div>
            <Label className="mb-2 block">Sinais vitais (opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sistólica</p>
                <Input type="number" placeholder="120" className="h-10 rounded-xl text-sm" {...register('systolic_pressure')} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Diastólica</p>
                <Input type="number" placeholder="80" className="h-10 rounded-xl text-sm" {...register('diastolic_pressure')} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">FC (bpm)</p>
                <Input type="number" placeholder="72" className="h-10 rounded-xl text-sm" {...register('heart_rate')} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Temp (°C)</p>
                <Input type="number" step="0.1" placeholder="36.5" className="h-10 rounded-xl text-sm" {...register('temperature')} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Horas de sono</Label>
            <Input type="number" step="0.5" placeholder="7.5" className="h-11 rounded-xl" {...register('sleep_hours')} />
          </div>

          <div className="space-y-2">
            <Label>Observações pessoais</Label>
            <Input placeholder="Como foi seu dia?" className="h-11 rounded-xl" {...register('notes')} />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-lavender-500 to-lavender-600 border-0 shadow-md shadow-lavender-500/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar registro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
