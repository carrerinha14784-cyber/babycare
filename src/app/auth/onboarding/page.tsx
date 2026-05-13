'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Baby, Heart, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const slides = [
  {
    emoji: '🍼',
    icon: Baby,
    title: 'Acompanhe seu bebê',
    description: 'Registre mamadas, sono, trocas de fraldas e saúde. Tudo em um só lugar, com amor e cuidado.',
    color: 'from-rose-400 to-rose-600',
    bg: 'from-rose-50 to-peach-50',
    darkBg: 'dark:from-rose-950/20 dark:to-orange-950/20',
  },
  {
    emoji: '💜',
    icon: Heart,
    title: 'Cuide de você também',
    description: 'Monitore sua pressão, humor, sono e bem-estar. O pós-parto é uma jornada, você não está sozinha.',
    color: 'from-lavender-400 to-lavender-600',
    bg: 'from-lavender-50 to-sky-50',
    darkBg: 'dark:from-purple-950/20 dark:to-blue-950/20',
  },
  {
    emoji: '📊',
    icon: BarChart3,
    title: 'Insights inteligentes',
    description: 'Gráficos, relatórios e alertas para entender padrões e compartilhar com seus médicos.',
    color: 'from-sage-400 to-sky-500',
    bg: 'from-sage-50 to-sky-50',
    darkBg: 'dark:from-green-950/20 dark:to-sky-950/20',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const isLast = current === slides.length - 1
  const slide = slides[current]

  const next = () => {
    if (isLast) {
      router.push('/auth/login')
    } else {
      setCurrent(c => c + 1)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      {/* Skip */}
      <div className="flex justify-end p-6">
        <button
          onClick={() => router.push('/auth/login')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Illustration */}
            <div className={`w-40 h-40 rounded-[3rem] bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl`}>
              <span className="text-7xl">{slide.emoji}</span>
            </div>

            <h2 className="font-display text-3xl font-medium text-foreground mb-4 leading-tight">
              {slide.title}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="p-8 flex flex-col gap-6">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrent(i)}
              animate={{ width: i === current ? 24 : 8 }}
              className={`h-2 rounded-full transition-colors ${
                i === current ? 'bg-rose-500' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <Button
          size="lg"
          onClick={next}
          className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-0 shadow-lg shadow-rose-500/25"
        >
          {isLast ? 'Começar agora' : 'Continuar'}
          <ChevronRight className="ml-1 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
