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

const MILK_TYPES = [
  { value: 'breast', label: '🤱 Leite Materno', sub: 'amamentação' },
  { value: 'formula', label: '🍼 Fórmula', sub: 'leite em pó' },
  { value: 'other', label: '🥛 Outro', sub: 'suco, água...' },
]

export function FeedingModal({ open, onClose, babyId, onSaved }: Props) {
  const [milkType, setMilkType] = useState('breast')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fed_at: new Date().toISOString().slice(0, 16),
      amount_ml: '',
      duration_minutes: '',
      notes: '',
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('feeding_records').insert({
      baby_id: babyId,
      user_id: user.id,
      fed_at: data.fed_at,
      milk_type: milkType,
      amount_ml: data.amount_ml ? parseInt(data.amount_ml) : null,
      duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
      notes: data.notes || null,
    })

    setIsLoading(false)
    if (!error) {
      reset()
      onSaved()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-3xl p-6 mx-4">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Registrar Mamada 🍼</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Milk type selector */}
          <div>
            <Label className="text-sm mb-2 block">Tipo de leite</Label>
            <div className="grid grid-cols-3 gap-2">
              {MILK_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setMilkType(t.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-center transition-all ${
                    milkType === t.value
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'
                      : 'border-border bg-card hover:border-rose-200'
                  }`}
                >
                  <span className="text-2xl">{t.label.split(' ')[0]}</span>
                  <span className="text-[10px] text-muted-foreground">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fed_at">Horário</Label>
            <Input
              id="fed_at"
              type="datetime-local"
              className="h-11 rounded-xl"
              {...register('fed_at')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {milkType !== 'breast' && (
              <div className="space-y-2">
                <Label htmlFor="amount_ml">Quantidade (ml)</Label>
                <Input
                  id="amount_ml"
                  type="number"
                  placeholder="ex: 120"
                  className="h-11 rounded-xl"
                  {...register('amount_ml')}
                />
              </div>
            )}
            {milkType === 'breast' && (
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duração (min)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  placeholder="ex: 20"
                  className="h-11 rounded-xl"
                  {...register('duration_minutes')}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              placeholder="Ex: dormiu durante a mamada"
              className="h-11 rounded-xl"
              {...register('notes')}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 border-0 shadow-md shadow-rose-500/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar registro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
