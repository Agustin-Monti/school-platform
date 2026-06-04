'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3001/actualizar-password',
    })

    if (!error) {
      setEnviado(true)
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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative h-16 w-16 mx-auto mb-4">
              <Image src="/images/logo.png" alt="IPM D64" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-500 mt-1">
              Te enviaremos un link para restablecerla
            </p>
          </div>

          {enviado ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-gray-700 font-medium mb-2">¡Email enviado!</p>
              <p className="text-sm text-gray-500 mb-6">
                Revisá tu bandeja de entrada y seguí el link para restablecer tu contraseña.
              </p>
              <Link
                href="/login"
                className="text-blue-600 hover:underline text-sm"
              >
                ← Volver al inicio de sesión
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}