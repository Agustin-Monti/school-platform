'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, Calendar as CalendarIcon, Clock, AlertCircle,
  CheckCircle2, Loader2, Upload, ChevronLeft, ChevronRight,
  X, FileText, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Tarea = {
  id: string
  title: string
  description: string
  due_date: string
  max_score: number
  courses: {
    name: string
    color: string
    classroom: string
  }
  submissions: {
    id: string
    status: string
    submitted_at: string | null
    score: number | null
    file_url: string | null
  }[]
}

type Filtro = 'todas' | 'pendientes' | 'entregadas' | 'vencidas'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [vista, setVista] = useState<'lista' | 'calendario'>('lista')
  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [anioActual, setAnioActual] = useState(new Date().getFullYear())
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [entregando, setEntregando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const supabase = createClient()

  useEffect(() => { cargarTareas() }, [])

  const cargarTareas = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: student } = await supabase.from('students').select('id').eq('profile_id', user.id).single()
    if (!student) return
    const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', student.id)
    const courseIds = (enrollments || []).map(e => e.course_id)
    if (courseIds.length === 0) { setLoading(false); return }

    const { data, error } = await supabase
      .from('assignments')
      .select(`id, title, description, due_date, max_score, courses!inner (name, color, classroom), submissions (id, status, submitted_at, score, file_url)`)
      .in('course_id', courseIds)
      .order('due_date', { ascending: true })

    if (!error && data) {
      setTareas(data.map((item: any) => ({ ...item, courses: Array.isArray(item.courses) ? item.courses[0] : item.courses, submissions: item.submissions || [] })))
    }
    setLoading(false)
  }

  const getEstadoTarea = (tarea: Tarea) => {
    const sub = tarea.submissions[0]
    if (!sub || sub.status === 'pending') return 'pendiente'
    if (sub.status === 'submitted') return 'entregada'
    if (sub.status === 'graded') return 'calificada'
    return 'pendiente'
  }

  const getDiasRestantes = (fecha: string) => Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000)

  // Filtrado
  const tareasFiltradas = tareas.filter(tarea => {
    const estado = getEstadoTarea(tarea)
    const dias = getDiasRestantes(tarea.due_date)
    switch (filtro) {
      case 'pendientes': return estado === 'pendiente' && dias >= 0
      case 'entregadas': return estado === 'entregada' || estado === 'calificada'
      case 'vencidas': return estado === 'pendiente' && dias < 0
      default: return (estado === 'pendiente' && dias >= 0) || estado === 'entregada'
    }
  })

  // Calendario
  const getTareasDelDia = (dia: number) => tareas.filter(t => {
    const f = new Date(t.due_date)
    return f.getDate() === dia && f.getMonth() === mesActual && f.getFullYear() === anioActual
  })
  const hoyEs = (dia: number) => new Date().getDate() === dia && new Date().getMonth() === mesActual && new Date().getFullYear() === anioActual
  const cambiarMes = (dir: number) => {
    let m = mesActual + dir, a = anioActual
    if (m > 11) { m = 0; a++ } else if (m < 0) { m = 11; a-- }
    setMesActual(m); setAnioActual(a)
  }
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate()
  const primerDia = new Date(anioActual, mesActual, 1).getDay()
  const diasCalendario = [...Array(primerDia).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)]

  // Entrega
  const handleEntregar = async () => {
    if (!tareaSeleccionada || !archivoSeleccionado) return
    setEntregando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: student } = await supabase.from('students').select('id').eq('profile_id', user!.id).single()
      if (!student) throw new Error('Estudiante no encontrado')

      const fileExt = archivoSeleccionado.name.split('.').pop()
      const fileName = `${student.id}/${tareaSeleccionada.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('entregas').upload(fileName, archivoSeleccionado, { cacheControl: '3600', upsert: false })
      if (uploadError) { alert('Error al subir archivo'); setEntregando(false); return }

      const { data: { publicUrl } } = supabase.storage.from('entregas').getPublicUrl(fileName)
      const { error: dbError } = await supabase.from('submissions').upsert({
        student_id: student.id, assignment_id: tareaSeleccionada.id, status: 'submitted', submitted_at: new Date().toISOString(), file_url: publicUrl
      }, { onConflict: 'student_id,assignment_id' })

      if (!dbError) {
        setMensajeExito('✅ Tarea entregada')

        // 🆕 NOTIFICAR AL PROFESOR
        const { data: tareaData } = await supabase
          .from('assignments')
          .select('course_id')
          .eq('id', tareaSeleccionada.id)
          .single()

        if (tareaData) {
          const { error: notifError } = await supabase.rpc('notify_course_teacher', {
            p_course_id: tareaData.course_id,
            p_title: '📤 Nueva entrega',
            p_message: `Un alumno entregó "${tareaSeleccionada.title}"`,
            p_type: 'submission'
          })
          if (notifError) console.error('Error al notificar:', notifError)
        }

        setTimeout(() => { setMensajeExito(''); setMostrarModal(false); setTareaSeleccionada(null); setArchivoSeleccionado(null); cargarTareas() }, 1500)
      }
    } catch { alert('Error inesperado') }
    setEntregando(false)
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-orange-600" /></div>

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* Mensaje éxito */}
      <AnimatePresence>
        {mensajeExito && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />{mensajeExito}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal entrega */}
      <AnimatePresence>
        {mostrarModal && tareaSeleccionada && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setMostrarModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-5 md:p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Entregar Tarea</h3>
                <button onClick={() => setMostrarModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
              </div>
              <div className="mb-4"><p className="font-semibold text-sm">{tareaSeleccionada.title}</p><p className="text-xs text-gray-500">{tareaSeleccionada.courses?.name}</p></div>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-orange-400 transition-colors mb-4">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" onChange={e => { const f = e.target.files?.[0]; if (f) setArchivoSeleccionado(f) }} />
                {archivoSeleccionado ? (
                  <div>
                    <div className="flex items-center gap-2 justify-center mb-2"><FileText className="h-8 w-8 text-orange-500" /><span className="text-sm font-medium truncate max-w-[200px]">{archivoSeleccionado.name}</span></div>
                    <p className="text-xs text-gray-400">{(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={e => { e.preventDefault(); setArchivoSeleccionado(null) }} className="mt-2 text-xs text-red-500 hover:underline">Eliminar</button>
                  </div>
                ) : (
                  <div><Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">Click para seleccionar archivo</p><p className="text-xs text-gray-400 mt-1">PDF, Word, imágenes, ZIP (máx. 10MB)</p></div>
                )}
              </label>
              <button onClick={handleEntregar} disabled={!archivoSeleccionado || entregando}
                className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors">
                {entregando ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirmar Entrega'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header interno */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-orange-600 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Tareas / TP</h1>
            <p className="text-xs md:text-sm text-gray-500">{tareas.filter(t => getEstadoTarea(t) === 'pendiente' && getDiasRestantes(t.due_date) <= 3 && getDiasRestantes(t.due_date) >= 0).length > 0 ? '⚠️ Urgentes' : '✅ Al día'}</p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button onClick={() => setVista('lista')} className={`px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${vista === 'lista' ? 'bg-white shadow text-orange-600' : 'text-gray-600'}`}>Lista</button>
          <button onClick={() => setVista('calendario')} className={`px-2.5 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${vista === 'calendario' ? 'bg-white shadow text-orange-600' : 'text-gray-600'}`}>Calendario</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        {[
          { label: 'Pendientes', value: tareas.filter(t => getEstadoTarea(t) === 'pendiente' && getDiasRestantes(t.due_date) >= 0).length, icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-600' },
          { label: 'Entregadas', value: tareas.filter(t => getEstadoTarea(t) === 'entregada').length, icon: CheckCircle2, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Calificadas', value: tareas.filter(t => getEstadoTarea(t) === 'calificada').length, icon: Star, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Vencidas', value: tareas.filter(t => getEstadoTarea(t) === 'pendiente' && getDiasRestantes(t.due_date) < 0).length, icon: CalendarIcon, bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
            <div className={`${stat.bg} w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3`}>
              <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.text}`} />
            </div>
            <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
            <p className="text-[10px] md:text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        {[
          { key: 'todas', label: '📋 Activas' },
          { key: 'pendientes', label: '📝 Pendientes' },
          { key: 'entregadas', label: '✅ Entregadas' },
          { key: 'vencidas', label: '⏰ Vencidas' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key as Filtro)}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${filtro === f.key ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      {vista === 'lista' ? (
        <div className="space-y-2 md:space-y-3">
          {tareasFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl"><CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay tareas</p></div>
          ) : (
            tareasFiltradas.map((tarea, index) => {
              const estado = getEstadoTarea(tarea)
              const dias = getDiasRestantes(tarea.due_date)
              return (
                <motion.div key={tarea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-1 md:w-1.5 h-full min-h-[50px] md:min-h-[60px] rounded-full mt-1" style={{ backgroundColor: tarea.courses?.color || '#EA580C' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 md:mb-2">
                        <div className="min-w-0 flex-1 mr-2">
                          <h3 className="font-semibold text-sm md:text-lg truncate">{tarea.title}</h3>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{tarea.courses?.name}</p>
                        </div>
                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium flex-shrink-0 ${
                          estado === 'calificada' ? 'bg-emerald-100 text-emerald-700' : estado === 'entregada' ? 'bg-blue-100 text-blue-700' :
                          dias < 0 ? 'bg-red-100 text-red-700' : dias <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                          {estado === 'calificada' ? `⭐ ${tarea.submissions[0]?.score}/10` : estado === 'entregada' ? 'Entregada' : dias < 0 ? 'Vencida' : `${dias} días`}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">{tarea.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(tarea.due_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{tarea.max_score} pts</span>
                        </div>
                        {estado === 'pendiente' && dias >= 0 && (
                          <button onClick={() => { setTareaSeleccionada(tarea); setMostrarModal(true) }}
                            className="flex items-center gap-1 px-2.5 py-1.5 md:px-3 md:py-1.5 bg-orange-600 text-white rounded-lg text-xs md:text-sm hover:bg-orange-700 transition-colors">
                            <Upload className="h-3 w-3" />Entregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      ) : (
        /* CALENDARIO RESPONSIVE */
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-3 md:p-4 border-b">
            <button onClick={() => cambiarMes(-1)} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-4 w-4 md:h-5 md:w-5" /></button>
            <h2 className="text-sm md:text-lg font-bold">{MESES[mesActual]} {anioActual}</h2>
            <button onClick={() => cambiarMes(1)} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-4 w-4 md:h-5 md:w-5" /></button>
          </div>
          <div className="grid grid-cols-7 border-b">
            {DIAS_SEMANA.map(d => <div key={d} className="p-1.5 md:p-2 text-center text-[10px] md:text-xs font-medium text-gray-500">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {diasCalendario.map((dia, i) => {
              const tareasDia = dia ? getTareasDelDia(dia) : []
              const esHoy = dia ? hoyEs(dia) : false
              return (
                <div key={i} className={`min-h-[45px] md:min-h-[80px] p-0.5 md:p-1.5 border-b border-r ${dia ? 'hover:bg-gray-50' : 'bg-gray-50'}`}>
                  {dia && (
                    <>
                      <span className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-[10px] md:text-xs font-medium mb-0.5 ${esHoy ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>{dia}</span>
                      <div className="space-y-0.5">
                        {tareasDia.slice(0, 2).map(t => (
                          <div key={t.id} className="text-[8px] md:text-[10px] px-0.5 md:px-1 py-0.5 rounded truncate cursor-pointer" style={{ backgroundColor: t.courses?.color + '20', color: t.courses?.color }} title={t.title}>
                            {t.title.substring(0, 12)}...
                          </div>
                        ))}
                        {tareasDia.length > 2 && <p className="text-[8px] md:text-[10px] text-gray-400">+{tareasDia.length - 2}</p>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}