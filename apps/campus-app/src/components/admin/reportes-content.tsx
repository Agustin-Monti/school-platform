'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft, TrendingUp, TrendingDown, AlertTriangle,
  Users, Award
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {
  topFaltas: any[]
  promediosBajos: any[]
  promediosAltos: any[]
  asistenciaPorCurso: any[]
  anioSeleccionado: number | null
}

export function ReportesContent({ topFaltas, promediosBajos, promediosAltos, asistenciaPorCurso, anioSeleccionado }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/admin" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </Link>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">Reportes</h1>
              <p className="text-xs md:text-sm text-gray-500">
                {anioSeleccionado ? `${anioSeleccionado}° Año` : 'Todos los años'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {/* Filtros de año */}
        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => router.push('/admin/reportes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !anioSeleccionado ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            📊 Todos
          </button>
          {[1, 2, 3, 4, 5, 6].map(anio => (
            <button
              key={anio}
              onClick={() => router.push(`/admin/reportes?anio=${anio}`)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                anioSeleccionado === anio ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {anio}° Año
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          
          {/* TOP FALTAS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="font-semibold text-sm md:text-base">Estudiantes con más faltas</h2>
            </div>
            <div className="space-y-2">
              {topFaltas.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.student_code}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600 flex-shrink-0 ml-2">{item.faltas} faltas</span>
                </div>
              ))}
              {topFaltas.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Sin datos</p>
              )}
            </div>
          </motion.div>

          {/* PROMEDIOS BAJOS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="font-semibold text-sm md:text-base">Promedios más bajos</h2>
            </div>
            <div className="space-y-2">
              {promediosBajos.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.student_code}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ml-2 ${
                    item.promedio >= 7 ? 'text-emerald-600' : item.promedio >= 5 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {item.promedio.toFixed(1)}
                  </span>
                </div>
              ))}
              {promediosBajos.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Sin datos</p>
              )}
            </div>
          </motion.div>

          {/* MEJORES PROMEDIOS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-sm md:text-base">Mejores promedios</h2>
            </div>
            <div className="space-y-2">
              {promediosAltos.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.student_code}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 flex-shrink-0 ml-2">
                    {item.promedio.toFixed(1)}
                  </span>
                </div>
              ))}
              {promediosAltos.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Sin datos</p>
              )}
            </div>
          </motion.div>

          {/* ASISTENCIA POR CURSO */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-sm md:text-base">Asistencia por curso</h2>
            </div>
            <div className="space-y-3">
              {asistenciaPorCurso.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="font-medium truncate">{item.curso}</span>
                    <span className={item.porcentaje >= 75 ? 'text-emerald-600' : 'text-red-600'}>
                      {item.porcentaje}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.porcentaje >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${item.porcentaje}%` }} 
                    />
                  </div>
                </div>
              ))}
              {asistenciaPorCurso.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Sin datos</p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}