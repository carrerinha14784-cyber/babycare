'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  babyId: string
  onSaved: () => void
}

const DIAPER_TYPES = [
  { value: 'urine', label: '💧', sub: 'Urina' },
  { value: 'poop', label: '💩', sub: 'Fezes' },
  { value: 'both', label: '💧💩', sub: 'Ambos' },
]

export function DiaperModal({ open, onClose, babyId, onSaved }: Props) {
  const [diaperType, setDiaperType] = useState('urine')
  const [hasDiarrhea, setHasDiarrhea] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      changed_at: new Date().toISOString().slice(0, 16),
      notes: '',
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('diaper_records').insert({
      baby_id: babyId,
      user_id: user.id,
      changed_at: data.changed_at,
      diaper_type: diaperType,
      has_diarrhea: hasDiarrhea,
      notes: data.notes || null,
    })

    setIsLoading(false)
    if (!error) {
      reset()
      setHasDiarrhea(false)
      setDiaperType('urine')
      onSaved()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-3xl p-6 mx-4">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Troca de Fralda 👶</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div>
            <Label className="text-sm mb-2 block">Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {DIAPER_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setDiaperType(t.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                    diaperType === t.value
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-2xl">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {(diaperType === 'poop' || diaperType === 'both') && (
            <div>
              <Label className="text-sm mb-2 block">Tem diarreia?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: false, label: '✅ Não' },
                  { value: true, label: '⚠️ Sim' },
                ].map(opt => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setHasDiarrhea(opt.value)}
                    className={`p-3 rounded-2xl border text-sm font-medium transition-all ${
                      hasDiarrhea === opt.value
                        ? opt.value
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600'
                          : 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-600'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Horário</Label>
            <Input type="datetime-local" className="h-11 rounded-xl" {...register('changed_at')} />
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Input placeholder="Ex: cor diferente" className="h-11 rounded-xl" {...register('notes')} />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-md shadow-orange-400/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar registro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
