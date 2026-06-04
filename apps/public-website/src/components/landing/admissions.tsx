'use client'

import { motion } from 'framer-motion'
import { 
  FileText, ClipboardCheck, UserPlus, GraduationCap,
  ArrowRight, Calendar, Clock, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

const pasos = [
  {
    step: '01',
    icon: FileText,
    title: 'Formulario Online',
    description: 'Completá el formulario de pre-inscripción con los datos del estudiante.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '02',
    icon: ClipboardCheck,
    title: 'Documentación',
    description: 'Presentá la documentación requerida: DNI, certificado de primaria, fotos.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    step: '03',
    icon: UserPlus,
    title: 'Entrevista',
    description: 'Coordinamos una entrevista con el equipo directivo y el estudiante.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    step: '04',
    icon: GraduationCap,
    title: 'Inicio de Clases',
    description: '¡Bienvenido! El estudiante comienza su camino en la Escuela Moderna.',
    color: 'from-amber-500 to-amber-600',
  },
]

const requisitos = [
  'DNI del estudiante (original y copia)',
  'Certificado de finalización de primaria',
  '2 fotos 4x4 actualizadas',
  'Constancia de CUIL',
  'Ficha médica completa',
  'Entrevista con el equipo directivo',
]

export function Admissions() {
  return (
    <section id="admisiones" className="py-20 md:py-28 bg-gradient-to-b from-blue-50/50 to-white">
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
            Admisiones 2026
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mt-3 mb-4">
            Un proceso
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              simple y transparente
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Te acompañamos en cada paso para que la inscripción sea rápida y sencilla.
          </p>
        </motion.div>

        {/* Pasos */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {pasos.map((paso, index) => (
            <motion.div
              key={paso.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Línea conectora */}
              {index < pasos.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gray-200">
                  <div className="h-full bg-amber-500 w-0 group-hover:w-full transition-all duration-700" />
                </div>
              )}

              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center relative z-10 h-full">
                {/* Número */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${paso.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <paso.icon className="h-8 w-8 text-white" />
                </div>
                
                <span className="text-sm font-bold font-poppins text-amber-500 mb-2 block">
                  Paso {paso.step}
                </span>
                
                <h3 className="text-xl font-bold font-poppins text-gray-900 mb-3">
                  {paso.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed">
                  {paso.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requisitos + CTA */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Requisitos */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-6">
              📋 Requisitos de inscripción
            </h3>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <ul className="space-y-4">
                {requisitos.map((requisito, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-600">{requisito}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-10 text-white text-center"
          >
            <GraduationCap className="h-16 w-16 text-amber-400 mx-auto mb-6" />
            
            <h3 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
              ¿Listo para formar parte?
            </h3>
            
            <p className="text-blue-200 mb-8 leading-relaxed">
              Completá el formulario de pre-inscripción y nos pondremos en contacto 
              para coordinar una entrevista.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-full text-lg font-semibold font-poppins hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-500/25 group"
              >
                Inscribirme ahora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-full text-lg font-semibold font-poppins hover:bg-white/10 transition-all"
              >
                Consultar
              </a>
            </div>

            {/* Info extra */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: Calendar, text: 'Inscripción abierta todo el año' },
                { icon: Clock, text: 'Respuesta en 48 hs' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-blue-200">
                  <item.icon className="h-4 w-4 text-amber-400" />
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}