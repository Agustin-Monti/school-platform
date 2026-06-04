'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, BookMarked, Plus, X, Save, Loader2,
  CheckCircle2, Trash2, Edit3
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Tema = {
  id: string; name: string; description: string | null; order_index: number; course_id: string
}

type Props = { curso: any; materias: Tema[] }

export function TemasProfesorContent({ curso, materias: temasIniciales }: Props) {
  const [temas, setTemas] = useState<Tema[]>(temasIniciales)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState<Tema | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [eliminando, setEliminando] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({ name: '', description: '', order_index: temas.length + 1 })

  const abrirNuevo = () => {
    setEditando(null); setFormData({ name: '', description: '', order_index: temas.length + 1 }); setMostrarModal(true)
  }
  const abrirEditar = (tema: Tema) => {
    setEditando(tema); setFormData({ name: tema.name, description: tema.description || '', order_index: tema.order_index }); setMostrarModal(true)
  }

  const handleGuardar = async () => {
    if (!formData.name.trim()) { alert('El nombre del tema es obligatorio'); return }
    setGuardando(true)
    if (editando) {
      await supabase.from('subjects').update({ name: formData.name, description: formData.description || null, order_index: formData.order_index }).eq('id', editando.id)
      setMensajeExito('✅ Tema actualizado')
    } else {
      await supabase.from('subjects').insert({ name: formData.name, description: formData.description || null, order_index: formData.order_index, course_id: curso.id })
      setMensajeExito('✅ Tema creado')
    }
    setTimeout(() => setMensajeExito(''), 2000)
    setMostrarModal(false); setGuardando(false)
    const { data } = await supabase.from('subjects').select('*').eq('course_id', curso.id).order('order_index')
    if (data) setTemas(data)
    router.refresh()
  }

  const handleEliminar = async (temaId: string) => {
    await supabase.from('subjects').delete().eq('id', temaId)
    setMensajeExito('🗑️ Tema eliminado'); setTimeout(() => setMensajeExito(''), 2000); setEliminando(null)
    const { data } = await supabase.from('subjects').select('*').eq('course_id', curso.id).order('order_index')
    if (data) setTemas(data)
    router.refresh()
  }

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
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href={`/panel/mis-cursos/${curso.id}`} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </Link>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center" style={{ backgroundColor: curso.color || '#6366F1' }}>
                <BookMarked className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Temas</h1>
                <p className="text-xs md:text-sm text-gray-500">{curso.name} - {curso.year}° {curso.division}</p>
              </div>
            </div>
            <button onClick={abrirNuevo} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium shadow-lg">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />Nuevo Tema
            </button>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {temas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <BookMarked className="h-12 md:h-16 w-12 md:w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-base md:text-lg">No hay temas creados</p>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Agregá los temas para organizar el material</p>
            <button onClick={abrirNuevo} className="mt-3 md:mt-4 px-5 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium">Crear primer tema</button>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {temas.map((tema, index) => (
              <motion.div key={tema.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
                    style={{ backgroundColor: curso.color || '#6366F1' }}>{index + 1}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{tema.name}</h3>
                    {tema.description && <p className="text-xs md:text-sm text-gray-500 truncate">{tema.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 ml-2">
                  <button onClick={() => abrirEditar(tema)} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit3 className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" /></button>
                  <button onClick={() => setEliminando(tema.id)} className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-400" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setMostrarModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">{editando ? 'Editar Tema' : 'Nuevo Tema'}</h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nombre del tema *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm" placeholder="Ej: Ecuaciones cuadráticas..." />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Descripción (opcional)</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm resize-none" rows={2} placeholder="Breve descripción..." />
                </div>
                <div className="flex gap-2 md:gap-3 pt-2">
                  <button onClick={() => setMostrarModal(false)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button onClick={handleGuardar} disabled={guardando || !formData.name.trim()}
                    className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-medium hover:from-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editando ? 'Actualizar' : 'Crear Tema'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR */}
      <AnimatePresence>
        {eliminando && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setEliminando(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 md:h-8 md:w-8 text-red-500" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2">¿Eliminar tema?</h3>
              <p className="text-sm text-gray-500 mb-4">Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => setEliminando(null)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium">Cancelar</button>
                <button onClick={() => handleEliminar(eliminando)} className="flex-1 py-2.5 md:py-3 bg-red-600 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" />Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}