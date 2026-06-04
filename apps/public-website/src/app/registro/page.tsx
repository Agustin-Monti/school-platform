'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, User, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Paso = 'rol' | 'datos' | 'completado'

export default function RegistroPage() {
  const [paso, setPaso] = useState<Paso>('rol')
  const [rol, setRol] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Datos comunes
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Datos de estudiante
  const [anio, setAnio] = useState(1)

  // Datos de profesor
  const [especialidad, setEspecialidad] = useState('')

  const handleRegistrarse = async () => {
    setLoading(true)
    setError('')

    // 1. Registrar en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: rol,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError('Error al crear usuario')
      setLoading(false)
      return
    }

    // 2. Actualizar perfil
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        role: rol,
      })
      .eq('id', userId)

    // 3. Si es estudiante, crear registro y auto-inscribir
    if (rol === 'STUDENT') {
      // Generar legajo
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
      
      const año = new Date().getFullYear()
      const legajo = `EST-${String((count || 0) + 1).padStart(4, '0')}-${año}`

      // Crear student
      const { data: student } = await supabase
        .from('students')
        .insert({
          profile_id: userId,
          student_code: legajo,
        })
        .select('id')
        .single()

      // Auto-inscribir en todos los cursos del año seleccionado
      if (student) {
        console.log('🔍 Estudiante creado:', student)
        console.log('🔍 Buscando cursos del año:', anio)
        
        const { data: cursos, error: cursosError } = await supabase
          .from('courses')
          .select('id, name, year, division')
          .eq('year', anio)

        console.log('📚 Cursos encontrados:', cursos)
        console.log('❌ Error cursos:', cursosError)

        if (cursos && cursos.length > 0) {
          const enrollments = cursos.map((c: { id: string; name: string; year: number }) => ({
            student_id: student.id,
            course_id: c.id,
          }))

          console.log('📝 Enrollments a insertar:', enrollments)

          const { data: enrollData, error: enrollError } = await supabase
            .from('enrollments')
            .insert(enrollments)
            .select('id, course_id')

          console.log('✅ Enrollments insertados:', enrollData)
          console.log('❌ Error enrollments:', enrollError)
        } else {
          console.log('⚠️ No se encontraron cursos para el año', anio)
        }
      }
    }

    // 4. Si es profesor, crear registro
    if (rol === 'TEACHER') {
      await supabase
        .from('teachers')
        .insert({
          profile_id: userId,
          speciality: especialidad || null,
        })
    }

    setPaso('completado')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
              <span className="text-white font-bold text-2xl">EM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">
              {paso === 'rol' && '¿Sos estudiante o profesor?'}
              {paso === 'datos' && 'Completá tus datos'}
              {paso === 'completado' && '¡Registro exitoso!'}
            </p>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-2 w-8 rounded-full ${paso === 'rol' ? 'bg-blue-600' : 'bg-blue-200'}`} />
            <div className={`h-2 w-8 rounded-full ${paso === 'datos' ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-8 rounded-full ${paso === 'completado' ? 'bg-emerald-600' : 'bg-gray-200'}`} />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          {/* PASO 1: Elegir rol */}
          {paso === 'rol' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <button
                onClick={() => { setRol('STUDENT'); setPaso('datos') }}
                className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 group"
              >
                <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Soy Estudiante</p>
                  <p className="text-sm text-gray-500">Quiero ver mis cursos y notas</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
              </button>

              <button
                onClick={() => { setRol('TEACHER'); setPaso('datos') }}
                className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-4 group"
              >
                <div className="p-3 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Soy Profesor</p>
                  <p className="text-sm text-gray-500">Quiero gestionar mis cursos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
            </motion.div>
          )}

          {/* PASO 2: Datos */}
          {paso === 'datos' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <button
                onClick={() => setPaso('rol')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {/* Campos según rol */}
              {rol === 'STUDENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año que cursás</label>
                  <select
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {[1,2,3,4,5,6].map(a => (
                      <option key={a} value={a}>{a}° Año</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Se te asignarán automáticamente los cursos de {anio}° año
                  </p>
                </div>
              )}

              {rol === 'TEACHER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                  <input
                    type="text"
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Matemática, Lengua..."
                  />
                </div>
              )}

              <button
                onClick={handleRegistrarse}
                disabled={loading || !fullName || !email || !password}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </motion.div>
          )}

          {/* PASO 3: Completado */}
          {paso === 'completado' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">¡Registro exitoso!</h2>
              <p className="text-gray-500 mb-6">
                {rol === 'STUDENT' 
                  ? 'Ya podés ingresar al campus con tu email y contraseña.'
                  : 'Un administrador revisará tu solicitud.'}
              </p>
              <Link
                href="http://localhost:3001/login"
                className="inline-block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 transition-all shadow-lg"
              >
                Ir al Campus Virtual
              </Link>
            </motion.div>
          )}

          {/* Link a login */}
          {paso !== 'completado' && (
            <div className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <Link href="http://localhost:3001/login" className="text-blue-600 hover:underline font-medium">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}