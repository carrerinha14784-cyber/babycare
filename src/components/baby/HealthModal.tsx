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

export function HealthModal({ open, onClose, babyId, onSaved }: Props) {
  const [hasFever, setHasFever] = useState(false)
  const [hasColic, setHasColic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      temperature: '',
      weight: '',
      medications: '',
      notes: '',
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('baby_health_records').insert({
      baby_id: babyId,
      user_id: user.id,
      has_fever: hasFever,
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      has_colic: hasColic,
      weight: data.weight ? parseFloat(data.weight) : null,
      medications: data.medications
        ? [{ name: data.medications, dose: '', time: new Date().toISOString() }]
        : [],
      notes: data.notes || null,
    })

    setIsLoading(false)
    if (!error) {
      reset()
      setHasFever(false)
      setHasColic(false)
      onSaved()
    }
  }

  const BoolBtn = ({ value, onChange, yes, no }: any) => (
    <div className="grid grid-cols-2 gap-2">
      {[{ v: false, l: no }, { v: true, l: yes }].map(opt => (
        <button
          key={String(opt.v)}
          type="button"
          onClick={() => onChange(opt.v)}
          className={`p-3 rounded-2xl border text-sm font-medium transition-all ${
            value === opt.v
              ? opt.v
                ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600'
                : 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-600'
              : 'border-border bg-card text-muted-foreground'
          }`}
        >
          {opt.l}
        </button>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-3xl p-6 mx-4 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Saúde do Bebê 🩺</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div>
            <Label className="mb-2 block">Febre?</Label>
            <BoolBtn value={hasFever} onChange={setHasFever} yes="🌡️ Sim" no="✅ Não" />
          </div>

          {hasFever && (
            <div className="space-y-2">
              <Label>Temperatura (°C)</Label>
              <Input type="number" step="0.1" placeholder="37.5" className="h-11 rounded-xl" {...register('temperature')} />
            </div>
          )}

          <div>
            <Label className="mb-2 block">Cólicas?</Label>
            <BoolBtn value={hasColic} onChange={setHasColic} yes="😢 Sim" no="✅ Não" />
          </div>

          <div className="space-y-2">
            <Label>Peso (kg) — opcional</Label>
            <Input type="number" step="0.01" placeholder="4.5" className="h-11 rounded-xl" {...register('weight')} />
          </div>

          <div className="space-y-2">
            <Label>Medicamento (opcional)</Label>
            <Input placeholder="Ex: Luftal 10 gotas" className="h-11 rounded-xl" {...register('medications')} />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Input placeholder="Ex: choros frequentes" className="h-11 rounded-xl" {...register('notes')} />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-sage-500 to-sage-600 border-0 shadow-md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
