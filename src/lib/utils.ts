import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: ptBR })
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'HH:mm', { locale: ptBR })
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd/MM HH:mm', { locale: ptBR })
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const diffMs = now.getTime() - birth.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (days < 7) return `${days} dia${days !== 1 ? 's' : ''}`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} semana${weeks !== 1 ? 's' : ''}`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} ${months !== 1 ? 'meses' : 'mês'}`
  }
  const years = Math.floor(days / 365)
  const remainingMonths = Math.floor((days % 365) / 30)
  if (remainingMonths === 0) return `${years} ano${years !== 1 ? 's' : ''}`
  return `${years}a ${remainingMonths}m`
}

export const MILK_TYPE_LABELS: Record<string, string> = {
  breast: '🤱 Leite Materno',
  formula: '🍼 Fórmula',
  other: '🥛 Outro',
}

export const DIAPER_TYPE_LABELS: Record<string, string> = {
  urine: '💧 Urina',
  poop: '💩 Fezes',
  both: '💧💩 Ambos',
}

export const MOOD_LABELS: Record<string, { label: string; emoji: string }> = {
  great: { label: 'Ótimo', emoji: '😄' },
  good: { label: 'Bem', emoji: '🙂' },
  neutral: { label: 'Neutro', emoji: '😐' },
  bad: { label: 'Mal', emoji: '😟' },
  terrible: { label: 'Péssimo', emoji: '😢' },
}

export const MOOD_COLORS: Record<string, string> = {
  great: '#22c55e',
  good: '#84cc16',
  neutral: '#eab308',
  bad: '#f97316',
  terrible: '#ef4444',
}
