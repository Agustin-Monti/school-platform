'use client'

import { motion } from 'framer-motion'
import { BookOpen, Calendar, CheckSquare, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'

// ==========================================
// TIPOS
// ==========================================
type Profile = {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  email?: string
}

type StatsData = {
  promedio: number
  asistencia: number
  tareasPendientes: number
}

type ProximaClase = {
  id: string
  start_time: string
  end_time: string
  day_of_week: number
  courses: {
    name: string
    color: string
    classroom: string
  }
}

type Props = {
  user: any
  profile: Profile | null
  statsData: StatsData
  proximasClases: ProximaClase[]
  diaMostrado?: number
  esFinde?: boolean
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// ==========================================
// MENÚ ITEMS
// ==========================================
const menuItems = [
  { icon: BookOpen, label: 'Horarios', href: '/dashboard/horarios', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { icon: TrendingUp, label: 'Temas', href: '/dashboard/materias', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { icon: CheckSquare, label: 'Tareas', href: '/dashboard/tareas', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  { icon: Calendar, label: 'Asistencia', href: '/dashboard/asistencia', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { icon: User, label: 'Perfil', href: '/dashboard/perfil', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
]

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function DashboardContent({ user, profile, statsData, proximasClases, diaMostrado, esFinde }: Props) {
  const stats = [
    { label: 'Promedio', value: statsData.promedio > 0 ? statsData.promedio.toFixed(1) : '--', icon: TrendingUp, color: 'from-blue-500 to-blue-600', change: statsData.promedio >= 7 ? '👍' : statsData.promedio > 0 ? '📚' : '--' },
    { label: 'Asistencia', value: statsData.asistencia > 0 ? `${statsData.asistencia}%` : '--', icon: Calendar, color: 'from-emerald-500 to-emerald-600', change: statsData.asistencia >= 75 ? '✅' : statsData.asistencia > 0 ? '⚠️' : '--' },
    { label: 'Pendientes', value: statsData.tareasPendientes.toString(), icon: CheckSquare, color: 'from-orange-500 to-orange-600', change: statsData.tareasPendientes === 0 ? '✅' : statsData.tareasPendientes <= 3 ? '📝' : '⚠️' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-8">
      {/* ========================================== */}
      {/* STATS CARDS */}
      {/* ========================================== */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-4 md:mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-xl md:rounded-2xl bg-white p-3 md:p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-medium text-gray-500 bg-gray-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">{stat.change}</span>
            </div>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-lg md:text-3xl font-bold text-gray-900 mt-0.5 md:mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ========================================== */}
      {/* MENÚ DE ACCESOS RÁPIDOS */}
      {/* ========================================== */}
      <div className="mb-4 md:mb-8">
        <h2 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 md:gap-4">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.href}
                className="relative overflow-hidden rounded-xl md:rounded-2xl bg-white p-3 md:p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col items-center gap-2 md:gap-4 group"
              >
                <div className={`p-2 md:p-4 rounded-lg md:rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-5 w-5 md:h-8 md:w-8 ${item.textColor}`} />
                </div>
                <span className="text-[10px] md:text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* PRÓXIMAS CLASES */}
      {/* ========================================== */}
      <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-sm md:text-lg font-semibold text-gray-900">
            {esFinde ? '⏰ Próximas clases' : proximasClases.length > 0 ? '📚 Clases de hoy' : '📅 Próximas clases'}
          </h2>
          {diaMostrado !== undefined && (
            <span className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-medium ${esFinde ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {esFinde ? '📅 ' : ''}{DIAS[diaMostrado]}
            </span>
          )}
        </div>
        
        {proximasClases.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-400">
            <BookOpen className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-50" />
            <p className="text-sm md:text-lg font-medium">{esFinde ? 'Disfrutá el finde' : 'No hay más clases'}</p>
            <p className="text-xs md:text-sm mt-1">{esFinde ? '🎉 ¡Nos vemos el lunes!' : '¡Buen trabajo! 🎉'}</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {proximasClases.map((clase, index) => (
              <motion.div
                key={clase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 md:gap-4 p-2.5 md:p-4 rounded-lg md:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="w-1 md:w-1.5 h-10 md:h-14 rounded-full" style={{ backgroundColor: clase.courses?.color || '#3B82F6' }} />
                
                <div className="text-center min-w-[45px] md:min-w-[60px]">
                  <p className="text-sm md:text-lg font-bold text-gray-900">{clase.start_time.substring(0, 5)}</p>
                  <p className="text-[8px] md:text-[10px] text-gray-400">a</p>
                  <p className="text-xs md:text-sm text-gray-500">{clase.end_time.substring(0, 5)}</p>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs md:text-base text-gray-900 truncate">{clase.courses?.name}</p>
                  <p className="text-[10px] md:text-sm text-gray-500">📍 {clase.courses?.classroom || 'Sin aula'}</p>
                </div>
                
                <div className="flex-shrink-0">
                  {index === 0 && !esFinde && (
                    <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-medium animate-pulse">
                      {clase.start_time.substring(0, 5) <= new Date().toTimeString().substring(0, 5) ? 'Ahora' : 'Próxima'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}