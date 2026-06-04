'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, GraduationCap, Star, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  const { scrollY } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Parallax effects
  const bgY = useTransform(scrollY, [0, 500], [0, 150])
  const textY = useTransform(scrollY, [0, 500], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/images/colegio.jpg"
          alt="Instituto Parroquial Mansilla D64"
          fill
          className="object-cover scale-110"
          priority
          quality={90}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-900/80 to-indigo-900/90" />
        {/* Overlay textura */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      </motion.div>

      {/* Elementos flotantes con parallax mouse */}
      <motion.div
        animate={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
        className="absolute top-1/4 left-[15%] w-64 h-64 bg-amber-500/20 rounded-full blur-3xl z-10"
      />
      <motion.div
        animate={{ x: -mousePosition.x * 0.3, y: -mousePosition.y * 0.3 }}
        className="absolute bottom-1/3 right-[10%] w-96 h-96 bg-blue-500/15 rounded-full blur-3xl z-10"
      />

      {/* Contenido */}
      <motion.div style={{ y: textY }} className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">

        {/* Título gigante con revelado */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-poppins text-white leading-[1.1] mb-6 max-w-5xl mx-auto"
        >
          Formamos
          <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            líderes del mañana
          </span>
        </motion.h1>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-blue-200/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          60 años formando jóvenes con excelencia académica, valores sólidos 
          y preparación para los desafíos del futuro.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href="/registro"
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 bg-amber-500 text-white rounded-full text-lg font-semibold font-poppins hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/25 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Quiero inscribirme
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <a
            href="#sobre"
            className="inline-flex items-center justify-center px-10 py-4 border-2 border-white/20 text-white rounded-full text-lg font-semibold font-poppins hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
          >
            Conocé más
          </a>
        </motion.div>

        {/* Stats glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{ opacity }}
          className="inline-flex flex-wrap justify-center gap-4 md:gap-8"
        >
          {[
            { value: '60+', label: 'Años de historia', icon: Trophy },
            { value: '100+', label: 'Estudiantes', icon: Users },
            { value: '95%', label: 'A la universidad', icon: GraduationCap },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-2xl md:text-3xl font-bold text-white font-poppins">{stat.value}</p>
                <p className="text-xs md:text-sm text-blue-300">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Mouse scroll animado (moderno) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-7 h-11 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
          />
        </div>
        <p className="text-[10px] text-white/40 text-center mt-2 font-poppins">Scroll</p>
      </motion.div>
    </section>
  )
}