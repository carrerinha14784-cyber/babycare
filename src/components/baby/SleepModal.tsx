'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseClient } from '@/lib/supabase'
import { Loader2, Play, Clock } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  babyId: string
  onSaved: () => void
}

export function SleepModal({ open, onClose, babyId, onSaved }: Props) {
  const [mode, setMode] = useState<'now' | 'manual'>('now')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      sleep_start: new Date().toISOString().slice(0, 16),
      sleep_end: '',
      notes: '',
    }
  })

  const startNow = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('sleep_records').insert({
      baby_id: babyId,
      user_id: user.id,
      sleep_start: new Date().toISOString(),
    })

    setIsLoading(false)
    if (!error) {
      reset()
      onSaved()
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('sleep_records').insert({
      baby_id: babyId,
      user_id: user.id,
      sleep_start: data.sleep_start,
      sleep_end: data.sleep_end || null,
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
          <DialogTitle className="font-display text-xl">Registrar Sono 😴</DialogTitle>
        </DialogHeader>

        {/* Mode switcher */}
        <div className="grid grid-cols-2 gap-2 mt-2 p-1 bg-muted rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('now')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === 'now' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Começou agora
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === 'manual' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Registrar manual
          </button>
        </div>

        {mode === 'now' ? (
          <div className="space-y-4 mt-2">
            <div className="text-center p-6 rounded-2xl bg-lavender-50 dark:bg-purple-950/30">
              <span className="text-5xl">😴</span>
              <p className="text-sm text-muted-foreground mt-2">
                O sono será iniciado agora e você poderá finalizar quando acordar.
              </p>
            </div>
            <Button
              onClick={startNow}
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-lavender-500 to-lavender-600 border-0 shadow-md"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '▶ Iniciar sono agora'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Dormiu às</Label>
              <Input type="datetime-local" className="h-11 rounded-xl" {...register('sleep_start')} />
            </div>
            <div className="space-y-2">
              <Label>Acordou às (opcional)</Label>
              <Input type="datetime-local" className="h-11 rounded-xl" {...register('sleep_end')} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input placeholder="Ex: dormiu bem" className="h-11 rounded-xl" {...register('notes')} />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-lavender-500 to-lavender-600 border-0 shadow-md"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
