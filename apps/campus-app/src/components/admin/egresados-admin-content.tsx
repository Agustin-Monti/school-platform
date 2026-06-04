'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, GraduationCap, Plus, X, Save, Loader2,
  CheckCircle2, Trash2, Edit3, Upload, ImageIcon,
  ChevronDown, ChevronUp, Users, Eye
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// ==========================================
// TIPOS
// ==========================================
type Promo = {
  id: string
  graduation_year: number
  photo_url: string | null
  phrase: string | null
  total_students: number
}

// ==========================================
// COMPONENTE
// ==========================================
export function EgresadosAdminContent({ promos }: { promos: Promo[] }) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState<Promo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [decadaExpandida, setDecadaExpandida] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [zoomPromo, setZoomPromo] = useState<Promo | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    graduation_year: new Date().getFullYear(),
    phrase: '',
    total_students: 0,
  })

  const añosUsados = promos.map(p => p.graduation_year)

  // Agrupar por décadas (ordenadas de más antigua a más nueva)
  const decadas = [...new Set(promos.map(p => Math.floor(p.graduation_year / 10) * 10))]
    .sort((a, b) => a - b)

  const getPromosPorDecada = (decada: number) => {
    return promos
      .filter(p => Math.floor(p.graduation_year / 10) * 10 === decada)
      .sort((a, b) => a.graduation_year - b.graduation_year)
  }

  // ==========================================
  // ABRIR MODALES
  // ==========================================
  const abrirNuevo = () => {
    setEditando(null)
    setFormData({ graduation_year: new Date().getFullYear(), phrase: '', total_students: 0 })
    setArchivoFoto(null)
    setPreviewFoto(null)
    setMostrarModal(true)
  }

  const abrirEditar = (promo: Promo) => {
    setEditando(promo)
    setFormData({
      graduation_year: promo.graduation_year,
      phrase: promo.phrase || '',
      total_students: promo.total_students,
    })
    setArchivoFoto(null)
    setPreviewFoto(promo.photo_url)
    setMostrarModal(true)
  }

  // ==========================================
  // SUBIR FOTO
  // ==========================================
  const handleSeleccionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Solo imágenes'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return }
    
    setArchivoFoto(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewFoto(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ==========================================
  // GUARDAR (CREAR / EDITAR)
  // ==========================================
  const handleGuardar = async () => {
    if (!formData.graduation_year) { alert('El año es obligatorio'); return }
    
    if (!editando && añosUsados.includes(formData.graduation_year)) {
      alert(`Ya existe una promo para el año ${formData.graduation_year}`)
      return
    }

    setGuardando(true)
    let photoUrl = editando?.photo_url || null

    if (archivoFoto) {
      // 🆕 Si hay foto anterior, eliminarla del bucket
      if (editando?.photo_url) {
        try {
          const url = new URL(editando.photo_url)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.indexOf('egresados')
          if (bucketIndex !== -1) {
            const oldPath = pathParts.slice(bucketIndex + 1).join('/')
            await supabase.storage.from('egresados').remove([oldPath])
          }
        } catch (err) {
          console.error('Error al eliminar foto anterior:', err)
        }
      }

      // Subir nueva foto
      const fileExt = archivoFoto.name.split('.').pop()
      const fileName = `promos/${formData.graduation_year}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('egresados')
        .upload(fileName, archivoFoto, { upsert: true })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('egresados')
          .getPublicUrl(fileName)
        photoUrl = publicUrl
      }
    }

    if (editando) {
      const { error } = await supabase
        .from('promos')
        .update({
          phrase: formData.phrase || null,
          total_students: formData.total_students,
          photo_url: photoUrl,
        })
        .eq('id', editando.id)
      
      if (!error) setMensajeExito('✅ Promo actualizada')
      else alert('Error: ' + error.message)
    } else {
      const { error } = await supabase
        .from('promos')
        .insert({
          graduation_year: formData.graduation_year,
          phrase: formData.phrase || null,
          total_students: formData.total_students,
          photo_url: photoUrl,
        })
      
      if (!error) setMensajeExito('✅ Promo creada')
      else alert('Error: ' + error.message)
    }

    setTimeout(() => { setMensajeExito(''); setMostrarModal(false); router.refresh() }, 1500)
    setGuardando(false)
  }

  // ==========================================
  // ELIMINAR
  // ==========================================
  const handleEliminar = async (promoId: string) => {
    // 🆕 Buscar la promo para obtener la URL de la foto
    const promo = promos.find(p => p.id === promoId)
    
    // 🆕 Eliminar foto del bucket si existe
    if (promo?.photo_url) {
      try {
        const url = new URL(promo.photo_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.indexOf('egresados')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          await supabase.storage.from('egresados').remove([filePath])
        }
      } catch (err) {
        console.error('Error al eliminar foto:', err)
      }
    }

    // Eliminar de la base de datos
    const { error } = await supabase.from('promos').delete().eq('id', promoId)
    if (!error) { 
      setMensajeExito('🗑️ Promo eliminada (foto y datos)')
      setTimeout(() => { setMensajeExito(''); setEliminando(null); router.refresh() }, 1500) 
    }
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* MENSAJE ÉXITO */}
      <AnimatePresence>
        {mensajeExito && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />{mensajeExito}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/admin" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </Link>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Egresados</h1>
                <p className="text-xs md:text-sm text-gray-500">{promos.length} promos</p>
              </div>
            </div>
            <button onClick={abrirNuevo}
              className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-amber-500 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium shadow-lg hover:bg-amber-600 transition-colors">
              <Plus className="h-4 w-4" />Nueva Promo
            </button>
          </div>
        </div>
      </div>

      {/* LISTA POR DÉCADAS (ACORDEONES) */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {promos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay promos cargadas</p>
            <button onClick={abrirNuevo} className="mt-3 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium">
              Crear primera promo
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {decadas.map((decada) => {
              const promosDecada = getPromosPorDecada(decada)
              const isOpen = decadaExpandida === decada
              const totalEgresados = promosDecada.reduce((acc, p) => acc + p.total_students, 0)
              
              return (
                <motion.div
                  key={decada}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Cabecera de la década */}
                  <div
                    onClick={() => setDecadaExpandida(isOpen ? null : decada)}
                    className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {String(decada).slice(-2)}'
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Década del {decada}</h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          {promosDecada.length} promo{promosDecada.length > 1 ? 's' : ''} • {totalEgresados} egresados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        {promosDecada.length}
                      </span>
                      {isOpen ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t"
                      >
                        <div className="p-3 md:p-5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-3">
                            {promosDecada.map((promo) => (
                              <motion.div
                                key={promo.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative"
                              >
                                {/* Marco Polaroid */}
                                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 pb-8 rotate-0 group-hover:rotate-0"
                                  style={{ 
                                    transform: `rotate(${(promo.graduation_year % 5 - 2) * 0.5}deg)`,
                                  }}
                                >
                                  {/* Foto */}
                                  <div 
                                    className="w-full aspect-[4/5] rounded overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 mb-2 cursor-pointer hover:brightness-90 transition-all"
                                    
                                  >
                                    {promo.photo_url ? (
                                      <Image 
                                        src={promo.photo_url} 
                                        alt={`Promo ${promo.graduation_year}`} 
                                        width={300}
                                        height={375}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Texto estilo Polaroid */}
                                  <div className="text-center px-1">
                                    <p className="font-bold text-base md:text-lg text-gray-900 font-poppins">
                                      {promo.graduation_year}
                                    </p>
                                    {promo.phrase && (
                                      <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 leading-tight italic">
                                        "{promo.phrase}"
                                      </p>
                                    )}
                                    <p className="text-[9px] md:text-[10px] text-gray-400 mt-1">
                                      {promo.total_students} egresados
                                    </p>
                                  </div>
                                </div>

                                {/* Botones al hover */}
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setZoomPromo(promo) }}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                                    title="Ver foto"
                                  >
                                    <Eye className="h-4 w-4 text-blue-500" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); abrirEditar(promo) }}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                                    title="Editar"
                                  >
                                    <Edit3 className="h-4 w-4 text-gray-600" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEliminando(promo.id) }}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL CREAR/EDITAR */}
      {/* ========================================== */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setMostrarModal(false)}>
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">
                  {editando ? 'Editar Promo' : 'Nueva Promo'}
                </h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                {/* Año */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                    Año de egreso *
                  </label>
                  <input
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
                    disabled={!!editando}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-xl text-sm ${
                      editando ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    min={1966}
                    max={2100}
                  />
                  {!editando && añosUsados.includes(formData.graduation_year) && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Ya existe una promo para este año</p>
                  )}
                </div>

                {/* Frase */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                    Frase de la promo
                  </label>
                  <input
                    type="text"
                    value={formData.phrase}
                    onChange={(e) => setFormData({ ...formData, phrase: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    placeholder='Ej: Promo "Unidos por siempre"'
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                    Cantidad de egresados
                  </label>
                  <input
                    type="number"
                    value={formData.total_students}
                    onChange={(e) => setFormData({ ...formData, total_students: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    min={0}
                  />
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                    Foto grupal
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSeleccionarFoto}
                    />
                    {previewFoto ? (
                      <div className="relative h-40 rounded-lg overflow-hidden">
                        <Image src={previewFoto} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Click para subir foto</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 md:gap-3 pt-2">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando || (!editando && añosUsados.includes(formData.graduation_year))}
                    className="flex-1 py-2.5 md:py-3 bg-amber-500 text-white rounded-2xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {guardando ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editando ? 'Actualizar' : 'Crear Promo'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL ELIMINAR */}
      {/* ========================================== */}
      <AnimatePresence>
        {eliminando && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setEliminando(null)}>
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 md:h-8 md:w-8 text-red-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">¿Eliminar promo?</h3>
              <p className="text-sm text-gray-500 mb-4">Esta acción no se puede deshacer.</p>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => setEliminando(null)}
                  className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEliminar(eliminando)}
                  className="flex-1 py-2.5 md:py-3 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL ZOOM FOTO */}
      {/* ========================================== */}
      <AnimatePresence>
        {zoomPromo && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setZoomPromo(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Botón cerrar */}
              <button 
                onClick={() => setZoomPromo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Info del año */}
              <div className="absolute top-4 left-4 z-10">
                <p className="text-white font-bold text-xl font-poppins">{zoomPromo.graduation_year}</p>
                {zoomPromo.phrase && (
                  <p className="text-white/70 text-sm italic">"{zoomPromo.phrase}"</p>
                )}
              </div>

              {/* Imagen - object-contain para que se vea completa */}
              {zoomPromo.photo_url ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img 
                    src={zoomPromo.photo_url} 
                    alt={`Promo ${zoomPromo.graduation_year}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center text-white/50">
                  <ImageIcon className="h-24 w-24 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Foto no disponible</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}