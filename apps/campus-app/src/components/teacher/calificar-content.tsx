'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, CheckSquare, Clock, User, FileText,
  Star, X, Save, ChevronDown, ChevronUp,
  Download, Pencil, Loader2, Trash2, Plus
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { deleteMultipleFromStorage } from '@/lib/storage'
import { formatDateTime } from '@/lib/utils'

// ==========================================
// TIPOS
// ==========================================
type Entrega = {
  id: string; status: string; submitted_at: string | null; score: number | null
  file_url: string | null; comment: string | null; student_id: string; student_code: string; full_name: string
}

type Tarea = {
  id: string; title: string; description: string; due_date: string; max_score: number
  submissions: Entrega[]; totalEntregas: number; pendientes: number; calificadas: number
}

type Props = { curso: any; tareas: Tarea[]; totalAlumnos: number }

export function CalificarContent({ curso, tareas, totalAlumnos }: Props) {
  const [tareaExpandida, setTareaExpandida] = useState<string | null>(null)
  const [calificando, setCalificando] = useState<string | null>(null)
  const [editandoEntrega, setEditandoEntrega] = useState<Entrega | null>(null)
  const [nota, setNota] = useState<number>(0)
  const [comentario, setComentario] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [limpiandoTarea, setLimpiandoTarea] = useState<string | null>(null)
  const [limpiandoNombre, setLimpiandoNombre] = useState('')
  const [eliminandoTarea, setEliminandoTarea] = useState<string | null>(null)
  const [eliminandoTareaNombre, setEliminandoTareaNombre] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const abrirCalificar = (entrega: Entrega) => {
    setEditandoEntrega(entrega.status === 'graded' ? entrega : null)
    setNota(entrega.score || 0); setComentario(entrega.comment || ''); setCalificando(entrega.id)
  }
  const cerrarModal = () => { setCalificando(null); setEditandoEntrega(null); setNota(0); setComentario('') }

  const handleCalificar = async (submissionId: string) => {
    if (nota < 1 || nota > 10) { alert('Nota entre 1 y 10'); return }
    setGuardando(true)
    const { error } = await supabase.from('submissions').update({ score: nota, status: 'graded', comment: comentario || null }).eq('id', submissionId)
    if (!error) {
      setMensajeExito(editandoEntrega ? '✅ Nota actualizada' : '✅ Calificación guardada')
      setTimeout(() => { setMensajeExito(''); cerrarModal(); router.refresh() }, 1500)
    }
    setGuardando(false)
  }

  const handleLimpiarArchivos = (tarea: Tarea) => { setLimpiandoTarea(tarea.id); setLimpiandoNombre(tarea.title) }
  const confirmarLimpiar = async () => {
    if (!limpiandoTarea) return
    const tarea = tareas.find(t => t.id === limpiandoTarea)
    if (tarea) {
      const urls = tarea.submissions.filter(s => s.file_url).map(s => s.file_url!)
      if (urls.length > 0) await deleteMultipleFromStorage(urls, 'entregas')
    }
    await supabase.from('submissions').update({ file_url: null }).eq('assignment_id', limpiandoTarea)
    setMensajeExito('🗑️ Archivos eliminados')
    setTimeout(() => { setMensajeExito(''); setLimpiandoTarea(null); router.refresh() }, 2000)
  }

  const handleEliminarTarea = (tareaId: string, nombre: string) => { setEliminandoTarea(tareaId); setEliminandoTareaNombre(nombre) }
  const confirmarEliminarTarea = async () => {
    if (!eliminandoTarea) return
    const tarea = tareas.find(t => t.id === eliminandoTarea)
    if (tarea) {
      const urls = tarea.submissions.filter(s => s.file_url).map(s => s.file_url!)
      if (urls.length > 0) await deleteMultipleFromStorage(urls, 'entregas')
    }
    await supabase.from('submissions').delete().eq('assignment_id', eliminandoTarea)
    await supabase.from('assignments').delete().eq('id', eliminandoTarea)
    setMensajeExito('🗑️ Tarea eliminada')
    setTimeout(() => { setMensajeExito(''); setEliminandoTarea(null); router.refresh() }, 2500)
  }

  const getColorEstado = (s: string) => s === 'graded' ? 'bg-emerald-100 text-emerald-700' : s === 'submitted' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
  const getTextoEstado = (s: string) => s === 'graded' ? 'Calificada' : s === 'submitted' ? 'Pendiente' : 'Sin entregar'
  const getEstadoFecha = (dueDate: string) => {
    const hoy = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const fe = new Date(new Date(dueDate).getFullYear(), new Date(dueDate).getMonth(), new Date(dueDate).getDate())
    if (fe < hoy) return { label: 'Vencida', color: 'bg-red-100 text-red-700' }
    if (fe.getTime() === hoy.getTime()) return { label: 'Hoy', color: 'bg-amber-100 text-amber-700' }
    const dias = Math.ceil((fe.getTime() - hoy.getTime()) / 86400000)
    if (dias === 1) return { label: 'Mañana', color: 'bg-orange-100 text-orange-700' }
    if (dias <= 7) return { label: `${dias} días`, color: 'bg-blue-100 text-blue-700' }
    return { label: formatDateTime(dueDate), color: 'bg-gray-100 text-gray-600' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <AnimatePresence>
        {mensajeExito && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <Star className="h-5 w-5" />{mensajeExito}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href={`/panel/mis-cursos/${curso.id}`} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </Link>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <CheckSquare className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Calificar</h1>
                <p className="text-xs md:text-sm text-gray-500">{curso.name} - {curso.year}° {curso.division}</p>
              </div>
            </div>
            <Link href={`/panel/mis-cursos/${curso.id}/tareas/nueva`}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium shadow-lg">
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />Nueva Tarea
            </Link>
          </div>
          <div className="flex gap-2 mt-3 text-xs md:text-sm">
            <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-amber-100 text-amber-700">{tareas.reduce((acc, t) => acc + t.pendientes, 0)} por calificar</span>
            <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-100 text-emerald-700">{tareas.reduce((acc, t) => acc + t.calificadas, 0)} calificadas</span>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {tareas.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-white rounded-2xl">
            <FileText className="h-12 md:h-16 w-12 md:w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay tareas creadas</p>
            <Link href={`/panel/mis-cursos/${curso.id}/tareas/nueva`} className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium">
              <Plus className="h-4 w-4" />Crear primera tarea</Link>
          </motion.div>
        ) : (
          <div className="space-y-2 md:space-y-4">
            {tareas.map((tarea, index) => (
              <motion.div key={tarea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cabecera */}
                <div className="p-3 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setTareaExpandida(tareaExpandida === tarea.id ? null : tarea.id)}>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-1 md:w-1.5 h-12 md:h-14 rounded-full mt-0.5" style={{ backgroundColor: curso.color || '#EA580C' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold text-sm md:text-lg">{tarea.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tarea.pendientes > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] md:text-xs font-medium">{tarea.pendientes} por calificar</span>}
                          {tarea.calificadas > 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-medium">{tarea.calificadas} calificadas</span>}
                          <span className="text-[10px] md:text-xs text-gray-400">👥 {tarea.totalEntregas}/{totalAlumnos}</span>
                          <button onClick={e => { e.stopPropagation(); handleLimpiarArchivos(tarea) }} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 text-[10px] md:text-xs flex items-center gap-1"><Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3" />Limpiar</button>
                          <button onClick={e => { e.stopPropagation(); handleEliminarTarea(tarea.id, tarea.title) }} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 text-[10px] md:text-xs flex items-center gap-1"><X className="h-2.5 w-2.5 md:h-3 md:w-3" />Eliminar</button>
                          {tareaExpandida === tarea.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5 line-clamp-1">{tarea.description}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-[10px] md:text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(tarea.due_date)}</span>
                        <span>📝 {tarea.max_score} pts</span>
                        {(() => { const e = getEstadoFecha(tarea.due_date); return <span className={`px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${e.color}`}>{e.label}</span> })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entregas */}
                <AnimatePresence>
                  {tareaExpandida === tarea.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t">
                      <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                        {tarea.submissions.length === 0 ? (
                          <div className="text-center py-6 text-gray-400"><User className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Sin entregas aún</p></div>
                        ) : (
                          tarea.submissions.map(entrega => (
                            <motion.div key={entrega.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-2.5 md:p-4 rounded-lg md:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex-wrap gap-2">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xs md:text-sm">{entrega.full_name.charAt(0)}</div>
                                <div>
                                  <p className="font-medium text-xs md:text-sm">{entrega.full_name}</p>
                                  <p className="text-[10px] md:text-xs text-gray-500">{entrega.student_code}</p>
                                  {entrega.submitted_at && <p className="text-[9px] md:text-[10px] text-gray-400">Entregado: {formatDateTime(entrega.submitted_at)}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {entrega.file_url && <a href={entrega.file_url} target="_blank" className="p-1.5 hover:bg-gray-200 rounded-lg"><Download className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" /></a>}
                                {entrega.status === 'graded' ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"><Star className="h-3 w-3" />{entrega.score}/{tarea.max_score}</span>
                                    <button onClick={e => { e.stopPropagation(); abrirCalificar(entrega) }} className="text-[10px] text-gray-400 hover:text-orange-600"><Pencil className="h-2.5 w-2.5" /></button>
                                  </div>
                                ) : entrega.status === 'submitted' ? (
                                  <button onClick={e => { e.stopPropagation(); abrirCalificar(entrega) }} className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-medium">Calificar</button>
                                ) : (
                                  <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs ${getColorEstado(entrega.status)}`}>{getTextoEstado(entrega.status)}</span>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CALIFICACIÓN */}
      <AnimatePresence>
        {calificando && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={cerrarModal}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">{editandoEntrega ? 'Editar' : 'Calificar'}</h3>
                <button onClick={cerrarModal} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5" /></button>
              </div>
              {editandoEntrega && (
                <div className="bg-amber-50 rounded-2xl p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-sm font-medium text-amber-800">Anterior: {editandoEntrega.score}/10</p>
                </div>
              )}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Nota (1-10)</label>
                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => setNota(n)} className={`h-10 md:h-12 rounded-xl text-base md:text-lg font-bold transition-all ${
                      nota === n ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg' : nota >= n && nota > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="mb-4 md:mb-6">
                <textarea value={comentario} onChange={e => setComentario(e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-2xl text-xs md:text-sm resize-none" rows={2} placeholder="Comentario opcional..." />
              </div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={cerrarModal} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium">Cancelar</button>
                <button onClick={() => handleCalificar(calificando)} disabled={nota === 0 || guardando}
                  className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editandoEntrega ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL LIMPIAR */}
      <AnimatePresence>
        {limpiandoTarea && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setLimpiandoTarea(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 md:h-8 md:w-8 text-red-500" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2">¿Limpiar archivos?</h3>
              <p className="text-sm text-gray-500 mb-4">Se eliminarán archivos de entregas. Las notas se conservan.</p>
              <div className="bg-amber-50 rounded-xl p-3 mb-4"><p className="text-sm font-medium text-amber-800">"{limpiandoNombre}"</p></div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => setLimpiandoTarea(null)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium">Cancelar</button>
                <button onClick={confirmarLimpiar} className="flex-1 py-2.5 md:py-3 bg-red-600 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" />Limpiar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR TAREA */}
      <AnimatePresence>
        {eliminandoTarea && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEliminandoTarea(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 md:h-8 md:w-8 text-red-500" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2">¿Eliminar tarea?</h3>
              <p className="text-sm text-gray-500 mb-4">Se eliminarán todas las entregas y archivos.</p>
              <div className="bg-red-50 rounded-xl p-3 mb-4"><p className="text-sm font-medium text-red-800">"{eliminandoTareaNombre}"</p></div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => setEliminandoTarea(null)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium">Cancelar</button>
                <button onClick={confirmarEliminarTarea} className="flex-1 py-2.5 md:py-3 bg-red-600 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" />Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}