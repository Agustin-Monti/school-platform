'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Clock, Plus, X, Loader2,
  CheckCircle2, Trash2, Download
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toPng } from 'html-to-image'

// ==========================================
// TIPOS
// ==========================================
type Curso = {
  id: string; name: string; year: number; division: string; classroom: string; color: string
}

type Horario = {
  id: string; day_of_week: number; start_time: string; end_time: string; course_id: string
  courses: { id: string; name: string; year: number; division: string; color: string }
}

type Props = { cursos: Curso[]; horarios: Horario[] }

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

// ==========================================
// COMPONENTE
// ==========================================
export function HorariosContent({ cursos, horarios }: Props) {
  const [vista, setVista] = useState<'general' | 'curso'>('general')
  const [anioSeleccionado, setAnioSeleccionado] = useState(1)
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('')
  const [mensajeExito, setMensajeExito] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [eliminandoHorario, setEliminandoHorario] = useState<string | null>(null)
  const [eliminandoInfo, setEliminandoInfo] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [nuevoHorario, setNuevoHorario] = useState({ day_of_week: 1, start_time: '07:15', end_time: '08:35' })

  const cursoActual = cursos.find(c => c.id === cursoSeleccionado)
  const horariosCurso = horarios.filter(h => h.course_id === cursoSeleccionado)

  // ==========================================
  // UTILIDADES
  // ==========================================
  const formatearHora = (hora: string) => hora?.substring(0, 5)

  const horariosPorAnio = (anio: number) => horarios.filter(h => h.courses?.year === anio)

  const getHorariosPorDia = (anio: number, dia: number) => {
    return horariosPorAnio(anio).filter(h => h.day_of_week === dia).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  const cursosConHorarios = (anio: number) => {
    const ids = new Set(horariosPorAnio(anio).map(h => h.course_id))
    return cursos.filter(c => ids.has(c.id) && c.year === anio)
  }

  // ==========================================
  // ACCIONES
  // ==========================================
  const handleAgregarHorario = async () => {
    if (!cursoSeleccionado) return
    setGuardando(true)
    const { error } = await supabase.from('schedules').insert({
      course_id: cursoSeleccionado,
      day_of_week: nuevoHorario.day_of_week,
      start_time: nuevoHorario.start_time + ':00',
      end_time: nuevoHorario.end_time + ':00',
    })
    if (!error) { setMensajeExito('✅ Horario agregado'); setTimeout(() => setMensajeExito(''), 2000); setMostrarModal(false); router.refresh() }
    setGuardando(false)
  }

  const handleEliminarHorario = (horarioId: string, info: string) => {
    setEliminandoHorario(horarioId); setEliminandoInfo(info)
  }

  const confirmarEliminar = async () => {
    if (!eliminandoHorario) return
    await supabase.from('schedules').delete().eq('id', eliminandoHorario)
    setMensajeExito('🗑️ Horario eliminado'); setTimeout(() => setMensajeExito(''), 2000)
    setEliminandoHorario(null); router.refresh()
  }

  // ==========================================
  // DESCARGAR COMO IMAGEN
  // ==========================================
  const descargarComoImagen = async () => {
    const elemento = document.getElementById('grilla-horarios')
    if (!elemento) return
    
    setDescargando(true)
    try {
      const dataUrl = await toPng(elemento, { 
        backgroundColor: '#ffffff',
        quality: 1,
        pixelRatio: 3
      })
      
      const link = document.createElement('a')
      link.download = `horarios-${anioSeleccionado}°-año.png`
      link.href = dataUrl
      link.click()
      
      setMensajeExito('📸 Imagen descargada correctamente')
      setTimeout(() => setMensajeExito(''), 2000)
    } catch (error) {
      console.error('Error al generar imagen:', error)
      alert('Error al generar la imagen')
    }
    setDescargando(false)
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Mensaje éxito */}
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/admin" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </Link>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Clock className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Horarios</h1>
                <p className="text-xs md:text-sm text-gray-500">{horarios.length} horarios totales</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle vista */}
              <div className="bg-gray-100 rounded-lg md:rounded-xl p-1 flex">
                <button onClick={() => setVista('general')}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${vista === 'general' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}>
                  📅 General
                </button>
                <button onClick={() => setVista('curso')}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${vista === 'curso' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}>
                  📚 Por Curso
                </button>
              </div>

              {/* Botón descargar */}
              {vista === 'general' && (
                <button onClick={descargarComoImagen} disabled={descargando}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                  {descargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {descargando ? '...' : 'Descargar'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {vista === 'general' ? (
          /* ========================================== */
          /* VISTA GENERAL POR AÑO */
          /* ========================================== */
          <div>
            {/* Selector de año */}
            <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map(anio => (
                <button key={anio} onClick={() => setAnioSeleccionado(anio)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                    anioSeleccionado === anio ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
                  {anio}° Año
                </button>
              ))}
            </div>

            {/* Leyenda de cursos */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
              {cursosConHorarios(anioSeleccionado).map(curso => (
                <div key={curso.id} className="flex items-center gap-1.5 text-xs md:text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: curso.color }} />
                  <span className="text-gray-600">{curso.name} {curso.division}</span>
                </div>
              ))}
              {cursosConHorarios(anioSeleccionado).length === 0 && (
                <p className="text-sm text-gray-400">No hay horarios para este año</p>
              )}
            </div>

            {/* Grilla semanal */}
            <div id="grilla-horarios" className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 md:p-4 text-left text-xs md:text-sm font-medium text-gray-500 w-20">Hora</th>
                      {DIAS.map(dia => (
                        <th key={dia} className="p-3 md:p-4 text-center text-xs md:text-sm font-medium text-gray-500">{dia}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hora => (
                      <tr key={hora} className="border-b hover:bg-gray-50">
                        <td className="p-3 md:p-4 text-xs md:text-sm font-medium text-gray-700">{hora}</td>
                        {[1, 2, 3, 4, 5].map(dia => {
                          const horariosFranja = getHorariosPorDia(anioSeleccionado, dia).filter(h => 
                            h.start_time.substring(0, 2) === hora.substring(0, 2)
                          )
                          return (
                            <td key={dia} className="p-1 md:p-2 text-center align-top">
                              <div className="flex flex-col gap-1">
                                {horariosFranja.map(h => (
                                  <div key={h.id}
                                    className="text-[10px] md:text-xs px-1.5 md:px-2 py-1 rounded-md md:rounded-lg text-white font-medium"
                                    style={{ backgroundColor: h.courses?.color || '#6366F1' }}
                                    title={`${h.courses?.name} ${h.courses?.division} - ${formatearHora(h.start_time)} a ${formatearHora(h.end_time)}`}>
                                    {h.courses?.name} {h.courses?.division}
                                  </div>
                                ))}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================== */
          /* VISTA POR CURSO */
          /* ========================================== */
          <div>
            {/* Selector de curso */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-4 md:mb-6">
              <select value={cursoSeleccionado} onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                <option value="">Elegir un curso...</option>
                {[1, 2, 3, 4, 5, 6].map(anio => {
                  const delAnio = cursos.filter(c => c.year === anio)
                  if (delAnio.length === 0) return null
                  return (
                    <optgroup key={anio} label={`${anio}° Año`}>
                      {delAnio.map(c => <option key={c.id} value={c.id}>{c.name} - {c.division} ({c.classroom})</option>)}
                    </optgroup>
                  )
                })}
              </select>
            </div>

            {cursoSeleccionado && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cursoActual?.color }} />
                    <h2 className="text-lg font-bold">{cursoActual?.name} - {cursoActual?.year}° {cursoActual?.division}</h2>
                  </div>
                  <button onClick={() => setMostrarModal(true)}
                    className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium">
                    <Plus className="h-4 w-4" />Agregar
                  </button>
                </div>

                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 md:p-4 text-left text-xs md:text-sm font-medium text-gray-500 w-20">Día</th>
                        <th className="p-3 md:p-4 text-left text-xs md:text-sm font-medium text-gray-500">Horarios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horariosCurso.length === 0 ? (
                        <tr><td colSpan={2} className="text-center py-12 text-gray-400"><Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />Sin horarios</td></tr>
                      ) : (
                        [1, 2, 3, 4, 5].map(dia => {
                          const delDia = horariosCurso.filter(h => h.day_of_week === dia).sort((a, b) => a.start_time.localeCompare(b.start_time))
                          if (delDia.length === 0) return null
                          return (
                            <tr key={dia} className="border-b hover:bg-gray-50">
                              <td className="p-3 md:p-4 text-xs md:text-sm font-medium">{DIAS[dia - 1]}</td>
                              <td className="p-2 md:p-3">
                                <div className="flex flex-wrap gap-2">
                                  {delDia.map(h => (
                                    <div key={h.id} className="relative group px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-white text-xs md:text-sm font-medium flex items-center gap-2 shadow-sm"
                                      style={{ backgroundColor: cursoActual?.color || '#6366F1' }}>
                                      <span>{formatearHora(h.start_time)}</span><span className="opacity-50">—</span><span>{formatearHora(h.end_time)}</span>
                                      <button onClick={() => handleEliminarHorario(h.id, `${DIAS[dia-1]} ${formatearHora(h.start_time)} - ${formatearHora(h.end_time)}`)}
                                        className="w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-2.5 w-2.5 md:h-3 md:w-3" /></button>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL AGREGAR */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setMostrarModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">Agregar Horario</h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Día</label>
                  <select value={nuevoHorario.day_of_week} onChange={e => setNuevoHorario({...nuevoHorario, day_of_week: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm">
                    {DIAS.map((dia, i) => <option key={dia} value={i+1}>{dia}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div><label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Desde</label>
                    <input type="time" value={nuevoHorario.start_time} onChange={e => setNuevoHorario({...nuevoHorario, start_time: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-200 rounded-xl text-sm" /></div>
                  <div><label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Hasta</label>
                    <input type="time" value={nuevoHorario.end_time} onChange={e => setNuevoHorario({...nuevoHorario, end_time: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-200 rounded-xl text-sm" /></div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Rápidos</label>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {[
                      { label: '80m', start: '07:15', end: '08:35' }, { label: '80m', start: '08:35', end: '09:55' },
                      { label: '80m', start: '09:55', end: '11:15' }, { label: '80m', start: '11:15', end: '12:35' },
                      { label: '80m', start: '13:15', end: '14:35' }, { label: '80m', start: '14:35', end: '15:55' },
                      { label: '40m', start: '07:15', end: '07:55' }, { label: '40m', start: '12:35', end: '13:15' },
                    ].map((item, i) => (
                      <button key={i} type="button" onClick={() => setNuevoHorario({...nuevoHorario, start_time: item.start, end_time: item.end})}
                        className={`px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                          nuevoHorario.start_time === item.start && nuevoHorario.end_time === item.end ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {item.label} {item.start}-{item.end}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAgregarHorario} disabled={guardando || !nuevoHorario.start_time || !nuevoHorario.end_time}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl text-sm font-medium hover:from-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Agregar Horario
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR */}
      <AnimatePresence>
        {eliminandoHorario && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setEliminandoHorario(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 md:h-8 md:w-8 text-red-500" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2">¿Eliminar horario?</h3>
              <div className="bg-red-50 rounded-xl p-3 mb-4"><p className="text-sm font-medium text-red-800">{eliminandoInfo}</p></div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => setEliminandoHorario(null)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium">Cancelar</button>
                <button onClick={confirmarEliminar} className="flex-1 py-2.5 md:py-3 bg-red-600 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" />Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}