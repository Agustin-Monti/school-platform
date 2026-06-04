'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonios = [
  {
    id: 1,
    name: 'Martín González',
    role: 'Egresado 2020 - Estudiante de Ingeniería',
    text: 'La Escuela Moderna me dio las herramientas para ingresar a la universidad con confianza. Los profesores siempre estuvieron dispuestos a ayudarme y el nivel académico es excelente.',
    rating: 5,
    image: null,
  },
  {
    id: 2,
    name: 'Laura Fernández',
    role: 'Madre de alumna de 3° año',
    text: 'Como madre, valoro mucho el acompañamiento personalizado que recibe mi hija. El equipo docente está siempre atento a las necesidades de cada estudiante.',
    rating: 5,
    image: null,
  },
  {
    id: 3,
    name: 'Federico Martínez',
    role: 'Egresado 2018 - Médico',
    text: 'Recuerdo mis años en la escuela con mucho cariño. La formación en valores y la exigencia académica me prepararon para los desafíos de la facultad de medicina.',
    rating: 5,
    image: null,
  },
  {
    id: 4,
    name: 'Carolina Ruiz',
    role: 'Profesora de Matemática',
    text: 'Trabajar en la Escuela Moderna es un orgullo. Contamos con recursos tecnológicos y un ambiente de trabajo colaborativo que permite innovar en el aula.',
    rating: 5,
    image: null,
  },
  {
    id: 5,
    name: 'Diego Morales',
    role: 'Egresado 2022 - Programador',
    text: 'Los talleres de robótica y programación me ayudaron a descubrir mi vocación. Hoy trabajo como desarrollador gracias a las bases que me dio la escuela.',
    rating: 5,
    image: null,
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextTestimonial = () => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonios.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonios.length) % testimonios.length)
  }

  const goToTestimonial = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-semibold font-poppins text-sm tracking-widest uppercase">
            Testimonios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mt-3 mb-4">
            Lo que dice nuestra
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              comunidad
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Estudiantes, padres, egresados y docentes comparten su experiencia.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Card principal */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="text-center"
              >
                {/* Quote icon */}
                <Quote className="h-12 w-12 text-amber-200 mx-auto mb-6" />

                {/* Texto */}
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto italic">
                  "{testimonios[current].text}"
                </p>

                {/* Estrellas */}
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(testimonios[current].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Avatar + Info */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {testimonios[current].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-bold font-poppins text-gray-900">
                      {testimonios[current].name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonios[current].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navegación */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === current
                        ? 'w-8 bg-amber-500'
                        : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Decoración */}
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-amber-500 rounded-2xl rotate-12 opacity-20 hidden md:block" />
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500 rounded-full opacity-20 hidden md:block" />
        </div>
      </div>
    </section>
  )
}