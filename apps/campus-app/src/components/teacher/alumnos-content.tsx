'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Search, Users, TrendingUp, 
  Calendar, Mail, ChevronDown, ChevronUp
} from 'lucide-react'
import Link from 'next/link'

type Alumno = {
  id: string
  student_code: string
  full_name: string
  promedio: string
  asistencias: number
  porcentajeAsistencia: number
}

type Props = {
  curso: any
  alumnos: Alumno[]
}

export function AlumnosContent({ curso, alumnos }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'promedio' | 'asistencia'>('nombre')
  const [ordenAsc, setOrdenAsc] = useState(true)
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<string | null>(null)

  const alumnosFiltrados = alumnos
    .filter(a => 
      a.full_name.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.student_code.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      let comparacion = 0
      switch (ordenarPor) {
        case 'nombre':
          comparacion = a.full_name.localeCompare(b.full_name)
          break
        case 'promedio':
          comparacion = (Number(a.promedio) || 0) - (Number(b.promedio) || 0)
          break
        case 'asistencia':
          comparacion = a.porcentajeAsistencia - b.porcentajeAsistencia
          break
      }
      return ordenAsc ? comparacion : -comparacion
    })

  const getColorPromedio = (promedio: string) => {
    const val = Number(promedio)
    if (isNaN(val)) return 'text-gray-400'
    if (val >= 7) return 'text-emerald-600'
    if (val >= 5) return 'text-amber-600'
    return 'text-red-600'
  }

  const getColorAsistencia = (porcentaje: number) => {
    if (porcentaje >= 80) return 'text-emerald-600'
    if (porcentaje >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href={`/panel/mis-cursos/${curso.id}`} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: curso.color || '#4F46E5' }}
            >
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Alumnos</h1>
              <p className="text-sm text-gray-500">
                {curso.name} - {alumnos.length} estudiantes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">Total Alumnos</p>
            <p className="text-2xl font-bold">{alumnos.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">Promedio General</p>
            <p className="text-2xl font-bold">
              {alumnos.length > 0 
                ? (alumnos.reduce((acc, a) => acc + (Number(a.promedio) || 0), 0) / alumnos.length).toFixed(1)
                : '--'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">Asistencia Promedio</p>
            <p className="text-2xl font-bold">
              {alumnos.length > 0 
                ? Math.round(alumnos.reduce((acc, a) => acc + a.porcentajeAsistencia, 0) / alumnos.length) + '%'
                : '--'}
            </p>
          </div>
        </div>

        {/* Buscador y orden */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o legajo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setOrdenarPor('nombre'); setOrdenAsc(!ordenAsc) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                ordenarPor === 'nombre' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              Nombre {ordenarPor === 'nombre' && (ordenAsc ? '↑' : '↓')}
            </button>
            <button
              onClick={() => { setOrdenarPor('promedio'); setOrdenAsc(!ordenAsc) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                ordenarPor === 'promedio' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              Promedio {ordenarPor === 'promedio' && (ordenAsc ? '↑' : '↓')}
            </button>
            <button
              onClick={() => { setOrdenarPor('asistencia'); setOrdenAsc(!ordenAsc) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                ordenarPor === 'asistencia' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              Asistencia {ordenarPor === 'asistencia' && (ordenAsc ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Lista de alumnos */}
        <div className="space-y-3">
          {alumnosFiltrados.map((alumno, index) => (
            <motion.div
              key={alumno.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setAlumnoSeleccionado(alumnoSeleccionado === alumno.id ? null : alumno.id)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: curso.color || '#4F46E5' }}
                  >
                    {alumno.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{alumno.full_name}</h3>
                    <p className="text-sm text-gray-500">{alumno.student_code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center hidden md:block">
                    <TrendingUp className={`h-5 w-5 mx-auto mb-1 ${getColorPromedio(alumno.promedio)}`} />
                    <p className={`font-bold ${getColorPromedio(alumno.promedio)}`}>{alumno.promedio}</p>
                    <p className="text-[10px] text-gray-500">Promedio</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <Calendar className={`h-5 w-5 mx-auto mb-1 ${getColorAsistencia(alumno.porcentajeAsistencia)}`} />
                    <p className={`font-bold ${getColorAsistencia(alumno.porcentajeAsistencia)}`}>{alumno.porcentajeAsistencia}%</p>
                    <p className="text-[10px] text-gray-500">Asistencia</p>
                  </div>
                  {alumnoSeleccionado === alumno.id ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>

              {/* Detalle expandible */}
              {alumnoSeleccionado === alumno.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-5 border-t"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-emerald-50">
                      <p className="text-sm text-emerald-700 font-medium">Promedio</p>
                      <p className="text-2xl font-bold text-emerald-700">{alumno.promedio}</p>
                      <div className="mt-2 bg-emerald-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${(Number(alumno.promedio) || 0) * 10}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50">
                      <p className="text-sm text-blue-700 font-medium">Asistencia</p>
                      <p className="text-2xl font-bold text-blue-700">{alumno.porcentajeAsistencia}%</p>
                      <p className="text-xs text-blue-600 mt-1">{alumno.asistencias} clases registradas</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 flex flex-col justify-center items-center">
                      <Mail className="h-8 w-8 text-purple-400 mb-2" />
                      <Link
                        href={`/panel/mis-cursos/${curso.id}/alumnos/${alumno.id}`}
                        className="text-sm text-purple-700 hover:underline font-medium"
                      >
                        Ver perfil completo →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}