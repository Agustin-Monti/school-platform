'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Bell, CheckCheck, Menu, X, Home, BookOpen, TrendingUp, CheckSquare, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Notificacion = {
  id: string; title: string; message: string; type: string; is_read: boolean; created_at: string
}

const menuItems = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: BookOpen, label: 'Horarios', href: '/dashboard/horarios' },
  { icon: TrendingUp, label: 'Temas', href: '/dashboard/materias' },
  { icon: CheckSquare, label: 'Tareas', href: '/dashboard/tareas' },
  { icon: Calendar, label: 'Asistencia', href: '/dashboard/asistencia' },
  { icon: User, label: 'Perfil', href: '/dashboard/perfil' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    cargarPerfil()
    cargarNotificaciones()
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setMostrarNotificaciones(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
  }

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

  const noLeidas = notificaciones.filter(n => !n.is_read).length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getIconoNotificacion = (type: string) => {
    switch (type) {
      case 'assignment': return '📝'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo y menú hamburguesa */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Menú hamburguesa móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-bold text-sm md:text-lg">EM</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Campus Virtual</h1>
                  <p className="text-xs md:text-sm text-gray-500">¡Bienvenido, {profile?.full_name || 'Estudiante'}!</p>
                </div>
              </Link>

              {/* Navegación desktop */}
              <nav className="hidden lg:flex items-center gap-1 ml-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Notificaciones */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {noLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
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
                      className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
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
              
              {/* Perfil y logout */}
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-xs md:text-sm font-medium text-gray-900 leading-tight">{profile?.full_name || 'Estudiante'}</p>
                  <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-medium">Estudiante</span>
                </div>
                <button onClick={handleLogout} className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors group" title="Cerrar sesión">
                  <LogOut className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Menú móvil */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <nav className="pt-3 pb-1 space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}