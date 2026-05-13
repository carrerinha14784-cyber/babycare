'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'

export default function SplashPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 2200))
      
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/auth/onboarding')
      }
    }
    
    checkAuth()
  }, [router])

  return (
    <div className="fixed inset-0 hero-gradient flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-rose-300/20 blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-lavender-300/20 blur-3xl animate-float animation-delay-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-peach-200/15 blur-2xl animate-float animation-delay-200" />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Icon */}
        <div className="relative mb-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-2xl glow"
          >
            <span className="text-5xl">🍼</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-sage-400 flex items-center justify-center shadow-lg"
          >
            <span className="text-base">✨</span>
          </motion.div>
        </div>

        {/* Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-5xl font-medium text-foreground tracking-tight"
        >
          BabyCare
        </motion.h1>
        
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-2 text-muted-foreground text-base font-light"
        >
          Cada momento importa
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex gap-1.5"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-rose-400"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
