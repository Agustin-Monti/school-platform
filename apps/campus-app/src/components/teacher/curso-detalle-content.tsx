'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft, Users, BookMarked, Clock, TrendingUp,
  Calendar, CheckSquare, FileText, MapPin, GraduationCap, Plus
} from 'lucide-react'
import Link from 'next/link'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type Props = {
  curso: any
  stats: {
    promedio: number
    asistencias: number
    total_alumnos: number
  }
}

export function CursoDetalleContent({ curso, stats }: Props) {
  const acciones = [
    {
      icon: Users,
      label: 'Alumnos',
      href: `/panel/mis-cursos/${curso.id}/alumnos`,
      desc: `${stats.total_alumnos} inscriptos`,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      icon: Plus,
      label: 'Nueva Tarea',
      href: `/panel/mis-cursos/${curso.id}/tareas/nueva`,
      desc: 'Crear tarea o Trabajo práctico',
      color: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50',
      text: 'text-rose-600'
    },
    {
      icon: CheckSquare,
      label: 'Calificar',
      href: `/panel/mis-cursos/${curso.id}/calificar`,
      desc: 'Tareas y Trabajos prácticos',
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600'
    },
    {
      icon: Calendar,
      label: 'Asistencia',
      href: `/panel/mis-cursos/${curso.id}/asistencia`,
      desc: 'Registro diario',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    },
    {
      icon: BookMarked,
      label: 'Temas',
      href: `/panel/mis-cursos/${curso.id}/temas`,
      desc: 'Gestionar temas',
      color: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-50',
      text: 'text-teal-600'
    },
    {
      icon: FileText,
      label: 'Material',
      href: `/panel/mis-cursos/${curso.id}/material`,
      desc: 'Subir contenido',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/panel/mis-cursos" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: curso.color || '#4F46E5' }}
            >
              <BookMarked className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{curso.name}</h1>
              <p className="text-sm text-gray-500">
                {curso.year}° Año - División {curso.division} • {curso.classroom}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">Total Alumnos</p>
            </div>
            <p className="text-3xl font-bold">{stats.total_alumnos}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-500">Promedio del Curso</p>
            </div>
            <p className="text-3xl font-bold">
              {Number(stats.promedio).toFixed(1)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500">Asistencias Registradas</p>
            </div>
            <p className="text-3xl font-bold">{stats.asistencias}</p>
          </motion.div>
        </div>

        {/* Acciones */}
        <h2 className="text-lg font-semibold mb-4">Acciones del Curso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {acciones.map((accion, index) => (
            <motion.div
              key={accion.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <Link
                href={accion.href}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col items-center text-center gap-3 group"
              >
                <div className={`p-4 rounded-xl ${accion.bg} group-hover:scale-110 transition-transform`}>
                  <accion.icon className={`h-8 w-8 ${accion.text}`} />
                </div>
                <div>
                  <p className="font-semibold">{accion.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{accion.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Horarios */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {curso.schedules?.map((horario: any, index: number) => (
              <div key={index} className="p-3 rounded-xl bg-gray-50 text-center">
                <p className="text-sm font-medium">{DIAS[horario.day_of_week]}</p>
                <p className="text-xs text-gray-500">
                  {horario.start_time.substring(0,5)} - {horario.end_time.substring(0,5)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Materias */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5" />
            Materias
          </h2>
          <div className="space-y-3">
            {curso.subjects?.map((materia: any, index: number) => (
              <motion.div
                key={materia.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div 
                  className="w-2 h-10 rounded-full"
                  style={{ backgroundColor: curso.color || '#4F46E5' }}
                />
                <div>
                  <p className="font-medium">{materia.name}</p>
                  {materia.description && (
                    <p className="text-xs text-gray-500">{materia.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}