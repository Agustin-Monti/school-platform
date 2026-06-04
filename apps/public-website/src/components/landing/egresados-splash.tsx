'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Scroll } from 'lucide-react'

export function EgresadosSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onComplete])

  // Todas las promos desde 1964 a 2024
  const promos = Array.from({ length: 61 }, (_, i) => `Promo ${String(2024 - i).slice(-2)}`)
  
  // Generar posiciones aleatorias (más orgánico)
  const getRandomPosition = (index: number) => {
    // Usar seed basado en el índice para que sea consistente
    const seed = index * 7 + 3
    const top = (seed * 13) % 90
    const left = (seed * 17) % 88
    const delay = (index * 0.08) % 3.5
    const size = index % 3 === 0 ? 'text-xs' : index % 3 === 1 ? 'text-sm' : 'text-base'
    
    return { top: `${top}%`, left: `${left}%`, delay, size }
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center overflow-hidden"
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-amber-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Promos flotantes - cubriendo toda la pantalla */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Desktop: mostrar muchas promos */}
        <div className="hidden md:block">
          {promos.map((promo, i) => {
            const { top, left, delay, size } = getRandomPosition(i)
            return (
              <motion.span
                key={promo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: [0, 0.12, 0],
                  y: [20, -5, -20],
                }}
                transition={{ 
                  delay,
                  duration: 3.5,
                  ease: 'easeOut'
                }}
                className={`absolute font-bold font-poppins text-white ${size}`}
                style={{ top, left }}
              >
                {promo}
              </motion.span>
            )
          })}
        </div>

        {/* Mobile: mostrar menos promos pero más grandes */}
        <div className="md:hidden">
          {promos.filter((_, i) => i % 3 === 0).map((promo, i) => {
            const { top, left, delay } = getRandomPosition(i * 3)
            return (
              <motion.span
                key={promo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: [0, 0.15, 0],
                  y: [20, -5, -20],
                }}
                transition={{ 
                  delay: delay * 0.7,
                  duration: 3.5,
                  ease: 'easeOut'
                }}
                className="absolute text-base font-bold font-poppins text-white"
                style={{ top, left }}
              >
                {promo}
              </motion.span>
            )
          })}
        </div>
      </div>

      <div className="relative text-center z-10 px-4">
        {/* Birrete */}
        <motion.div
          initial={{ y: 100, opacity: 0, rotate: -20 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <GraduationCap className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 text-amber-400" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-amber-400 rounded-full filter blur-2xl opacity-30 -z-10"
            />
          </div>
        </motion.div>

        {/* Diploma */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-6"
        >
          <Scroll className="h-12 w-12 sm:h-14 sm:w-14 md:h-18 md:w-18 text-amber-300 mx-auto" />
        </motion.div>

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold font-poppins text-white mb-3">
            Nuestros
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Egresados
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-blue-200 text-base sm:text-lg md:text-2xl font-poppins"
          >
            60 años de historia • 1966 - 2026
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )
}