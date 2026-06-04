'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft, BookOpen, Users, Clock, BookMarked,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'

type Curso = {
  id: string
  name: string
  year: number
  division: string
  classroom: string
  color: string
  subjects: { id: string; name: string }[]
  schedules: { day_of_week: number; start_time: string; end_time: string }[]
  stats: { totalAlumnos: number; totalMaterias: number; totalClases: number }
}

export function MisCursosContent({ cursos }: { cursos: Curso[] }) {
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/panel" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </Link>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">Mis Cursos</h1>
              <p className="text-xs md:text-sm text-gray-500">{cursos.length} cursos asignados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {cursos.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-2xl">
            <BookOpen className="h-12 md:h-16 w-12 md:w-16 text-gray-300 mx-auto mb-3 md:mb-4" />
            <p className="text-gray-500 text-base md:text-lg">No tenés cursos asignados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {cursos.map((curso, index) => (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Header del curso con color */}
                <div className="p-4 md:p-6 text-white" style={{ backgroundColor: curso.color || '#4F46E5' }}>
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <h3 className="text-lg md:text-xl font-bold">{curso.name}</h3>
                    <GraduationCap className="h-6 w-6 md:h-8 md:w-8 opacity-50" />
                  </div>
                  <p className="text-white/80 text-sm md:text-base">{curso.year}° Año - {curso.division}</p>
                  <p className="text-white/60 text-xs md:text-sm mt-0.5 md:mt-1">📍 {curso.classroom}</p>
                </div>

                {/* Stats */}
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
                    <div className="text-center">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mx-auto mb-0.5 md:mb-1" />
                      <p className="text-base md:text-lg font-bold">{curso.stats.totalAlumnos}</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500">Alumnos</p>
                    </div>
                    <div className="text-center">
                      <BookMarked className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 mx-auto mb-0.5 md:mb-1" />
                      <p className="text-base md:text-lg font-bold">{curso.stats.totalMaterias}</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500">Materias</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-purple-500 mx-auto mb-0.5 md:mb-1" />
                      <p className="text-base md:text-lg font-bold">{curso.stats.totalClases}</p>
                      <p className="text-[9px] md:text-[10px] text-gray-500">Clases</p>
                    </div>
                  </div>

                  {/* Materias - ocultar en móvil si no hay */}
                  {curso.subjects && curso.subjects.length > 0 && (
                    <div className="mb-3 md:mb-4">
                      <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-1.5 md:mb-2">Materias:</p>
                      <div className="flex flex-wrap gap-1">
                        {curso.subjects.slice(0, 4).map(materia => (
                          <span key={materia.id} className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-gray-100 text-gray-600">
                            {materia.name}
                          </span>
                        ))}
                        {(curso.subjects?.length || 0) > 4 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-gray-100 text-gray-400">+{curso.subjects!.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Horarios - solo mostrar en desktop o si hay pocos */}
                  {curso.schedules && curso.schedules.length > 0 && (
                    <div className="hidden sm:block mb-4">
                      <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-1.5 md:mb-2">Horarios:</p>
                      <div className="space-y-0.5 md:space-y-1">
                        {curso.schedules.slice(0, 3).map((horario, i) => (
                          <div key={i} className="flex justify-between text-[10px] md:text-xs text-gray-600">
                            <span>{DIAS[horario.day_of_week]}</span>
                            <span>{horario.start_time.substring(0,5)} - {horario.end_time.substring(0,5)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link
                      href={`/panel/mis-cursos/${curso.id}`}
                      className="flex-1 text-center py-2 md:py-2.5 bg-indigo-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Ver detalles
                    </Link>
                    <Link
                      href={`/panel/mis-cursos/${curso.id}/alumnos`}
                      className="flex-1 text-center py-2 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Alumnos
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}