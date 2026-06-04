'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, BookOpen, Plus, Search, X, Save, Loader2,
  CheckCircle2, Trash2, Users, Clock, BookMarked, 
  GraduationCap, MapPin
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Curso = {
  id: string
  name: string
  year: number
  division: string
  classroom: string
  color: string
  teachers: any
  subjects: any[]
  schedules: any[]
  enrollments: any[]
}

type Teacher = {
  id: string
  speciality: string
  profiles: { full_name: string }
}

type Props = {
  cursos: Curso[]
  teachers: Teacher[]
}

const COLORES = [
  '#4F46E5', '#059669', '#EA580C', '#7C3AED', '#DC2626', '#0891B2',
  '#D97706', '#2563EB', '#C026D3', '#65A30D', '#DB2777', '#0284C7'
]

export function CursosContent({ cursos, teachers }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editandoCurso, setEditandoCurso] = useState<Curso | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [eliminando, setEliminando] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    year: 1,
    division: 'A',
    classroom: '',
    color: COLORES[0],
    teacher_id: '',
  })

  const abrirNuevo = () => {
    setEditandoCurso(null)
    setFormData({
      name: '',
      year: 1,
      division: 'A',
      classroom: '',
      color: COLORES[0],
      teacher_id: '',
    })
    setMostrarModal(true)
  }

  const abrirEditar = (curso: Curso) => {
    setEditandoCurso(curso)
    setFormData({
      name: curso.name,
      year: curso.year,
      division: curso.division,
      classroom: curso.classroom || '',
      color: curso.color || COLORES[0],
      teacher_id: curso.teachers?.id || '',
    })
    setMostrarModal(true)
  }

  const handleGuardar = async () => {
    if (!formData.name.trim()) {
      alert('El nombre del curso es obligatorio')
      return
    }

    setGuardando(true)

    if (editandoCurso) {
      // Actualizar curso existente
      const { error } = await supabase
        .from('courses')
        .update({
          name: formData.name,
          year: formData.year,
          division: formData.division,
          classroom: formData.classroom || null,
          color: formData.color,
          teacher_id: formData.teacher_id || null,
        })
        .eq('id', editandoCurso.id)

      if (error) {
        alert('Error al actualizar: ' + error.message)
        setGuardando(false)
        return
      }
    } else {
      // Crear nuevo curso
      const { data: academicYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('year', new Date().getFullYear())
        .single()

      const { error } = await supabase
        .from('courses')
        .insert({
          name: formData.name,
          year: formData.year,
          division: formData.division,
          classroom: formData.classroom || null,
          color: formData.color,
          academic_year_id: academicYear?.id,
          teacher_id: formData.teacher_id || null,
        })

      if (error) {
        alert('Error al crear: ' + error.message)
        setGuardando(false)
        return
      }
    }

    setMensajeExito(editandoCurso ? '✅ Curso actualizado' : '✅ Curso creado correctamente')
    setTimeout(() => {
      setMensajeExito('')
      setMostrarModal(false)
      setEditandoCurso(null)
      router.refresh()
    }, 1500)
    setGuardando(false)
  }

  const handleEliminar = async (cursoId: string) => {
    if (!confirm('¿Eliminar este curso? Se perderán todas las inscripciones.')) return
    
    setEliminando(cursoId)
    const { error } = await supabase.from('courses').delete().eq('id', cursoId)
    
    if (!error) {
      setMensajeExito('🗑️ Curso eliminado')
      setTimeout(() => { setMensajeExito(''); router.refresh() }, 1500)
    }
    setEliminando(null)
  }

  const cursosFiltrados = cursos.filter(c => {
    if (busqueda && !c.name.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  // Agrupar por año
  const cursosPorAnio = cursosFiltrados.reduce((acc: any, curso) => {
    if (!acc[curso.year]) acc[curso.year] = []
    acc[curso.year].push(curso)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Mensaje éxito */}
      <AnimatePresence>
        {mensajeExito && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            {mensajeExito}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cursos</h1>
                <p className="text-sm text-gray-500">{cursos.length} cursos totales</p>
              </div>
            </div>

            <button
              onClick={abrirNuevo}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:from-red-700 transition-all shadow-lg shadow-red-500/25"
            >
              <Plus className="h-5 w-5" />
              Nuevo Curso
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar curso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Cursos agrupados por año */}
        {Object.keys(cursosPorAnio).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay cursos creados</p>
          </div>
        ) : (
          Object.entries(cursosPorAnio).map(([anio, cursosAnio]: any) => (
            <div key={anio} className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-red-500" />
                {anio}° Año
                <span className="text-sm font-normal text-gray-400">
                  ({cursosAnio.length} cursos)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cursosAnio.map((curso: Curso, index: number) => (
                  <motion.div
                    key={curso.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                  >
                    {/* Header de color */}
                    <div 
                      className="p-5 text-white"
                      style={{ backgroundColor: curso.color || '#4F46E5' }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{curso.name}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => abrirEditar(curso)}
                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Editar"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEliminar(curso.id)}
                            className="p-1.5 bg-white/20 rounded-lg hover:bg-red-400/50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm mt-1">
                        {curso.year}° Año - División {curso.division}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {curso.classroom || 'Sin aula asignada'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {curso.enrollments?.length || 0} alumnos inscriptos
                        </p>
                        <p className="flex items-center gap-2">
                          <BookMarked className="h-4 w-4" />
                          {curso.subjects?.length || 0} materias
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {curso.schedules?.length || 0} clases por semana
                        </p>
                        <p className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          {curso.teachers?.profiles?.full_name || 'Sin profesor asignado'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {editandoCurso ? 'Editar Curso' : 'Nuevo Curso'}
                </h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Matemática, Lengua..."
                  />
                </div>

                {/* Año y División */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    >
                      {[1,2,3,4,5,6].map(a => (
                        <option key={a} value={a}>{a}° Año</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">División</label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    >
                      {['A','B','C','D'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Aula */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aula</label>
                  <input
                    type="text"
                    value={formData.classroom}
                    onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    placeholder="Ej: Aula 101"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORES.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-red-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Profesor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profesor</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="">Sin profesor</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.profiles?.full_name} ({t.speciality})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-medium hover:from-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {editandoCurso ? 'Actualizar' : 'Crear Curso'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}