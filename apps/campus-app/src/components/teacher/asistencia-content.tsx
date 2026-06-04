'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Calendar, CheckCircle2, XCircle, 
  AlertTriangle, Clock, Save, Loader2,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Alumno = { id: string; student_code: string; full_name: string; profile_id: string }
type Props = { curso: any; alumnos: Alumno[]; asistenciaHoy: Map<string, string>; historial: any[] }

export function AsistenciaContent({ curso, alumnos, asistenciaHoy, historial }: Props) {
  const [asistencias, setAsistencias] = useState<Map<string, string>>(asistenciaHoy)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [vista, setVista] = useState<'hoy' | 'historial'>('hoy')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])
  const router = useRouter()
  const supabase = createClient()

  const toggleAsistencia = (studentId: string) => {
    const nuevo = new Map(asistencias)
    const actual = nuevo.get(studentId)
    if (!actual) nuevo.set(studentId, 'present')
    else if (actual === 'present') nuevo.set(studentId, 'late')
    else if (actual === 'late') nuevo.set(studentId, 'absent')
    else nuevo.delete(studentId)
    setAsistencias(nuevo)
  }

  const setEstadoDirecto = (studentId: string, estado: string) => {
    const nuevo = new Map(asistencias)
    asistencias.get(studentId) === estado ? nuevo.delete(studentId) : nuevo.set(studentId, estado)
    setAsistencias(nuevo)
  }

  const guardarAsistencia = async () => {
    setGuardando(true)
    const hoy = new Date().toISOString().split('T')[0]
    const registros = Array.from(asistencias.entries()).map(([studentId, status]) => ({
      student_id: studentId, course_id: curso.id, date: hoy, status
    }))
    const { error } = await supabase.from('attendance').upsert(registros, { onConflict: 'date,student_id,course_id' })
    if (!error) { setMensajeExito('✅ Asistencia guardada'); setTimeout(() => setMensajeExito(''), 3000) }
    else alert('Error: ' + error.message)
    setGuardando(false)
  }

  const totalAlumnos = alumnos.length
  const presentes = Array.from(asistencias.values()).filter(s => s === 'present').length
  const tardes = Array.from(asistencias.values()).filter(s => s === 'late').length
  const ausentes = Array.from(asistencias.values()).filter(s => s === 'absent').length
  const sinRegistrar = totalAlumnos - presentes - tardes - ausentes

  const getIconoEstado = (estado: string | undefined) => {
    switch (estado) {
      case 'present': return <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
      case 'late': return <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
      case 'absent': return <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
      default: return <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
    }
  }

  const getColorFondo = (estado: string | undefined) => {
    switch (estado) {
      case 'present': return 'bg-emerald-50'
      case 'late': return 'bg-amber-50'
      case 'absent': return 'bg-red-50'
      default: return ''
    }
  }

  const getTextoEstado = (estado: string | undefined) => {
    switch (estado) {
      case 'present': return 'Presente'; case 'late': return 'Tarde'
      case 'absent': return 'Ausente'; default: return 'Sin reg.'
    }
  }

  const historialFecha = historial.filter((h: any) => h.date === fechaSeleccionada)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <AnimatePresence>
        {mensajeExito && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />{mensajeExito}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href={`/panel/mis-cursos/${curso.id}`} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </Link>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Asistencia</h1>
                <p className="text-xs md:text-sm text-gray-500">{curso.name} - Hoy</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg md:rounded-xl p-1 flex">
              <button onClick={() => setVista('hoy')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${vista === 'hoy' ? 'bg-white text-purple-600 shadow' : 'text-gray-500'}`}>Hoy</button>
              <button onClick={() => setVista('historial')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${vista === 'historial' ? 'bg-white text-purple-600 shadow' : 'text-gray-500'}`}>Historial</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {vista === 'hoy' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
              {[
                { label: 'Presentes', value: presentes, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                { label: 'Tarde', value: tardes, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
                { label: 'Ausentes', value: ausentes, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
                { label: 'Sin reg.', value: sinRegistrar, color: 'text-gray-400', bg: 'bg-gray-50', icon: Clock },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`${stat.bg} rounded-xl md:rounded-2xl p-3 md:p-4 text-center`}>
                  <stat.icon className={`h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 ${stat.color}`} />
                  <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Lista de alumnos */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 md:mb-6">
              <div className="p-3 md:p-4 border-b bg-gray-50">
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="divide-y">
                {alumnos.map((alumno, index) => {
                  const estado = asistencias.get(alumno.id)
                  return (
                    <motion.div key={alumno.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                      className={`p-2.5 md:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${getColorFondo(estado)}`}
                      onClick={() => toggleAsistencia(alumno.id)}>
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
                          {alumno.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs md:text-sm text-gray-900 truncate">{alumno.full_name}</p>
                          <p className="text-[10px] md:text-xs text-gray-500">{alumno.student_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
                        <div className="flex gap-0.5 md:gap-1">
                          <button onClick={e => { e.stopPropagation(); setEstadoDirecto(alumno.id, 'present') }}
                            className={`p-1.5 md:p-2 rounded-lg transition-all ${estado === 'present' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-emerald-100'}`}>
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /></button>
                          <button onClick={e => { e.stopPropagation(); setEstadoDirecto(alumno.id, 'late') }}
                            className={`p-1.5 md:p-2 rounded-lg transition-all ${estado === 'late' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-amber-100'}`}>
                            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" /></button>
                          <button onClick={e => { e.stopPropagation(); setEstadoDirecto(alumno.id, 'absent') }}
                            className={`p-1.5 md:p-2 rounded-lg transition-all ${estado === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-100'}`}>
                            <XCircle className="h-4 w-4 md:h-5 md:w-5" /></button>
                        </div>
                        <span className="text-[10px] md:text-sm font-medium w-16 md:w-24 text-right">{getTextoEstado(estado)}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <button onClick={guardarAsistencia} disabled={guardando}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl md:rounded-2xl font-medium hover:from-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm md:text-lg">
              {guardando ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : <Save className="h-5 w-5 md:h-6 md:w-6" />}
              {guardando ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </>
        ) : (
          /* HISTORIAL */
          <div>
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <button onClick={() => { const d = new Date(fechaSeleccionada); d.setDate(d.getDate() - 1); setFechaSeleccionada(d.toISOString().split('T')[0]) }}
                  className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-4 w-4 md:h-5 md:w-5" /></button>
                <input type="date" value={fechaSeleccionada} onChange={e => setFechaSeleccionada(e.target.value)}
                  className="flex-1 px-3 md:px-4 py-2 border border-gray-200 rounded-lg md:rounded-xl text-center text-sm font-medium" />
                <button onClick={() => { const d = new Date(fechaSeleccionada); d.setDate(d.getDate() + 1); setFechaSeleccionada(d.toISOString().split('T')[0]) }}
                  className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-4 w-4 md:h-5 md:w-5" /></button>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-3 md:p-4 border-b bg-gray-50">
                <p className="text-sm md:text-base font-medium">
                  {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              {historialFecha.length === 0 ? (
                <div className="text-center py-10 md:py-12 text-gray-400">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-50" />
                  <p className="text-sm">Sin registros para esta fecha</p>
                </div>
              ) : (
                <div className="divide-y">
                  {alumnos.map(alumno => {
                    const registro = historialFecha.find((h: any) => h.student_id === alumno.id)
                    return (
                      <div key={alumno.id} className="p-2.5 md:p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs md:text-sm font-bold">{alumno.full_name.charAt(0)}</div>
                          <span className="text-xs md:text-sm font-medium">{alumno.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          {registro ? getIconoEstado(registro.status) : getIconoEstado(undefined)}
                          <span className="text-[10px] md:text-sm">{getTextoEstado(registro?.status)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}