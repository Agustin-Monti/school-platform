'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, FileText, Upload, Link as LinkIcon, X, Save, 
  Loader2, Trash2, Download, ExternalLink, 
  BookMarked, Plus, Search
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Materia = { id: string; name: string }
type Material = {
  id: string; title: string; description: string | null; type: string; url: string
  file_size: number | null; created_at: string; subject_id: string | null; subjects: { name: string } | null
}
type Props = { curso: any; materias: Materia[]; materiales: Material[] }

export function MaterialContent({ curso, materias, materiales }: Props) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [filtroMateria, setFiltroMateria] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [eliminandoNombre, setEliminandoNombre] = useState('')
  const [eliminandoUrl, setEliminandoUrl] = useState('')

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'pdf' as 'pdf' | 'link' | 'video', url: '', subject_id: '', file: null as File | null
  })

  const resetForm = () => setFormData({ title: '', description: '', type: 'pdf', url: '', subject_id: '', file: null })

  const handleSubirMaterial = async () => {
    if (!formData.title.trim()) { alert('El título es obligatorio'); return }
    if ((formData.type === 'link' || formData.type === 'video') && !formData.url.trim()) { alert('La URL es obligatoria'); return }
    setGuardando(true)
    let url = formData.url
    if (formData.type === 'pdf' && formData.file) {
      const extension = formData.file.name.split('.').pop()?.toLowerCase()
      const nombreSeguro = formData.file.name.replace(/\.[^/.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').substring(0, 50).replace(/^_|_$/g, '')
      const fileName = `${curso.id}/${Date.now()}_${nombreSeguro}.${extension}`
      const { error: uploadError } = await supabase.storage.from('materiales').upload(fileName, formData.file, { cacheControl: '3600', upsert: false })
      if (uploadError) { alert('Error al subir archivo'); setGuardando(false); return }
      const { data: { publicUrl } } = supabase.storage.from('materiales').getPublicUrl(fileName)
      url = publicUrl
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('materials').insert({
      title: formData.title, description: formData.description || null, type: formData.type, url,
      file_size: formData.file?.size || null, course_id: curso.id, subject_id: formData.subject_id || null, uploaded_by: user?.id
    })
    if (!error) {
      // 🆕 NOTIFICAR SOLO A LOS ESTUDIANTES DE ESTE CURSO
      const { error: notifError } = await supabase.rpc('notify_course_students', {
        p_course_id: curso.id,
        p_title: '📚 Nuevo material',
        p_message: `${formData.title} - ${curso.name}`,
        p_type: 'material'
      })
      if (notifError) console.error('Error al notificar:', notifError)

      setMensajeExito('✅ Material subido')
      setTimeout(() => { setMensajeExito(''); setMostrarModal(false); resetForm(); router.refresh() }, 2000)
    } else {
      alert('Error: ' + error.message)
    }
    setGuardando(false)
  }

  const handleEliminarMaterial = (materialId: string, materialUrl: string, materialNombre: string) => {
    setEliminando(materialId); setEliminandoNombre(materialNombre); setEliminandoUrl(materialUrl)
  }

  const confirmarEliminar = async () => {
    if (!eliminando) return
    if (eliminandoUrl?.includes('supabase.co/storage')) {
      try {
        const url = new URL(eliminandoUrl); const parts = url.pathname.split('/'); const idx = parts.indexOf('materiales')
        if (idx !== -1) await supabase.storage.from('materiales').remove([parts.slice(idx + 1).join('/')])
      } catch {}
    }
    await supabase.from('materials').delete().eq('id', eliminando)
    setMensajeExito('🗑️ Material eliminado'); setTimeout(() => { setMensajeExito(''); setEliminando(null); router.refresh() }, 1500)
  }

  const materialesFiltrados = materiales.filter(m => {
    if (filtroMateria !== 'todas' && m.subject_id !== filtroMateria) return false
    if (filtroTipo !== 'todos' && m.type !== filtroTipo) return false
    if (busqueda && !m.title.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  const getIconoTipo = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
      case 'video': return <ExternalLink className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
      case 'link': return <LinkIcon className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
      default: return <FileText className="h-6 w-6 md:h-8 md:w-8 text-gray-500" />
    }
  }

  const getColorFondo = (type: string) => {
    switch (type) { case 'pdf': return 'bg-red-50'; case 'video': return 'bg-blue-50'; case 'link': return 'bg-green-50'; default: return 'bg-gray-50' }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''; if (bytes < 1024) return bytes + ' B'; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <AnimatePresence>
        {mensajeExito && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />{mensajeExito}
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
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <BookMarked className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Material</h1>
                <p className="text-xs md:text-sm text-gray-500">{curso.name} - {materiales.length} recursos</p>
              </div>
            </div>
            <button onClick={() => { resetForm(); setMostrarModal(true) }}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium shadow-lg">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />Subir
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-2">
            <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)}
              className="px-3 md:px-4 py-2 md:py-3 rounded-xl border border-gray-200 text-xs md:text-sm flex-1 sm:flex-none">
              <option value="todas">Todas</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="px-3 md:px-4 py-2 md:py-3 rounded-xl border border-gray-200 text-xs md:text-sm flex-1 sm:flex-none">
              <option value="todos">Tipos</option>
              <option value="pdf">📄 PDF</option>
              <option value="video">🎥 Video</option>
              <option value="link">🔗 Link</option>
            </select>
          </div>
        </div>

        {/* LISTA */}
        {materialesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <FileText className="h-12 md:h-16 w-12 md:w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{materiales.length === 0 ? 'No hay materiales' : 'Sin resultados'}</p>
            {materiales.length === 0 && (
              <button onClick={() => setMostrarModal(true)} className="mt-3 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm">Subir primer material</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {materialesFiltrados.map((material, index) => (
              <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }}
                className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className={`p-4 md:p-6 ${getColorFondo(material.type)} flex items-center justify-between`}>
                  {getIconoTipo(material.type)}
                  <span className="text-[10px] md:text-xs font-medium uppercase text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">{material.type}</span>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1 line-clamp-2">{material.title}</h3>
                  {material.description && <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">{material.description}</p>}
                  <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-400 mb-2">
                    <span>{material.subjects?.name || 'Sin materia'}</span>
                    {material.file_size && <span>{formatFileSize(material.file_size)}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-[10px] md:text-xs text-gray-400">{new Date(material.created_at).toLocaleDateString('es-AR')}</span>
                    <div className="flex gap-1">
                      <a href={material.url} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg">
                        {material.type === 'link' || material.type === 'video' ? <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" /> : <Download className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500" />}
                      </a>
                      <button onClick={() => handleEliminarMaterial(material.id, material.url, material.title)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-400" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL SUBIR */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setMostrarModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">Subir Material</h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Tipo</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'pdf', label: '📄 Archivo', icon: Upload },
                      { value: 'link', label: '🔗 Link', icon: LinkIcon },
                      { value: 'video', label: '🎥 Video', icon: ExternalLink },
                    ].map(tipo => (
                      <button key={tipo.value} onClick={() => setFormData({ ...formData, type: tipo.value as any, file: null, url: '' })}
                        className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all ${formData.type === tipo.value ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <tipo.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />{tipo.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Materia</label>
                  <select value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm">
                    <option value="">Sin materia específica</option>
                    {materias.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Título *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm" placeholder="Ej: Guía de ejercicios" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Descripción</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm resize-none" rows={2} placeholder="Breve descripción..." />
                </div>
                {formData.type === 'pdf' ? (
                  <div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-emerald-400" onClick={() => fileInputRef.current?.click()}>
                      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                        onChange={e => { const f = e.target.files?.[0]; if (f) setFormData({ ...formData, file: f, url: f.name }) }} />
                      {formData.file ? (
                        <div><FileText className="h-8 w-8 md:h-10 md:w-10 text-emerald-500 mx-auto mb-1" /><p className="text-xs md:text-sm font-medium">{formData.file.name}</p><p className="text-[10px] md:text-xs text-gray-400">{formatFileSize(formData.file.size)}</p></div>
                      ) : (
                        <div><Upload className="h-8 w-8 md:h-10 md:w-10 text-gray-400 mx-auto mb-1" /><p className="text-xs md:text-sm text-gray-500">Click para seleccionar archivo</p><p className="text-[10px] md:text-xs text-gray-400 mt-1">PDF, Word, Excel, ZIP</p></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">URL</label>
                    <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm" placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://...'} />
                  </div>
                )}
                <div className="flex gap-2 md:gap-3 pt-2">
                  <button onClick={() => setMostrarModal(false)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button onClick={handleSubirMaterial} disabled={guardando || !formData.title.trim()}
                    className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl text-sm font-medium hover:from-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Subir
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
              <h3 className="text-lg md:text-xl font-bold mb-2">¿Eliminar material?</h3>
              <div className="bg-red-50 rounded-xl p-3 mb-4"><p className="text-sm font-medium text-red-800 truncate">"{eliminandoNombre}"</p></div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => setEliminando(null)} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium">Cancelar</button>
                <button onClick={confirmarEliminar} className="flex-1 py-2.5 md:py-3 bg-red-600 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" />Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}