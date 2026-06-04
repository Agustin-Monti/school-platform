import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MisCursosContent } from '@/components/teacher/mis-cursos-content'

export default async function MisCursosPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Obtener teacher_id
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', user?.id)
    .single()

  // Obtener cursos del profesor con estadísticas
  const { data: cursos } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      year,
      division,
      classroom,
      color,
      subjects (
        id,
        name
      ),
      enrollments (
        student_id
      ),
      schedules (
        day_of_week,
        start_time,
        end_time
      )
    `)
    .eq('teacher_id', teacher?.id)
    .order('year')
    .order('division')

  // Calcular estadísticas por curso
  const cursosConStats = cursos?.map(curso => {
    const totalAlumnos = curso.enrollments?.length || 0
    const totalMaterias = curso.subjects?.length || 0
    const totalClases = curso.schedules?.length || 0
    
    return {
      ...curso,
      stats: { totalAlumnos, totalMaterias, totalClases }
    }
  }) || []

  return <MisCursosContent cursos={cursosConStats} />
}