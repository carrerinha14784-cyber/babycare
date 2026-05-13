'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SplashPage() {
  const router = useRouter()
  useEffect(() => {
    const t = setTimeout(() => router.replace('/dashboard'), 2000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="fixed inset-0 hero-gradient flex flex-col items-center justify-center">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-rose-300/20 blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-300/20 blur-3xl animate-float animation-delay-300" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-2xl mb-6">
          <span className="text-5xl">🍼</span>
        </div>
        <h1 className="font-display text-5xl font-medium text-foreground tracking-tight">BabyCare</h1>
        <p className="mt-2 text-muted-foreground text-base font-light">Cada momento importa</p>
        <div className="mt-10 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-rose-400"
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
