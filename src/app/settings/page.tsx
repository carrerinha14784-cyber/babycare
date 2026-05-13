'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Sun, Moon, LogOut, User, Baby, Bell, Shield, ChevronRight,
  Smartphone, Info, Trash2
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import type { Profile, Baby as BabyType } from '@/types'
import { calculateAge, formatDate } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [baby, setBaby] = useState<BabyType | null>(null)
  const [showAddBaby, setShowAddBaby] = useState(false)
  const [babyForm, setBabyForm] = useState({ name: '', birth_date: '', gender: 'female' })
  const supabase = createSupabaseClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: babyData } = await supabase
        .from('babies').select('*').eq('user_id', user.id).eq('is_active', true).single()
      setBaby(babyData)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  const saveBaby = async () => {
    if (!babyForm.name || !babyForm.birth_date) {
      toast({ title: 'Preencha nome e data de nascimento', variant: 'destructive' })
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('babies').insert({
      user_id: user.id,
      name: babyForm.name,
      birth_date: babyForm.birth_date,
      gender: babyForm.gender,
    }).select().single()

    if (!error) {
      setBaby(data)
      setShowAddBaby(false)
      toast({ title: `${babyForm.name} adicionado! 🍼` })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="hero-gradient pt-14 pb-6 px-5">
        <h1 className="font-display text-2xl font-medium text-foreground">Configurações ⚙️</h1>
      </div>

      <div className="px-5 pt-5 pb-2 space-y-4">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-4 border border-border/60 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-lavender-500 flex items-center justify-center text-2xl shadow-md">
            👩
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{profile?.full_name || 'Usuário'}</p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </motion.div>

        {/* Baby card */}
        {baby ? (
          <div className="bg-card rounded-3xl p-4 border border-border/60">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Bebê cadastrado</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-xl">
                {baby.gender === 'female' ? '👧' : '👦'}
              </div>
              <div>
                <p className="font-medium text-foreground">{baby.name}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateAge(baby.birth_date)} · Nascido em {formatDate(baby.birth_date)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border/60">
            {!showAddBaby ? (
              <button
                onClick={() => setShowAddBaby(true)}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 rounded-3xl transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground text-sm">Adicionar bebê</p>
                  <p className="text-xs text-muted-foreground">Cadastre o nome e data de nascimento</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : (
              <div className="p-4 space-y-3">
                <p className="font-medium text-foreground text-sm">Dados do bebê</p>
                <input
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                  placeholder="Nome do bebê"
                  value={babyForm.name}
                  onChange={e => setBabyForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  type="date"
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm"
                  value={babyForm.birth_date}
                  onChange={e => setBabyForm(f => ({ ...f, birth_date: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  {['female', 'male'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setBabyForm(f => ({ ...f, gender: g }))}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        babyForm.gender === g
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {g === 'female' ? '👧 Menina' : '👦 Menino'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddBaby(false)}
                    className="flex-1 h-11 rounded-xl border border-border text-sm text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveBaby}
                    className="flex-1 h-11 rounded-xl bg-rose-500 text-white text-sm font-medium shadow-md shadow-rose-500/20"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Appearance */}
        <Section title="Aparência">
          <SettingRow
            icon={theme === 'dark' ? Moon : Sun}
            label="Tema"
            value={theme === 'dark' ? 'Escuro' : 'Claro'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            iconColor="text-peach-500"
            iconBg="bg-peach-50 dark:bg-orange-950/30"
          />
        </Section>

        {/* App info */}
        <Section title="Sobre">
          <SettingRow
            icon={Smartphone}
            label="Instalar app (PWA)"
            value="Adicione à tela inicial"
            iconColor="text-sky-500"
            iconBg="bg-sky-50 dark:bg-sky-950/30"
          />
          <SettingRow
            icon={Info}
            label="Versão"
            value="1.0.0"
            iconColor="text-muted-foreground"
            iconBg="bg-muted"
            noArrow
          />
        </Section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-500">Sair da conta</span>
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-card rounded-3xl border border-border/60 divide-y divide-border/60">
        {children}
      </div>
    </div>
  )
}

function SettingRow({
  icon: Icon, label, value, onClick, iconColor, iconBg, noArrow
}: {
  icon: any; label: string; value: string; onClick?: () => void;
  iconColor: string; iconBg: string; noArrow?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors first:rounded-t-3xl last:rounded-b-3xl"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
      {!noArrow && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  )
}
