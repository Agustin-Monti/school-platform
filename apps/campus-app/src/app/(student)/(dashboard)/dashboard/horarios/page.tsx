'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type Horario = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  courses: {
    name: string
    classroom: string
    color: string
    year: number
    division: string
  }
}

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date().getDay())
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState<'semanal' | 'diaria'>('semanal')
  const supabase = createClient()

  useEffect(() => {
    cargarHorarios()
  }, [])

  const cargarHorarios = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!student) { setLoading(false); return }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', student.id)

    const courseIds = (enrollments || []).map(e => e.course_id)
    if (courseIds.length === 0) { setLoading(false); return }

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        id, day_of_week, start_time, end_time,
        courses!inner (name, classroom, color, year, division)
      `)
      .in('course_id', courseIds)
      .order('start_time')

    if (!error && data) {
      setHorarios(data.map((item: any) => ({
        ...item,
        courses: Array.isArray(item.courses) ? item.courses[0] : item.courses
      })))
    }
    setLoading(false)
  }

  const horariosDelDia = horarios.filter(h => h.day_of_week === diaSeleccionado)
  const horariosPorDia = DIAS.map((nombre, index) => ({
    dia: index, nombre,
    horarios: horarios.filter(h => h.day_of_week === index)
  }))

  const formatearHora = (hora: string) => hora ? hora.substring(0, 5) : ''
  const horaActual = new Date().toTimeString().substring(0, 5)
  const hoy = new Date().getDay()

  const esClaseAhora = (horario: Horario) => {
    return horario.start_time.substring(0, 5) <= horaActual && 
           horario.end_time.substring(0, 5) > horaActual &&
           horario.day_of_week === hoy
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* Header interno */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Horarios</h1>
            <p className="text-xs md:text-sm text-gray-500">
              {horarios.length > 0 ? `${horarios[0].courses?.year}° ${horarios[0].courses?.division}` : 'Mis horarios'}
            </p>
          </div>
        </div>

        {/* Toggle vista */}
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button onClick={() => setVista('semanal')}
            className={`px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
              vista === 'semanal' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>
            Semanal
          </button>
          <button onClick={() => setVista('diaria')}
            className={`px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
              vista === 'diaria' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>
            Diaria
          </button>
        </div>
      </div>

      {horarios.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron horarios</p>
        </div>
      ) : vista === 'diaria' ? (
        <>
          {/* Días - Scroll horizontal en móvil */}
          <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-1 px-1">
            {DIAS_CORTOS.map((dia, index) => (
              <motion.button
                key={dia}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDiaSeleccionado(index)}
                className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  diaSeleccionado === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : index === hoy ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {dia}
                {index === hoy && <span className="ml-1 text-[10px]">•</span>}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={diaSeleccionado}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                {DIAS[diaSeleccionado]}
                {diaSeleccionado === hoy && <span className="text-blue-600 text-sm ml-2">(Hoy)</span>}
              </h2>

              {horariosDelDia.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Sin clases</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {horariosDelDia.map((horario, index) => {
                    const esAhora = esClaseAhora(horario)
                    return (
                      <motion.div
                        key={horario.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border transition-shadow ${
                          esAhora ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50/50' : 'border-gray-100 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-1 md:w-1.5 h-12 md:h-16 rounded-full"
                            style={{ backgroundColor: horario.courses?.color || '#4F46E5' }} />
                          
                          {/* Hora en móvil: arriba */}
                          <div className="text-center min-w-[50px] md:hidden">
                            <p className="text-sm font-bold">{formatearHora(horario.start_time)}</p>
                            <p className="text-[10px] text-gray-400">a</p>
                            <p className="text-xs text-gray-500">{formatearHora(horario.end_time)}</p>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm md:text-lg text-gray-900 truncate">
                                {horario.courses?.name || 'Sin nombre'}
                              </h3>
                              {esAhora && (
                                <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-medium animate-pulse flex-shrink-0">
                                  Ahora
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="hidden sm:inline">{horario.courses?.classroom || 'Sin aula'}</span>
                                <span className="sm:hidden">{horario.courses?.classroom || 'Sin aula'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Hora en desktop: costado */}
                          <div className="hidden md:block text-right text-sm font-medium text-gray-700">
                            {formatearHora(horario.start_time)}
                            <br /><span className="text-gray-400 text-xs">a</span><br />
                            {formatearHora(horario.end_time)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        /* VISTA SEMANAL */
        <div className="space-y-2 md:space-y-4">
          {horariosPorDia.filter(d => d.dia >= 1 && d.dia <= 5).map((dia) => (
            <motion.div
              key={dia.dia}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border ${
                dia.dia === hoy ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <h3 className="font-semibold text-sm md:text-lg text-gray-900">{dia.nombre}</h3>
                {dia.dia === hoy && (
                  <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Hoy</span>
                )}
              </div>
              
              {dia.horarios.length === 0 ? (
                <p className="text-xs md:text-sm text-gray-400 py-1">Sin clases</p>
              ) : (
                <div className="space-y-1 md:space-y-2">
                  {dia.horarios.map((horario) => {
                    const esAhora = esClaseAhora(horario)
                    return (
                      <div key={horario.id}
                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl transition-colors ${
                          esAhora ? 'bg-blue-100 ring-1 ring-blue-300' : 'hover:bg-gray-50'
                        }`}>
                        <div className="w-0.5 md:w-1 h-8 md:h-10 rounded-full"
                          style={{ backgroundColor: horario.courses?.color || '#4F46E5' }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs md:text-sm text-gray-900 truncate">
                            {horario.courses?.name}
                            {esAhora && <span className="ml-1 text-[10px] text-green-600 font-bold">• AHORA</span>}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {horario.courses?.classroom} • {formatearHora(horario.start_time)} - {formatearHora(horario.end_time)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}