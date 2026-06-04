'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Users, ClipboardCheck, TrendingUp, 
  LogOut, Bell, FileText,
  GraduationCap, Settings, CheckCheck
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

type Notificacion = {
  id: string; title: string; message: string; type: string; is_read: boolean; created_at: string
}

type Props = {
  user: any
  profile: any
  stats: {
    totalCursos: number; totalAlumnos: number; tareasPendientesCalificar: number; promedioGeneral: number
  }
  cursos: any[]
  notificacionesIniciales: Notificacion[]
}

export function TeacherDashboard({ user, profile, stats, cursos, notificacionesIniciales }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(notificacionesIniciales)
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setMostrarNotificaciones(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const cargarNotificaciones = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      if (data) setNotificaciones(data)
    }
  }

  const limpiarNotificaciones = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.rpc('delete_old_notifications')
      await supabase.from('notifications').delete().eq('user_id', user.id).eq('is_read', true)
      cargarNotificaciones()
    }
  }

  const marcarComoLeida = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const marcarTodasLeidas = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
      setNotificaciones(prev => prev.map(n => ({ ...n, is_read: true })))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const noLeidas = notificaciones.filter(n => !n.is_read).length

  const getIconoNotificacion = (type: string) => {
    switch (type) {
      case 'submission': return '📝'
      case 'grade': return '⭐'
      case 'attendance': return '📋'
      case 'announcement': return '📢'
      default: return '🔔'
    }
  }

  const getTiempoRelativo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)
    if (mins < 60) return `Hace ${mins} min`
    if (hrs < 24) return `Hace ${hrs} h`
    if (dias < 7) return `Hace ${dias} d`
    return new Date(fecha).toLocaleDateString('es-AR')
  }

  const menuItems = [
    { icon: BookOpen, label: 'Mis Cursos', href: '/panel/mis-cursos', bg: 'bg-blue-50', text: 'text-blue-600' },
    { icon: Settings, label: 'Perfil', href: '/panel/perfil', bg: 'bg-pink-50', text: 'text-pink-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header - overflow-visible para que el dropdown no se corte */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Panel del Profesor</h1>
                <p className="text-xs md:text-sm text-gray-500">¡Bienvenido, {profile?.full_name || 'Profesor'}!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 overflow-visible">
              {/* Notificaciones con dropdown - overflow-visible */}
              <div className="relative overflow-visible" ref={notifRef}>
                <button onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors relative">
                  <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  {noLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 md:h-5 md:w-5 bg-red-500 text-white text-[9px] md:text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                      {noLeidas}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {mostrarNotificaciones && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed inset-x-4 top-[60px] md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 w-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Notificaciones</h3>
                        <div className="flex items-center gap-2">
                          {noLeidas > 0 && (
                            <button onClick={marcarTodasLeidas} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              <CheckCheck className="h-3 w-3" /> Leer todas
                            </button>
                          )}
                          {notificaciones.length > 0 && (
                            <button onClick={limpiarNotificaciones} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                              🗑️ Limpiar
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {notificaciones.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Sin notificaciones</p>
                          </div>
                        ) : (
                          notificaciones.map(notif => (
                            <div key={notif.id} onClick={() => marcarComoLeida(notif.id)}
                              className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}>
                              <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">{getIconoNotificacion(notif.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-sm ${!notif.is_read ? 'font-semibold' : ''}`}>{notif.title}</p>
                                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{getTiempoRelativo(notif.created_at)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l">
                <span className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium">Profesor</span>
                <button onClick={handleLogout} className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors group">
                  <LogOut className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6 mb-4 md:mb-8">
          {[
            { label: 'Mis Cursos', value: stats.totalCursos, icon: BookOpen, color: 'from-blue-500 to-blue-600', change: 'activos' },
            { label: 'Alumnos', value: stats.totalAlumnos, icon: Users, color: 'from-emerald-500 to-emerald-600', change: 'únicos' },
            { label: 'Por Calificar', value: stats.tareasPendientesCalificar, icon: ClipboardCheck, color: 'from-orange-500 to-orange-600', change: stats.tareasPendientesCalificar > 0 ? 'pend.' : 'al día' },
            { label: 'Promedio', value: stats.promedioGeneral > 0 ? stats.promedioGeneral.toFixed(1) : '--', icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: 'gral.' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -3 }}
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <span className="text-[10px] md:text-xs text-gray-400 bg-gray-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-lg md:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="mb-4 md:mb-8">
          <h2 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-2 md:gap-4 max-w-md">
            {menuItems.map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Link href={item.href} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col items-center gap-2 md:gap-4 group">
                  <div className={`p-2 md:p-4 rounded-lg md:rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-5 w-5 md:h-8 md:w-8 ${item.text}`} />
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mis Cursos */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-sm md:text-lg font-semibold text-gray-900">Mis Cursos</h2>
            <Link href="/panel/mis-cursos" className="text-xs md:text-sm text-indigo-600 hover:underline">Ver todos →</Link>
          </div>
          {cursos.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-gray-400">
              <BookOpen className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-50" />
              <p className="text-sm">No tenés cursos asignados todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {cursos.map((curso: any, index: number) => (
                <motion.div key={curso.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -3 }}
                  className="p-3 md:p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm" style={{ backgroundColor: curso.color || '#6366F1' }} />
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">{curso.name}</h3>
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 space-y-0.5 md:space-y-1 mb-3 md:mb-4">
                    <p>📚 {curso.year}° Año - División {curso.division}</p>
                    <p>📍 {curso.classroom}</p>
                    <p>📖 {curso.subjects?.length || 0} materias</p>
                  </div>
                  <Link href={`/panel/mis-cursos/${curso.id}`} className="inline-flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    Gestionar curso →
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}