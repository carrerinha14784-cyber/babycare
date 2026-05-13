'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Senhas não conferem',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    const supabase = createSupabaseClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    })

    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    toast({
      title: 'Conta criada! 🎉',
      description: 'Bem-vinda ao BabyCare!',
    })
    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="relative h-40 hero-gradient overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-xl">
            <span className="text-2xl">🍼</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-6 pt-8 pb-8"
      >
        <h2 className="font-display text-2xl font-medium text-foreground mb-1">Criar conta</h2>
        <p className="text-muted-foreground text-sm mb-8">Comece sua jornada com o BabyCare</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Seu nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="full_name"
                placeholder="Maria Silva"
                className="pl-10 h-12 rounded-xl border-border/60"
                {...register('full_name')}
              />
            </div>
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 h-12 rounded-xl border-border/60"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 rounded-xl border-border/60"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-12 rounded-xl border-border/60"
                {...register('confirm_password')}
              />
            </div>
            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-0 shadow-lg shadow-rose-500/20 mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar conta grátis'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-rose-500 font-medium hover:text-rose-600">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
