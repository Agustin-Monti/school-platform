'use client'

import { motion } from 'framer-motion'
import { 
  Users, BookOpen, GraduationCap, BookMarked,
  LogOut, Bell, Plus, TrendingUp, School, Clock, 
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Props = {
  user: any
  profile: any
  stats: {
    totalAlumnos: number
    totalProfesores: number
    totalCursos: number
    totalMaterias: number
  }
  cursos: any[]
}

export function AdminDashboard({ user, profile, stats, cursos }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { icon: BookOpen, label: 'Cursos', href: '/admin/cursos', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', desc: 'Gestionar cursos' },
    { icon: Users, label: 'Usuarios', href: '/admin/usuarios', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', desc: 'Alumnos y profesores' },
    { icon: TrendingUp, label: 'Reportes', href: '/admin/reportes', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600', desc: 'Estadísticas' },
    { icon: Clock, label: 'Horarios', href: '/admin/horarios', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', desc: 'Configurar horarios' },
    { icon: GraduationCap, label: 'Egresados', href: '/admin/egresados', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', desc: 'Gestionar promos' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-500">
                  ¡Bienvenido, {profile?.full_name || 'Admin'}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-700 font-medium">
                Admin
              </span>
              <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-xl transition-colors group">
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Alumnos', value: stats.totalAlumnos, icon: Users, color: 'from-blue-500 to-blue-600' },
            { label: 'Profesores', value: stats.totalProfesores, icon: GraduationCap, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Cursos', value: stats.totalCursos, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} w-fit shadow-lg mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col items-center gap-3 group"
                >
                  <div className={`p-4 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-8 w-8 ${item.text}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cursos */}
        {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Todos los Cursos</h2>
            <Link
              href="/admin/cursos/nuevo"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Nuevo Curso
            </Link>
          </div>

          {cursos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay cursos creados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cursos.map((curso: any, index: number) => (
                <motion.div
                  key={curso.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: curso.color || '#6366F1' }}
                    />
                    <h3 className="font-semibold">{curso.name}</h3>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <p>📚 {curso.year}° Año - División {curso.division}</p>
                    <p>📍 {curso.classroom}</p>
                    <p>
                      👨‍🏫 {curso.teachers?.profiles?.full_name || 'Sin profesor'}
                    </p>
                  </div>
                  <Link
                    href={`/admin/cursos/${curso.id}/editar`}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Editar curso →
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div> */}
      </main>
    </div>
  )
}