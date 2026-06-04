'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Camera, Mail, Phone, MapPin, 
  Calendar, BookOpen, Save, Loader2, Key,
  Eye, EyeOff, CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [archivoAvatar, setArchivoAvatar] = useState<File | null>(null)
  const supabase = createClient()

  const [perfil, setPerfil] = useState({ full_name: '', email: '', phone: '', dni: '', role: '' })
  const [estudiante, setEstudiante] = useState({ student_code: '', birth_date: '', address: '', health_info: '' })
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cambiandoPassword, setCambiandoPassword] = useState(false)

  useEffect(() => { cargarPerfil() }, [])

  const cargarPerfil = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profileData) {
      setPerfil({ full_name: profileData.full_name || '', email: user.email || '', phone: profileData.phone || '', dni: profileData.dni || '', role: profileData.role || '' })
      setAvatarUrl(profileData.avatar_url)
    }
    if (profileData?.role === 'STUDENT') {
      const { data: studentData } = await supabase.from('students').select('id, student_code, birth_date, address, health_info').eq('profile_id', user.id).maybeSingle()
      if (studentData) setEstudiante({ student_code: studentData.student_code || '', birth_date: studentData.birth_date || '', address: studentData.address || '', health_info: studentData.health_info || '' })
    }
    setLoading(false)
  }

  const handleGuardarPerfil = async () => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: perfil.full_name, phone: perfil.phone || null, dni: perfil.dni || null, updated_at: new Date().toISOString() }).eq('id', user.id)
    await supabase.from('students').update({ birth_date: estudiante.birth_date || null, address: estudiante.address || null, health_info: estudiante.health_info || null, updated_at: new Date().toISOString() }).eq('profile_id', user.id)
    setMensajeExito('✅ Perfil actualizado')
    setTimeout(() => setMensajeExito(''), 3000)
    setGuardando(false)
  }

  const handleSeleccionarAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Solo imágenes'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Máximo 2MB'); return }
    const reader = new FileReader()
    reader.onload = (e) => { setPreviewAvatar(e.target?.result as string); setMostrarPreview(true) }
    reader.readAsDataURL(file)
    setArchivoAvatar(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGuardarAvatar = async () => {
    if (!archivoAvatar) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setGuardando(true)
    const fileExt = archivoAvatar.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, archivoAvatar, { upsert: true, contentType: archivoAvatar.type })
    if (uploadError) { alert('Error al subir imagen'); setGuardando(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    setAvatarUrl(publicUrl)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setGuardando(false); setMostrarPreview(false); setPreviewAvatar(null); setArchivoAvatar(null)
    setMensajeExito('📸 Foto actualizada'); setTimeout(() => setMensajeExito(''), 3000)
  }

  const handleCambiarPassword = async () => {
    if (nuevaPassword !== confirmarPassword) { alert('No coinciden'); return }
    if (nuevaPassword.length < 6) { alert('Mínimo 6 caracteres'); return }
    setCambiandoPassword(true)
    const { error } = await supabase.auth.updateUser({ password: nuevaPassword })
    if (!error) { setMensajeExito('🔒 Contraseña actualizada'); setMostrarCambioPassword(false); setNuevaPassword(''); setConfirmarPassword(''); setTimeout(() => setMensajeExito(''), 3000) }
    else alert('Error: ' + error.message)
    setCambiandoPassword(false)
  }

  const getIniciales = (nombre: string) => nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-pink-600" /></div>

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* Mensaje éxito */}
      {mensajeExito && (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />{mensajeExito}
        </motion.div>
      )}

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-4 md:mb-6 text-center">
        <div className="relative inline-block group">
          {avatarUrl || previewAvatar ? (
            <div className="relative">
              <img src={previewAvatar || avatarUrl || ''} alt="Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-pink-100 group-hover:brightness-75 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-lg" /></div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-pink-100 group-hover:brightness-75 transition-all">{getIniciales(perfil.full_name)}</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-lg" /></div>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1.5 md:p-2 bg-white rounded-full shadow-lg border-2 border-gray-100 hover:bg-gray-50 transition-all z-10"><Camera className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600" /></button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSeleccionarAvatar} />
        </div>
        <h2 className="text-lg md:text-xl font-bold mt-3">{perfil.full_name}</h2>
        <p className="text-xs md:text-sm text-gray-500">{perfil.email}</p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-pink-100 text-pink-700">Estudiante</span>
      </motion.div>

      {/* Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {[
          { title: 'Datos Personales', icon: User, fields: [
            { label: 'Nombre completo', value: perfil.full_name, set: (v: string) => setPerfil({...perfil, full_name: v}), type: 'text' },
            { label: 'Email', value: perfil.email, disabled: true, icon: Mail },
            { label: 'Teléfono', value: perfil.phone, set: (v: string) => setPerfil({...perfil, phone: v}), type: 'tel', placeholder: '+54 11 1234-5678', icon: Phone },
            { label: 'DNI', value: perfil.dni, set: (v: string) => setPerfil({...perfil, dni: v}), type: 'text' },
          ]},
          { title: 'Datos Académicos', icon: BookOpen, fields: [
            { label: 'Legajo', value: estudiante.student_code, disabled: true },
            { label: 'Fecha de nacimiento', value: estudiante.birth_date, set: (v: string) => setEstudiante({...estudiante, birth_date: v}), type: 'date', icon: Calendar },
            { label: 'Dirección', value: estudiante.address, set: (v: string) => setEstudiante({...estudiante, address: v}), type: 'text', placeholder: 'Calle, número, ciudad', icon: MapPin },
            { label: 'Info de salud', value: estudiante.health_info, set: (v: string) => setEstudiante({...estudiante, health_info: v}), type: 'textarea', placeholder: 'Alergias, medicamentos...' },
          ]},
        ].map((section, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-sm md:text-lg mb-3 md:mb-4 flex items-center gap-2"><section.icon className="h-4 w-4 md:h-5 md:w-5 text-pink-500" />{section.title}</h3>
            <div className="space-y-3 md:space-y-4">
              {section.fields.map((field, j) => (
                <div key={j}>
                  <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={field.value} onChange={e => field.set?.(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-pink-500 resize-none" rows={2} placeholder={field.placeholder} />
                  ) : (
                    <input type={field.type || 'text'} value={field.value} onChange={e => field.set?.(e.target.value)}
                      disabled={field.disabled} placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-pink-500 ${field.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Seguridad */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mt-4 md:mt-6">
        <h3 className="font-semibold text-sm md:text-lg mb-3 md:mb-4">Seguridad</h3>
        {mostrarCambioPassword ? (
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input type={mostrarPassword ? 'text' : 'password'} value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl text-xs md:text-sm" placeholder="Mínimo 6 caracteres" />
                <button onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-3 top-2.5 text-gray-400">{mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Confirmar</label>
              <input type="password" value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs md:text-sm" placeholder="Repetir contraseña" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMostrarCambioPassword(false)} className="flex-1 py-2 border border-gray-300 rounded-xl text-xs md:text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={handleCambiarPassword} disabled={cambiandoPassword}
                className="flex-1 py-2 bg-pink-600 text-white rounded-xl text-xs md:text-sm font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {cambiandoPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}Cambiar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setMostrarCambioPassword(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-xl text-xs md:text-sm font-medium hover:bg-gray-50"><Key className="h-3.5 w-3.5 md:h-4 md:w-4" />Cambiar contraseña</button>
        )}
      </motion.div>

      {/* Guardar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 md:mt-6">
        <button onClick={handleGuardarPerfil} disabled={guardando}
          className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl md:rounded-2xl text-sm md:text-base font-medium hover:from-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
          {guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}Guardar cambios
        </button>
      </motion.div>

      {/* Modal preview avatar */}
      {mostrarPreview && previewAvatar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg md:text-xl font-bold text-center mb-2">Previsualización</h3>
            <p className="text-xs md:text-sm text-gray-500 text-center mb-4 md:mb-6">Así se verá tu foto de perfil</p>
            <div className="flex justify-center mb-4 md:mb-6">
              <img src={previewAvatar} alt="Preview" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-pink-200 shadow-xl" />
            </div>
            <div className="flex justify-center gap-3 mb-4 md:mb-6">
              {[12, 16, 20].map((size, i) => (
                <div key={i} className="text-center">
                  <img src={previewAvatar} alt="" className={`w-${size/4} h-${size/4} md:w-${size/2} md:h-${size/2} rounded-full object-cover border-2 border-gray-200 mx-auto`} style={{width: size*3, height: size*3}} />
                  <p className="text-[9px] md:text-[10px] text-gray-400 mt-1">{['Mini','Med','Grande'][i]}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 text-xs md:text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Archivo:</span><span className="font-medium truncate ml-2">{archivoAvatar?.name}</span></div>
              <div className="flex justify-between mt-1"><span className="text-gray-600">Tamaño:</span><span className="font-medium">{archivoAvatar ? (archivoAvatar.size / 1024).toFixed(1) + ' KB' : ''}</span></div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button onClick={() => { setMostrarPreview(false); setPreviewAvatar(null); setArchivoAvatar(null) }} className="flex-1 py-2.5 md:py-3 border-2 border-gray-200 rounded-2xl font-medium text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleGuardarAvatar} disabled={guardando}
                className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-medium text-sm hover:from-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar foto
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}