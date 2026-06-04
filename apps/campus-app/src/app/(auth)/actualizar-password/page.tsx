'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [completado, setCompletado] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Intentar recuperar la sesión del hash
    const initSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Session:', session)
      if (!session) {
        setError('Link inválido o expirado. Solicitá uno nuevo.')
      }
    }
    initSession()
  }, [])

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Mínimo 6 caracteres')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (!error) {
      setCompletado(true)
      setTimeout(() => router.push('/login'), 3000)
    } else {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="relative h-16 w-16 mx-auto mb-4">
              <Image src="/images/logo.png" alt="IPM D64" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Nueva Contraseña</h1>
          </div>

          {error && !completado && (
            <div className="text-center space-y-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
              <a href="/recuperar-password" className="text-blue-600 hover:underline text-sm inline-block">
                Solicitar nuevo link
              </a>
            </div>
          )}

          {completado ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-gray-700 font-medium mb-2">¡Contraseña actualizada!</p>
              <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
            </motion.div>
          ) : !error && (
            <form onSubmit={handleActualizar} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}