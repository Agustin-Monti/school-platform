'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Users, Search,
  GraduationCap, User, Shield, X, Save, Loader2,
  CheckCircle2, BookOpen, Briefcase, Copy
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ==========================================
// TIPOS
// ==========================================
type Usuario = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  phone: string | null
  dni: string | null
  avatar_url: string | null
  student_code: string | null
  birth_date: string | null
  speciality: string | null
  created_at: string
}

type Props = {
  usuarios: Usuario[]
  paginaActual: number
  totalPaginas: number
  totalUsuarios: number
  busquedaInicial: string
  rolInicial: string
}

// ==========================================
// COMPONENTE
// ==========================================
export function UsuariosContent({ 
  usuarios, paginaActual, totalPaginas, totalUsuarios, busquedaInicial, rolInicial 
}: Props) {
  const [busqueda, setBusqueda] = useState(busquedaInicial)
  const [filtroRol, setFiltroRol] = useState(rolInicial)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [activando, setActivando] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({ role: '', student_code: '', speciality: '' })

  // ==========================================
  // PAGINACIÓN
  // ==========================================
  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams()
    if (nuevaPagina > 1) params.set('pagina', String(nuevaPagina))
    if (busqueda) params.set('busqueda', busqueda)
    if (filtroRol !== 'todos') params.set('rol', filtroRol)
    router.push(`/admin/usuarios${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleBusqueda = (valor: string) => {
    setBusqueda(valor)
    const params = new URLSearchParams()
    if (valor) params.set('busqueda', valor)
    if (filtroRol !== 'todos') params.set('rol', filtroRol)
    setTimeout(() => {
      router.push(`/admin/usuarios${params.toString() ? '?' + params.toString() : ''}`)
    }, 500)
  }

  const handleFiltroRol = (rol: string) => {
    setFiltroRol(rol)
    const params = new URLSearchParams()
    if (busqueda) params.set('busqueda', busqueda)
    if (rol !== 'todos') params.set('rol', rol)
    router.push(`/admin/usuarios${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleCopiarLegajo = (legajo: string) => {
    navigator.clipboard.writeText(legajo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  // ==========================================
  // GESTIÓN DE USUARIOS
  // ==========================================
  const abrirEditar = (usuario: Usuario) => {
    setEditando(usuario)
    setFormData({
      role: usuario.role,
      student_code: usuario.student_code || '',
      speciality: usuario.speciality || '',
    })
    setMostrarModal(true)
  }

  const handleGuardar = async () => {
    if (!editando) return
    setGuardando(true)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: formData.role })
      .eq('id', editando.id)

    if (profileError) { alert('Error: ' + profileError.message); setGuardando(false); return }

    if (formData.role === 'STUDENT') {
      const { data: existing } = await supabase.from('students').select('id').eq('profile_id', editando.id).maybeSingle()
      if (existing) {
        await supabase.from('students').update({ student_code: formData.student_code || null }).eq('profile_id', editando.id)
      } else {
        const legajo = formData.student_code || await generarLegajo()
        await supabase.from('students').insert({ profile_id: editando.id, student_code: legajo })
      }
    }

    if (formData.role === 'TEACHER') {
      const { data: existing } = await supabase.from('teachers').select('id').eq('profile_id', editando.id).maybeSingle()
      if (existing) {
        await supabase.from('teachers').update({ speciality: formData.speciality || null }).eq('profile_id', editando.id)
      } else {
        await supabase.from('teachers').insert({ profile_id: editando.id, speciality: formData.speciality || null })
      }
    }

    setMensajeExito('✅ Usuario actualizado')
    setTimeout(() => { setMensajeExito(''); setMostrarModal(false); setEditando(null); router.refresh() }, 1500)
    setGuardando(false)
  }

  const generarLegajo = async () => {
    const año = new Date().getFullYear()
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true }).like('student_code', `EST-${año}-%`)
    return `EST-${año}-${String((count || 0) + 1).padStart(3, '0')}`
  }

  const handleGenerarLegajo = async () => {
    setFormData({ ...formData, student_code: await generarLegajo() })
  }

  // ==========================================
  // ACTIVAR / RECHAZAR
  // ==========================================
  const handleActivar = async (userId: string) => {
    setActivando(userId)
    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId)
    if (!error) { setMensajeExito('✅ Usuario activado'); setTimeout(() => { setMensajeExito(''); setActivando(null); router.refresh() }, 1500) }
    else { alert('Error: ' + error.message); setActivando(null) }
  }

  const handleRechazar = async (userId: string) => {
    if (!confirm('¿Rechazar este usuario? No podrá iniciar sesión.')) return
    setActivando(userId)
    const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('id', userId)
    if (!error) { setMensajeExito('❌ Usuario rechazado'); setTimeout(() => { setMensajeExito(''); setActivando(null); router.refresh() }, 1500) }
    else { alert('Error: ' + error.message); setActivando(null) }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================
  const getRolBadge = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'bg-blue-100 text-blue-700'
      case 'TEACHER': return 'bg-emerald-100 text-emerald-700'
      case 'ADMIN': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'active': return '✅ Activo'
      case 'rejected': return '❌ Rechazado'
      default: return '⏳ Pendiente'
    }
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Mensaje éxito */}
      <AnimatePresence>
        {mensajeExito && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />{mensajeExito}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/admin" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </Link>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Users className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">Usuarios</h1>
              <p className="text-xs md:text-sm text-gray-500">{totalUsuarios} registrados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <input
              type="text" placeholder="Buscar por nombre o email..."
              defaultValue={busquedaInicial}
              onChange={(e) => handleBusqueda(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto">
            {['todos', 'STUDENT', 'TEACHER', 'ADMIN'].map(rol => (
              <button key={rol} onClick={() => handleFiltroRol(rol)}
                className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                  filtroRol === rol ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}>
                {rol === 'todos' ? 'Todos' : rol === 'STUDENT' ? '🎓 Estudiantes' : rol === 'TEACHER' ? '👨‍🏫 Profesores' : '🛡️ Admins'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-2 md:space-y-3">
          {usuarios.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            usuarios.map((usuario, index) => (
              <motion.div key={usuario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all">
                
                {/* Info */}
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0">
                    {usuario.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{usuario.full_name || 'Sin nombre'}</h3>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{usuario.email}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${getRolBadge(usuario.role)}`}>
                        {usuario.role === 'STUDENT' ? 'Estudiante' : usuario.role === 'TEACHER' ? 'Profesor' : 'Admin'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${getStatusBadge(usuario.status)}`}>
                        {getStatusTexto(usuario.status)}
                      </span>
                      {usuario.student_code && <span className="text-[10px] md:text-xs text-gray-400">📝 {usuario.student_code}</span>}
                      {usuario.speciality && <span className="text-[10px] md:text-xs text-gray-400">📚 {usuario.speciality}</span>}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {usuario.status !== 'active' && (
                    <button onClick={() => handleActivar(usuario.id)} disabled={activando === usuario.id}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50">
                      {activando === usuario.id ? '...' : 'Aprobar'}
                    </button>
                  )}
                  {usuario.status === 'pending' && (
                    <button onClick={() => handleRechazar(usuario.id)} disabled={activando === usuario.id}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50">
                      Rechazar
                    </button>
                  )}
                  <button onClick={() => abrirEditar(usuario)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                    Editar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}
              className="px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              ← Anterior
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 2)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-gray-400">...</span>}
                    <button onClick={() => cambiarPagina(p)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
                        p === paginaActual ? 'bg-red-600 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>{p}</button>
                  </span>
                ))
              }
            </div>

            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}
              className="px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Siguiente →
            </button>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-3">
          Página {paginaActual} de {totalPaginas || 1} • {totalUsuarios} usuarios
        </div>
      </div>

      {/* Modal Editar */}
      <AnimatePresence>
        {mostrarModal && editando && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setMostrarModal(false)}>
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold font-poppins">Gestionar Usuario</h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Columna 1: Datos del usuario */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {editando.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-base">{editando.full_name || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{editando.email || 'Sin email'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-400 font-poppins">DNI</p>
                      <p className="text-sm font-medium">{editando.dni || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-poppins">Teléfono</p>
                      <p className="text-sm font-medium">{editando.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-poppins">Legajo</p>
                      <p className="text-sm font-medium">{editando.student_code || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-poppins">Especialidad</p>
                      <p className="text-sm font-medium">{editando.speciality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-poppins">Estado</p>
                      <span className={`inline-block mt-0.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        editando.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        editando.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {editando.status === 'active' ? '✅ Activo' : 
                        editando.status === 'rejected' ? '❌ Rechazado' : '⏳ Pendiente'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-poppins">Rol actual</p>
                      <span className={`inline-block mt-0.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        editando.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' :
                        editando.role === 'TEACHER' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {editando.role === 'STUDENT' ? '🎓 Estudiante' : 
                        editando.role === 'TEACHER' ? '👨‍🏫 Profesor' : '🛡️ Admin'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-poppins">Fecha de registro</p>
                    <p className="text-sm font-medium">
                      {new Date(editando.created_at).toLocaleDateString('es-AR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(editando.created_at).toLocaleTimeString('es-AR', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Columna 2: Edición */}
                <div className="space-y-4">
                  <p className="font-semibold text-sm font-poppins text-gray-700">Cambiar configuración</p>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 font-poppins">Rol</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'STUDENT', label: '🎓 Estudiante' },
                        { value: 'TEACHER', label: '👨‍🏫 Profesor' },
                        { value: 'ADMIN', label: '🛡️ Admin' },
                      ].map(rol => (
                        <button key={rol.value} onClick={() => setFormData({ ...formData, role: rol.value })}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                            formData.role === rol.value ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>{rol.label}</button>
                      ))}
                    </div>
                  </div>

                  {formData.role === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 font-poppins">
                        <BookOpen className="h-3.5 w-3.5 inline mr-1" />Legajo
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={formData.student_code} 
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed" 
                          placeholder="Se genera automáticamente" 
                        />
                        <button
                          onClick={() => handleCopiarLegajo(formData.student_code)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium text-gray-600"
                          title="Copiar legajo"
                        >
                          {copiado ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">El legajo no se puede editar</p>
                    </div>
                  )}

                  {formData.role === 'TEACHER' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 font-poppins">
                        <Briefcase className="h-3.5 w-3.5 inline mr-1" />Especialidad
                      </label>
                      <input 
                        type="text" 
                        value={formData.speciality} 
                        onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" 
                        placeholder="Ej: Matemática, Lengua..." 
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setMostrarModal(false)} 
                      className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleGuardar} disabled={guardando}
                      className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                      {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}