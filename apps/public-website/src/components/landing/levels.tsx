'use client'

import { motion } from 'framer-motion'
import { BookOpen, Beaker, Palette, Globe, Calculator, Music } from 'lucide-react'

const niveles = [
  {
    year: '1° y 2° Año',
    title: 'Ciclo Básico',
    description: 'Formación fundamental en todas las áreas del conocimiento. Los estudiantes descubren sus intereses y desarrollan habilidades esenciales.',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    materias: ['Matemática', 'Lengua', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Educación Física'],
  },
  {
    year: '3° y 4° Año',
    title: 'Ciclo Orientado',
    description: 'Los estudiantes eligen orientación según sus intereses. Profundización en áreas específicas con proyectos interdisciplinarios.',
    icon: Beaker,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    materias: ['Matemática Avanzada', 'Física', 'Química', 'Literatura', 'Historia', 'Inglés Técnico'],
  },
  {
    year: '5° y 6° Año',
    title: 'Preparación Universitaria',
    description: 'Orientación vocacional, prácticas profesionales y preparación intensiva para el ingreso a la universidad.',
    icon: Globe,
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    materias: ['Cálculo', 'Filosofía', 'Economía', 'Proyecto Final', 'Orientación Vocacional', 'Taller de Inglés'],
  },
]

export function Levels() {
  return (
    <section id="niveles" className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-semibold font-poppins text-sm tracking-widest uppercase">
            Niveles Educativos
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mt-3 mb-4">
            Un camino diseñado para
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              cada etapa
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Nuestro plan de estudios está organizado en ciclos que acompañan el desarrollo 
            académico y personal de cada estudiante.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {niveles.map((nivel, index) => (
            <motion.div
              key={nivel.year}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Icono */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${nivel.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <nivel.icon className="h-8 w-8 text-white" />
              </div>

              {/* Badge año */}
              <span className="text-sm font-semibold font-poppins text-amber-500 mb-2 block">
                {nivel.year}
              </span>

              <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-3">
                {nivel.title}
              </h3>

              <p className="text-gray-500 mb-6 leading-relaxed">
                {nivel.description}
              </p>

              {/* Materias */}
              <div className="border-t pt-6">
                <p className="text-sm font-semibold font-poppins text-gray-700 mb-3">
                  Materias principales:
                </p>
                <div className="flex flex-wrap gap-2">
                  {nivel.materias.map(materia => (
                    <span
                      key={materia}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                    >
                      {materia}
                    </span>
                  ))}
                </div>
              </div>

              {/* Decoración */}
              <div className="absolute -bottom-2 left-8 right-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}