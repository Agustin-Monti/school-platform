'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, TrendingUp, Star, FileText, 
  Download, ExternalLink, Loader2, BarChart3,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Materia = {
  id: string; name: string; description: string
  courses: {
    name: string; color: string; classroom: string; year: number; division: string
    teachers?: { speciality: string; profiles: { full_name: string } }
  }
  grades: { id: string; value: number; type: string; description: string; date: string }[]
}

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string | null>(null)
  const [materiales, setMateriales] = useState<any[]>([])
  const [cargandoMateriales, setCargandoMateriales] = useState(false)
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { cargarMaterias() }, [])

  const cargarMaterias = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: student } = await supabase.from('students').select('id').eq('profile_id', user.id).single()
    if (!student) { setLoading(false); return }
    const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', student.id)
    const courseIds = (enrollments || []).map(e => e.course_id)
    if (courseIds.length === 0) { setLoading(false); return }

    const { data, error } = await supabase.from('subjects')
      .select(`id, name, description, courses!inner (name, color, classroom, year, division, teachers (speciality, profiles (full_name))), grades (id, value, type, description, date)`)
      .in('course_id', courseIds).order('name')

    if (!error && data) {
      setMaterias(data.map((item: any) => ({
        ...item, courses: Array.isArray(item.courses) ? item.courses[0] : item.courses,
        grades: (item.grades || []).filter((g: any) => g.student_id === student.id)
      })))
    }
    setLoading(false)
  }

  const cargarMateriales = async (subjectId: string) => {
    setCargandoMateriales(true)
    const { data } = await supabase.from('materials')
      .select(`id, title, description, type, url, created_at, profiles:uploaded_by (full_name)`)
      .eq('subject_id', subjectId).order('created_at', { ascending: false })
    if (data) setMateriales(data)
    setCargandoMateriales(false)
  }

  useEffect(() => { if (materiaSeleccionada) cargarMateriales(materiaSeleccionada) }, [materiaSeleccionada])

  const getIconoTipo = (type: string) => type === 'pdf' ? FileText : ExternalLink
  const getColorTipo = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-500 bg-red-50'
      case 'video': return 'text-blue-500 bg-blue-50'
      case 'link': return 'text-green-500 bg-green-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const calcularPromedio = (grades: { value: number }[]) => {
    if (!grades || grades.length === 0) return 0
    return (grades.reduce((acc, g) => acc + g.value, 0) / grades.length).toFixed(1)
  }

  const getColorPromedio = (promedio: number) => {
    if (promedio >= 8) return 'text-emerald-600'
    if (promedio >= 6) return 'text-blue-600'
    if (promedio >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getBarraColor = (promedio: number) => {
    if (promedio >= 8) return 'bg-emerald-500'
    if (promedio >= 6) return 'bg-blue-500'
    if (promedio >= 4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const materiaActual = materias.find(m => m.id === materiaSeleccionada)

  const cursosAgrupados = materias.reduce((acc: any[], materia: Materia) => {
    const cursoId = materia.courses?.name + '-' + materia.courses?.year + '-' + materia.courses?.division
    const existente = acc.find(g => g.cursoId === cursoId)
    if (existente) { existente.materias.push(materia) }
    else { acc.push({ cursoId, cursoNombre: `${materia.courses?.name} - ${materia.courses?.year}° ${materia.courses?.division}`, color: materia.courses?.color, materias: [materia] }) }
    return acc
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
      {materiaSeleccionada && materiaActual ? (
        /* ========================================== */
        /* VISTA DETALLE */
        /* ========================================== */
        <div>
          <button onClick={() => setMateriaSeleccionada(null)} className="mb-3 text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ChevronDown className="h-4 w-4 rotate-90" /> Volver
          </button>

          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-bold"
                style={{ backgroundColor: materiaActual.courses?.color || '#4F46E5' }}>
                {materiaActual.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold">{materiaActual.name}</h2>
                <p className="text-xs md:text-sm text-gray-500">{materiaActual.description}</p>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-xs md:text-sm text-gray-500">
                  <span>📚 {materiaActual.courses?.name}</span>
                  <span>📍 {materiaActual.courses?.classroom}</span>
                  {materiaActual.courses?.teachers && <span>👩‍🏫 {materiaActual.courses.teachers.profiles?.full_name || 'Sin profesor'}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
              {[
                { label: 'Promedio', value: calcularPromedio(materiaActual.grades), color: 'emerald' },
                { label: 'Calificaciones', value: materiaActual.grades.length, color: 'blue' },
                { label: 'Mejor nota', value: materiaActual.grades.length > 0 ? Math.max(...materiaActual.grades.map(g => g.value)) : '-', color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-xl p-4 md:p-6 text-center`}>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-2xl md:text-4xl font-bold ${stat.color === 'emerald' ? getColorPromedio(Number(stat.value)) : 'text-' + stat.color + '-700'}`}>
                    {typeof stat.value === 'number' && stat.label === 'Promedio' ? stat.value : stat.value}
                  </p>
                  {stat.label === 'Promedio' && (
                    <div className="mt-2 bg-white rounded-full h-1.5 md:h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${getBarraColor(Number(stat.value))}`} style={{ width: `${(Number(stat.value) / 10) * 100}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-sm md:text-lg mb-3">Historial</h3>
            {materiaActual.grades.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">Sin calificaciones aún</p>
            ) : (
              <div className="space-y-1.5 md:space-y-2">
                {materiaActual.grades.map((grade, index) => (
                  <motion.div key={grade.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl hover:bg-gray-50">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${grade.value >= 7 ? 'bg-emerald-500' : grade.value >= 4 ? 'bg-orange-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-xs md:text-sm">{grade.description}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">{grade.type} • {new Date(grade.date).toLocaleDateString('es-AR')}</p>
                      </div>
                    </div>
                    <span className={`text-base md:text-lg font-bold ${grade.value >= 7 ? 'text-emerald-600' : grade.value >= 4 ? 'text-orange-600' : 'text-red-600'}`}>{grade.value}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Material de Estudio */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-sm md:text-lg mb-3">Material de Estudio</h3>
            {cargandoMateriales ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : materiales.length === 0 ? (
              <div className="text-center py-6"><FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">Sin materiales</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {materiales.map(material => {
                  const Icon = getIconoTipo(material.type)
                  return (
                    <motion.a key={material.id} href={material.url} target="_blank" whileHover={{ scale: 1.01 }}
                      className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group">
                      <div className={`p-1.5 md:p-2 rounded-lg ${getColorTipo(material.type)}`}><Icon className="h-4 w-4 md:h-5 md:w-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">{material.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 uppercase">{material.type}</span>
                          {material.profiles && <span className="text-[9px] md:text-[10px] text-gray-400">{material.profiles.full_name}</span>}
                        </div>
                      </div>
                      <Download className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </motion.a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================== */
        /* VISTA GENERAL (ACORDEONES) */
        /* ========================================== */
        <div>
          {/* Header interno */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Materias</h1>
              <p className="text-xs md:text-sm text-gray-500">{materias.length > 0 ? `${cursosAgrupados.length} cursos` : 'Mis materias'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
            {[
              { label: 'Promedio General', value: materias.length > 0 ? (materias.reduce((acc, m) => acc + Number(calcularPromedio(m.grades)), 0) / materias.length).toFixed(1) : '0', icon: Star, color: 'text-yellow-500' },
              { label: 'Materias', value: materias.length, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Aprobadas', value: materias.filter(m => Number(calcularPromedio(m.grades)) >= 7).length, icon: BarChart3, color: 'text-purple-500' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 text-center">
                <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color} mx-auto mb-1 md:mb-2`} />
                <p className="text-xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-[10px] md:text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Acordeones */}
          {cursosAgrupados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl"><BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No se encontraron materias</p></div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {cursosAgrupados.map((grupo, gIndex) => (
                <motion.div key={grupo.cursoId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gIndex * 0.1 }}
                  className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-3 md:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setCursoExpandido(cursoExpandido === grupo.cursoId ? null : grupo.cursoId)}>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: grupo.color || '#6366F1' }} />
                      <h3 className="font-semibold text-sm md:text-lg">{grupo.cursoNombre}</h3>
                      <span className="text-xs md:text-sm text-gray-400">{grupo.materias.length} mat.</span>
                    </div>
                    {cursoExpandido === grupo.cursoId ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />}
                  </div>
                  <AnimatePresence>
                    {cursoExpandido === grupo.cursoId && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t">
                        <div className="p-2 md:p-4 space-y-1.5 md:space-y-2">
                          {grupo.materias.map((materia: Materia, mIndex: number) => {
                            const promedio = Number(calcularPromedio(materia.grades))
                            return (
                              <motion.div key={materia.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: mIndex * 0.05 }}
                                whileHover={{ scale: 1.01 }} onClick={() => setMateriaSeleccionada(materia.id)}
                                className="flex items-center gap-2 md:gap-4 p-2.5 md:p-4 rounded-lg md:rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm"
                                  style={{ backgroundColor: grupo.color || '#4F46E5' }}>{materia.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs md:text-sm text-gray-900">{materia.name}</p>
                                  {materia.description && <p className="text-[10px] md:text-xs text-gray-500 truncate">{materia.description}</p>}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className={`text-sm md:text-lg font-bold ${getColorPromedio(promedio)}`}>{calcularPromedio(materia.grades)}</p>
                                  <div className="mt-0.5 bg-gray-200 rounded-full h-1 md:h-1.5 w-12 md:w-16 overflow-hidden">
                                    <div className={`h-full rounded-full ${getBarraColor(promedio)}`} style={{ width: `${(promedio / 10) * 100}%` }} />
                                  </div>
                                  <p className="text-[8px] md:text-[10px] text-gray-400 mt-0.5">{materia.grades.length} notas</p>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}