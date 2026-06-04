'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Target, Eye, Heart, BookOpen, Award
} from 'lucide-react'

const valores = [
  { icon: Target, title: 'Misión', description: 'Brindar educación secundaria de excelencia, formando jóvenes críticos, creativos y comprometidos con la sociedad.' },
  { icon: Eye, title: 'Visión', description: 'Ser una institución líder en innovación educativa, reconocida por la formación integral de sus estudiantes.' },
  { icon: Heart, title: 'Valores', description: 'Respeto, responsabilidad, solidaridad y esfuerzo son los pilares que guían nuestra labor educativa diaria.' },
]

const stats = [
  { value: '60+', label: 'Años de trayectoria' },
  { value: '100+', label: 'Estudiantes' },
  { value: '20+', label: 'Docentes' },
  { value: '95%', label: 'Egresados en universidad' },
]

const imagenes = [
  '/images/instituto.jpg',
  '/images/instituto2.jpg',
  '/images/instituto3.jpg',
  '/images/instituto4.jpg',
]

export function About() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % imagenes.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="sobre" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-amber-500 font-semibold font-poppins text-sm tracking-widest uppercase">
              Sobre Nosotros
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mt-3 mb-6 leading-tight">
              Una institución con
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                historia y futuro
              </span>
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Desde 1999, la Escuela Secundaria Moderna se dedica a formar jóvenes 
              preparados para los desafíos del siglo XXI. Combinamos tradición e 
              innovación para ofrecer una educación que trasciende el aula.
            </p>

            {/* Valores */}
            <div className="space-y-6">
              {valores.map((valor, index) => (
                <motion.div
                  key={valor.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <valor.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-poppins text-gray-900 mb-1">
                      {valor.title}
                    </h3>
                    <p className="text-gray-500">{valor.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Imagen + Slider + Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Slider de imágenes */}
            <div className="relative mb-8">
              <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl relative">
                {imagenes.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentSlide === i ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={img}
                      alt={`Instituto Parroquial Mansilla D64 - Foto ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ))}

                {/* Dots indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {imagenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        currentSlide === i ? 'w-8 bg-amber-500' : 'w-2.5 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Elemento decorativo */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-500 rounded-2xl rotate-12 opacity-80 shadow-xl" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {[
            { icon: BookOpen, title: 'Excelencia Académica', desc: 'Programas actualizados con enfoque en competencias del siglo XXI.' },
            { icon: BookOpen, title: 'Acompañamiento Personalizado', desc: 'Tutorías y orientación para cada estudiante durante todo su recorrido.' },
            { icon: Award, title: 'Proyectos Innovadores', desc: 'Ferias de ciencias, olimpíadas, talleres de robótica y programación.' },
          ].map((feature, index) => (
            <div key={index} className="text-center p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-5">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}