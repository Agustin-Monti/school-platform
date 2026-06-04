'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modoLogin, setModoLogin] = useState<'estudiante' | 'profesor'>('estudiante')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let email = loginInput.trim()

      // Si es estudiante y no es email, buscar el email por legajo
      if (modoLogin === 'estudiante' && !loginInput.includes('@')) {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('profile_id, student_code')
          .eq('student_code', loginInput.trim())
          .maybeSingle()

        if (studentError || !studentData) {
          setError('Legajo no encontrado. Verificá el número.')
          setLoading(false)
          return
        }

        const { data: userEmail, error: rpcError } = await supabase
          .rpc('get_user_email_by_id', { user_id: studentData.profile_id })

        if (rpcError || !userEmail) {
          setError('Error al obtener datos del usuario.')
          setLoading(false)
          return
        }

        email = userEmail
      }

      // Iniciar sesión
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError(modoLogin === 'estudiante' 
            ? 'Legajo o contraseña incorrectos' 
            : 'Email o contraseña incorrectos')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Error:', err)
      setError('Error inesperado')
      setLoading(false)
    }
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
            <div className="relative h-20 w-20 mx-auto mb-4">
              <Image
                src="/images/logo.png"
                alt="IPM D64"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Campus Virtual</h1>
            <p className="text-sm text-gray-500 mt-1">
              Instituto Parroquial Mansilla D64
            </p>
          </div>

          {/* Toggle Estudiante/Profesor */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => {
                setModoLogin('estudiante')
                setLoginInput('')
                setError('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                modoLogin === 'estudiante'
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Estudiante
            </button>
            <button
              onClick={() => {
                setModoLogin('profesor')
                setLoginInput('')
                setError('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                modoLogin === 'profesor'
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="h-4 w-4" />
              Profesor
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
              >
                <span>⚠️</span>
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="login" className="text-sm font-medium text-gray-700 font-poppins">
                {modoLogin === 'estudiante' ? 'Legajo' : 'Email'}
              </label>
              <input
                id="login"
                type={modoLogin === 'estudiante' ? 'text' : 'email'}
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={modoLogin === 'estudiante' ? 'Ej: EST-2026-001' : 'profesor@escuela.edu.ar'}
                autoComplete="username"
              />
              {modoLogin === 'estudiante' && (
                <p className="text-xs text-gray-400">
                  Ingresá tu número de legajo de estudiante
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 font-poppins">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Link recuperar contraseña */}
            <div className="text-right">
              <Link
                href="/recuperar-password"
                className="text-xs text-blue-600 hover:underline font-poppins"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium font-poppins hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="http://localhost:3000" className="hover:text-gray-700 transition-colors">
              ← Volver al sitio principal
            </Link>
          </div>
        </div>

        {/* Info de prueba (ocultar en producción) */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Estudiante: EST-2026-001 / password123
          </p>
          <p className="text-xs text-gray-400">
            Profesor: profesor@escuela.edu.ar / password123
          </p>
        </div>
      </motion.div>
    </div>
  )
}