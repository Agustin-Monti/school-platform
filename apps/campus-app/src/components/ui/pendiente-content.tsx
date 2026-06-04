'use client'

import { motion } from 'framer-motion'
import { Clock, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function PendienteContent({ user, profile }: any) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cuenta pendiente de aprobación
        </h1>
        
        <p className="text-gray-500 mb-6">
          Hola{profile?.full_name ? ' ' + profile.full_name : ''}, tu cuenta está siendo revisada por un administrador. 
          Recibirás acceso cuando sea aprobada.
        </p>

        <div className="bg-amber-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-amber-700">
            📧 Te notificaremos por email cuando tu cuenta esté activa.
          </p>
          <p className="text-xs text-amber-500 mt-1">
            Esto suele tardar menos de 24 horas.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 rounded-2xl font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </motion.div>
    </div>
  )
}