import { createClient } from '@supabase/supabase-js'

// Obtener variables de entorno de forma segura
function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    // Next.js automáticamente expone NEXT_PUBLIC_* al cliente
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue
    }
  } catch (e) {
    // Si process no está disponible
  }
  return defaultValue
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')

// Cliente público (para el frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Cliente para el servidor (con permisos elevados)
export function createServerClient() {
  const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'placeholder-key')
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  })
}

// Tipos para la aplicación
export type Tables = {
  profiles: {
    id: string
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
    full_name: string
    dni?: string
    phone?: string
    avatar_url?: string
    school_id?: string
  }
  courses: {
    id: string
    name: string
    year: number
    division: string
    classroom?: string
    color?: string
    academic_year_id: string
    teacher_id?: string
  }
  students: {
    id: string
    profile_id: string
    student_code: string
    birth_date?: string
    address?: string
    health_info?: any
    parent_id?: string
  }
  teachers: {
    id: string
    profile_id: string
    speciality?: string
    bio?: string
  }
  grades: {
    id: string
    value: number
    type: string
    description?: string
    date: string
    student_id: string
    subject_id: string
  }
  attendance: {
    id: string
    date: string
    status: 'present' | 'absent' | 'late' | 'justified'
    justification?: string
    student_id: string
    course_id: string
  }
}