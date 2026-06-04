'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Plus, Save, Loader2, CheckCircle2,
  Calendar, Clock, FileText, Upload, X
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Props = {
  curso: any
}

export function NuevaTareaContent({ curso }: Props) {
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '23:59',
    max_score: 10,
    is_exam: false,
  })

  const handleGuardar = async () => {
    if (!formData.title.trim()) {
      alert('El título es obligatorio')
      return
    }
    if (!formData.due_date) {
      alert('La fecha de entrega es obligatoria')
      return
    }

    setGuardando(true)
    let fileUrl: string | null = null

    // Si hay archivo adjunto, subirlo
    if (archivoSeleccionado) {
      const fileExt = archivoSeleccionado.name.split('.').pop()
      const nombreSeguro = archivoSeleccionado.name
        .replace(/\.[^/.]+$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)

      const fileName = `tareas/${curso.id}/${Date.now()}_${nombreSeguro}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('materiales')
        .upload(fileName, archivoSeleccionado)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('materiales')
          .getPublicUrl(fileName)
        fileUrl = publicUrl
      }
    }

    // Crear tarea
    const dueDate = `${formData.due_date}T${formData.due_time}:00`
    
    const { error } = await supabase
      .from('assignments')
      .insert({
        title: formData.title,
        description: formData.description || null,
        due_date: dueDate,
        max_score: formData.max_score,
        file_url: fileUrl,
        course_id: curso.id,
      })

    if (!error) {
      // 🆕 NOTIFICAR A LOS ESTUDIANTES DEL CURSO
      const { error: notifError } = await supabase.rpc('notify_course_students', {
        p_course_id: curso.id,
        p_title: '📝 Nueva tarea',
        p_message: `${formData.title} - Entrega: ${new Date(dueDate).toLocaleDateString('es-AR')}`,
        p_type: 'assignment'
      })
      
      if (notifError) {
        console.error('Error al notificar:', notifError)
      }

      setMensajeExito('✅ Tarea creada correctamente')
      setTimeout(() => {
        setMensajeExito('')
        router.push(`/panel/mis-cursos/${curso.id}/calificar`)
        router.refresh()
      }, 1500)
    } else {
      alert('Error al crear tarea: ' + error.message)
    }

    setGuardando(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Mensaje éxito */}
      {mensajeExito && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          {mensajeExito}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/panel/mis-cursos/${curso.id}/calificar`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: curso.color || '#6366F1' }}
            >
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nueva Tarea</h1>
              <p className="text-sm text-gray-500">{curso.name} - {curso.year}° {curso.division}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Trabajo Práctico - Unidad 3"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                placeholder="Instrucciones detalladas para los estudiantes..."
              />
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Fecha de entrega *
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Hora límite
                </label>
                <input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Puntaje máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntaje máximo
              </label>
              <select
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {[5, 10, 15, 20, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n} puntos</option>
                ))}
              </select>
            </div>

            {/* Archivo adjunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Archivo adjunto (opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {archivoSeleccionado ? (
                    <div className="flex items-center gap-2 justify-center">
                      <FileText className="h-8 w-8 text-indigo-500" />
                      <span className="text-sm font-medium">{archivoSeleccionado.name}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); setArchivoSeleccionado(null) }}
                        className="p-1 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click para adjuntar archivo</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, Word, imágenes</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Link
                href={`/panel/mis-cursos/${curso.id}/calificar`}
                className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-medium text-gray-600 hover:bg-gray-50 transition-all text-center"
              >
                Cancelar
              </Link>
              <button
                onClick={handleGuardar}
                disabled={guardando || !formData.title.trim() || !formData.due_date}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium hover:from-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {guardando ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}