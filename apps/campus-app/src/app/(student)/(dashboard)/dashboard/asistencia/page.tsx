'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, CheckCircle2, XCircle, AlertTriangle,
  Loader2, TrendingUp, FileText, Send
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Asistencia = {
  id: string; date: string; status: string; justification: string | null
  courses: { name: string; color: string }
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function AsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth())
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear())
  const [mostrarJustificar, setMostrarJustificar] = useState(false)
  const [faltaSeleccionada, setFaltaSeleccionada] = useState<Asistencia | null>(null)
  const [justificacion, setJustificacion] = useState('')
  const [enviandoJustificacion, setEnviandoJustificacion] = useState(false)
  const supabase = createClient()

  useEffect(() => { cargarAsistencias() }, [mesSeleccionado, anioSeleccionado])

  const cargarAsistencias = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: student } = await supabase.from('students').select('id').eq('profile_id', user.id).single()
    if (!student) return
    const inicio = `${anioSeleccionado}-${String(mesSeleccionado + 1).padStart(2, '0')}-01`
    const fin = `${anioSeleccionado}-${String(mesSeleccionado + 1).padStart(2, '0')}-31`
    const { data, error } = await supabase.from('attendance')
      .select(`id, date, status, justification, courses!inner (name, color)`)
      .eq('student_id', student.id).gte('date', inicio).lte('date', fin).order('date', { ascending: true })
    if (!error && data) setAsistencias(data.map((item: any) => ({ ...item, courses: Array.isArray(item.courses) ? item.courses[0] : item.courses })))
    setLoading(false)
  }

  const totalClases = asistencias.length
  const presentes = asistencias.filter(a => a.status === 'present').length
  const ausentes = asistencias.filter(a => a.status === 'absent').length
  const tardes = asistencias.filter(a => a.status === 'late').length
  const porcentajeAsistencia = totalClases > 0 ? ((presentes + tardes * 0.5) / totalClases * 100).toFixed(1) : '0'

  const resumenPorCurso: any[] = []
  const cursosUnicos = [...new Set(asistencias.map(a => a.courses?.name))]
  cursosUnicos.forEach(curso => {
    const ac = asistencias.filter(a => a.courses?.name === curso)
    const t = ac.length; const p = ac.filter(a => a.status === 'present').length
    const au = ac.filter(a => a.status === 'absent').length; const ta = ac.filter(a => a.status === 'late').length
    if (t > 0) resumenPorCurso.push({ curso: curso || 'Sin nombre', color: ac[0]?.courses?.color || '#6B7280', presentes: p, ausentes: au, tardes: ta, total: t, porcentaje: ((p + ta * 0.5) / t * 100) })
  })

  const handleJustificar = async () => {
    if (!faltaSeleccionada || !justificacion.trim()) return
    setEnviandoJustificacion(true)
    const { error } = await supabase.from('attendance').update({ justification: justificacion, status: 'justified' }).eq('id', faltaSeleccionada.id)
    if (!error) { setMostrarJustificar(false); setFaltaSeleccionada(null); setJustificacion(''); cargarAsistencias() }
    setEnviandoJustificacion(false)
  }

  const getIconoEstado = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
      case 'absent': return <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
      case 'late': return <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
      case 'justified': return <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
      default: return null
    }
  }

  const getColorFondo = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-50'
      case 'absent': return 'bg-red-50'
      case 'late': return 'bg-amber-50'
      case 'justified': return 'bg-blue-50'
      default: return ''
    }
  }

  const getTextoEstado = (status: string) => {
    switch (status) {
      case 'present': return 'Presente'
      case 'absent': return 'Ausente'
      case 'late': return 'Tarde'
      case 'justified': return 'Justificado'
      default: return status
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-purple-600" /></div>

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* Header interno */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-purple-600 flex items-center justify-center">
          <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Asistencia</h1>
          <p className="text-xs md:text-sm text-gray-500">{MESES[mesSeleccionado]} {anioSeleccionado}</p>
        </div>
      </div>

      {/* Selector de mes */}
      <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        {MESES.map((nombre, i) => (
          <button key={i} onClick={() => setMesSeleccionado(i)}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${mesSeleccionado === i ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
            {nombre.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        {[
          { label: 'Asistencia', value: `${porcentajeAsistencia}%`, icon: TrendingUp, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Presentes', value: presentes, icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600' },
          { label: 'Tardes', value: tardes, icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'Ausentes', value: ausentes, icon: XCircle, bg: 'bg-red-50', text: 'text-red-600' },
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

      {/* Barra de progreso */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-4 md:mb-6">
        <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-3">Asistencia General</h3>
        <div className="bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all" style={{ width: `${porcentajeAsistencia}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] md:text-xs text-gray-500">
          <span>0%</span>
          <span className={Number(porcentajeAsistencia) >= 75 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>{porcentajeAsistencia}%</span>
          <span>100%</span>
        </div>
        {Number(porcentajeAsistencia) < 75 && <p className="text-[10px] md:text-xs text-red-500 mt-2">⚠️ Estás por debajo del mínimo (75%)</p>}
      </div>

      {/* Resumen por curso */}
      {resumenPorCurso.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-4 md:mb-6">
          <h3 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Por Curso</h3>
          <div className="space-y-3">
            {resumenPorCurso.map(curso => (
              <div key={curso.curso}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: curso.color }} />
                    <span className="text-xs md:text-sm font-medium">{curso.curso}</span>
                  </div>
                  <span className={`text-xs md:text-sm font-bold ${curso.porcentaje >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{curso.porcentaje.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${curso.porcentaje}%`, backgroundColor: curso.porcentaje >= 75 ? '#10B981' : '#EF4444' }} />
                </div>
                <div className="flex gap-2 md:gap-3 mt-1 text-[10px] md:text-xs text-gray-500">
                  <span>✅ {curso.presentes}</span><span>⚠️ {curso.tardes}</span><span>❌ {curso.ausentes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registro Detallado */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-sm md:text-lg mb-3 md:mb-4">Registro Detallado</h3>
        
        {asistencias.length === 0 ? (
          <div className="text-center py-8"><Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-500 text-sm">Sin registros</p></div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {/* Mini calendario */}
            <div className="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4">
              <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center mb-1.5 md:mb-2">
                {['L','M','M','J','V','S','D'].map((d,i) => <span key={i} className="text-[10px] md:text-xs font-medium text-gray-400">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center">
                {Array.from({ length: 35 }, (_, i) => {
                  const dia = i - new Date(anioSeleccionado, mesSeleccionado, 1).getDay() + 2
                  const fechaStr = `${anioSeleccionado}-${String(mesSeleccionado+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
                  const asisDia = asistencias.filter(a => a.date === fechaStr)
                  const falta = asisDia.some(a => a.status === 'absent')
                  const tarde = asisDia.some(a => a.status === 'late')
                  const todas = asisDia.length > 0 && asisDia.every(a => a.status === 'present')
                  if (dia < 1 || dia > new Date(anioSeleccionado, mesSeleccionado+1, 0).getDate()) return <div key={i} className="h-6 md:h-8" />
                  return (
                    <div key={i} className={`h-6 md:h-8 rounded-md md:rounded-lg flex items-center justify-center text-[10px] md:text-xs font-medium ${
                      todas ? 'bg-emerald-100 text-emerald-700' : falta ? 'bg-red-100 text-red-700' : tarde ? 'bg-amber-100 text-amber-700' : asisDia.length > 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
                      title={asisDia.map(a => a.courses?.name).join(', ')}>{dia}</div>
                  )
                })}
              </div>
              <div className="flex justify-center gap-3 md:gap-4 mt-2 md:mt-3 text-[9px] md:text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Presente</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Tarde</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-400" /> Ausente</span>
              </div>
            </div>

            {/* Por curso */}
            {cursosUnicos.map((curso, cIndex) => {
              const ac = asistencias.filter(a => a.courses?.name === curso).sort((a,b) => b.date.localeCompare(a.date))
              if (ac.length === 0) return null
              return (
                <motion.div key={curso} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: cIndex * 0.1 }}
                  className="border border-gray-100 rounded-lg md:rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-2.5 md:p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ac[0]?.courses?.color || '#6B7280' }} />
                      <span className="text-xs md:text-sm font-semibold text-gray-700">{curso}</span>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-400">{ac.length} clases</span>
                  </div>
                  <div className="divide-y">
                    {ac.map(asistencia => (
                      <div key={asistencia.id} className={`flex items-center justify-between p-2.5 md:p-3 ${getColorFondo(asistencia.status)}`}>
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <span className="text-[10px] md:text-xs text-gray-500 flex-shrink-0">
                            {new Date(asistencia.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {getIconoEstado(asistencia.status)}
                            <span className="text-[10px] md:text-xs font-medium">{getTextoEstado(asistencia.status)}</span>
                            {asistencia.justification && (
                              <span className="text-[9px] md:text-[10px] text-blue-600 italic truncate">— {asistencia.justification}</span>
                            )}
                          </div>
                        </div>
                        {(asistencia.status === 'absent' || asistencia.status === 'late') && (
                          <button onClick={() => { setFaltaSeleccionada(asistencia); setMostrarJustificar(true) }}
                            className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] md:text-xs hover:bg-gray-50 transition-colors flex-shrink-0 ml-2">
                            <Send className="h-2.5 w-2.5 md:h-3 md:w-3" />{asistencia.justification ? 'Editar' : 'Justificar'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Justificar */}
      {mostrarJustificar && faltaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-5 md:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Justificar Falta</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">{faltaSeleccionada.courses?.name} - {new Date(faltaSeleccionada.date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
            </div>
            {faltaSeleccionada.justification ? (
              <div className="bg-gray-50 rounded-xl p-4 mb-4"><p className="text-sm font-medium">Justificación actual:</p><p className="text-sm text-gray-600 mt-1">{faltaSeleccionada.justification}</p></div>
            ) : (
              <textarea value={justificacion} onChange={e => setJustificacion(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm mb-4" rows={3} placeholder="Ej: Enfermedad, turno médico..." />
            )}
            <div className="flex gap-2">
              <button onClick={() => { setMostrarJustificar(false); setFaltaSeleccionada(null); setJustificacion('') }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
              {!faltaSeleccionada.justification && (
                <button onClick={handleJustificar} disabled={!justificacion.trim() || enviandoJustificacion}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                  {enviandoJustificacion ? 'Enviando...' : 'Justificar'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}