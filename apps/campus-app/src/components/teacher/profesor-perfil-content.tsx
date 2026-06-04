'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, User, Camera, Mail, Phone, MapPin, 
  BookOpen, Save, Loader2, Key, Eye, EyeOff,
  CheckCircle2, Briefcase, FileText
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Props = {
  user: any
  profile: any
  teacher: any
}

export function ProfesorPerfilContent({ user, profile, teacher }: Props) {
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [archivoAvatar, setArchivoAvatar] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Datos del perfil
  const [perfil, setPerfil] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    dni: profile?.dni || '',
  })

  // Datos del profesor
  const [datosProfesor, setDatosProfesor] = useState({
    speciality: teacher?.speciality || '',
    bio: teacher?.bio || '',
  })

  // Cambio de contraseña
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cambiandoPassword, setCambiandoPassword] = useState(false)

  // ==========================================
  // GUARDAR PERFIL
  // ==========================================
  const handleGuardarPerfil = async () => {
    setGuardando(true)
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: perfil.full_name,
        phone: perfil.phone || null,
        dni: perfil.dni || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    const { error: teacherError } = await supabase
      .from('teachers')
      .update({
        speciality: datosProfesor.speciality,
        bio: datosProfesor.bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', user.id)

    if (!profileError && !teacherError) {
      setMensajeExito('✅ Perfil actualizado correctamente')
      setTimeout(() => setMensajeExito(''), 3000)
    }

    setGuardando(false)
  }

  // ==========================================
  // SUBIR AVATAR
  // ==========================================
  const handleSeleccionarAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewAvatar(e.target?.result as string)
      setMostrarPreview(true)
    }
    reader.readAsDataURL(file)
    setArchivoAvatar(file)
  }

  const handleGuardarAvatar = async () => {
    if (!archivoAvatar) return

    const fileExt = archivoAvatar.name.split('.').pop()
    const nombreSeguro = archivoAvatar.name
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)

    const fileName = `profesores/${user.id}/${Date.now()}_${nombreSeguro}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, archivoAvatar, { upsert: true })

    if (uploadError) {
      alert('Error al subir imagen')
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    setAvatarUrl(publicUrl)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

    setMostrarPreview(false)
    setPreviewAvatar(null)
    setArchivoAvatar(null)
    setMensajeExito('📸 Foto actualizada')
    setTimeout(() => setMensajeExito(''), 3000)
  }

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================
  const handleCambiarPassword = async () => {
    if (nuevaPassword !== confirmarPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    if (nuevaPassword.length < 6) {
      alert('Mínimo 6 caracteres')
      return
    }

    setCambiandoPassword(true)
    const { error } = await supabase.auth.updateUser({ password: nuevaPassword })

    if (!error) {
      setMensajeExito('🔒 Contraseña actualizada')
      setMostrarCambioPassword(false)
      setNuevaPassword('')
      setConfirmarPassword('')
      setTimeout(() => setMensajeExito(''), 3000)
    } else {
      alert('Error: ' + error.message)
    }
    setCambiandoPassword(false)
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
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
          <div className="flex items-center gap-3">
            <Link href="/panel" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mi Perfil</h1>
              <p className="text-sm text-gray-500">Gestioná tu información</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Avatar y nombre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 text-center"
        >
          <div className="relative inline-block group">
            {avatarUrl || previewAvatar ? (
              <img 
                src={previewAvatar || avatarUrl} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-pink-100 group-hover:brightness-75 transition-all"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-pink-100 group-hover:brightness-75 transition-all">
                {(perfil.full_name || 'P').charAt(0)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-lg border-2 border-gray-100 hover:bg-gray-50 hover:scale-110 transition-all z-10"
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSeleccionarAvatar}
            />
          </div>
          <h2 className="text-xl font-bold mt-4">{perfil.full_name || 'Profesor'}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
            Profesor
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos personales */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-pink-500" />
              Datos Personales
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={perfil.full_name}
                  onChange={(e) => setPerfil({ ...perfil, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" /> Teléfono
                </label>
                <input
                  type="tel"
                  value={perfil.phone}
                  onChange={(e) => setPerfil({ ...perfil, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input
                  type="text"
                  value={perfil.dni}
                  onChange={(e) => setPerfil({ ...perfil, dni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Datos profesionales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-pink-500" />
              Datos Profesionales
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-gray-400" /> Especialidad
                </label>
                <input
                  type="text"
                  value={datosProfesor.speciality}
                  onChange={(e) => setDatosProfesor({ ...datosProfesor, speciality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ej: Matemática, Física"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-gray-400" /> Biografía
                </label>
                <textarea
                  value={datosProfesor.bio}
                  onChange={(e) => setDatosProfesor({ ...datosProfesor, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Contanos sobre tu experiencia y formación..."
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Seguridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6"
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-pink-500" />
            Seguridad
          </h3>

          {mostrarCambioPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500"
                  placeholder="Repetir contraseña"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarCambioPassword(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCambiarPassword}
                  disabled={cambiandoPassword}
                  className="flex-1 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cambiandoPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Cambiar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setMostrarCambioPassword(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Key className="h-4 w-4" />
              Cambiar contraseña
            </button>
          )}
        </motion.div>

        {/* Botón guardar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <button
            onClick={handleGuardarPerfil}
            disabled={guardando}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-medium hover:from-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
          >
            {guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Guardar cambios
          </button>
        </motion.div>
      </div>

      {/* Modal preview avatar */}
      <AnimatePresence>
        {mostrarPreview && previewAvatar && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <h3 className="text-xl font-bold mb-4">Previsualización</h3>
              <img src={previewAvatar} alt="Preview" className="w-40 h-40 rounded-full object-cover border-4 border-pink-200 mx-auto mb-6" />
              <div className="flex gap-3">
                <button onClick={() => { setMostrarPreview(false); setArchivoAvatar(null) }} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-medium hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={handleGuardarAvatar} className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-medium">
                  Guardar foto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}