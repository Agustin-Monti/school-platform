import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CursoDetalleContent } from '@/components/teacher/curso-detalle-content'

export default async function CursoDetallePage({ params }: { params: { cursoId: string } }) {
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

  const { cursoId } = params

  // Obtener datos del curso
  const { data: curso } = await supabase
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
        name,
        description
      ),
      schedules (
        id,
        day_of_week,
        start_time,
        end_time
      ),
      enrollments (
        student_id,
        students (
          id,
          student_code,
          profiles:profile_id (
            full_name
          )
        )
      )
    `)
    .eq('id', cursoId)
    .single()

  // Obtener estadísticas del curso
  const { data: stats } = await supabase
    .rpc('get_curso_stats', { curso_id: cursoId })

  return (
    <CursoDetalleContent 
      curso={curso} 
      stats={stats?.[0] || { promedio: 0, asistencias: 0, total_alumnos: 0 }} 
    />
  )
}