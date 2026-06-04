import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CalificarContent } from '@/components/teacher/calificar-content'

export default async function CalificarPage({ params }: { params: { cursoId: string } }) {
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

  // Obtener curso
  const { data: curso } = await supabase
    .from('courses')
    .select('id, name, color')
    .eq('id', cursoId)
    .single()

  const { count: totalAlumnos } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', cursoId)  

  // Obtener tareas del curso
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      id,
      title,
      description,
      due_date,
      max_score
    `)
    .eq('course_id', cursoId)
    .order('due_date', { ascending: false })

  // Obtener entregas para cada tarea
  const tareasConEntregas = await Promise.all(
    (assignments || []).map(async (assignment) => {
      const { data: submissions } = await supabase
        .from('submissions')
        .select(`
          id,
          status,
          submitted_at,
          score,
          file_url,
          comment,
          student_id,
          students (
            id,
            student_code,
            profile_id
          )
        `)
        .eq('assignment_id', assignment.id)

      // Formatear submissions
      const entregasFormateadas = await Promise.all(
        (submissions || []).map(async (sub: any) => {
          const student = Array.isArray(sub.students) ? sub.students[0] : sub.students
          
          // Obtener nombre del perfil
          let fullName = 'Sin nombre'
          if (student?.profile_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', student.profile_id)
              .single()
            fullName = profile?.full_name || 'Sin nombre'
          }

          return {
            id: sub.id,
            status: sub.status,
            submitted_at: sub.submitted_at,
            score: sub.score,
            file_url: sub.file_url,
            comment: sub.comment,
            student_id: sub.student_id,
            student_code: student?.student_code || '',
            full_name: fullName
          }
        })
      )

      return {
        ...assignment,
        submissions: entregasFormateadas,
        totalEntregas: entregasFormateadas.length,
        pendientes: entregasFormateadas.filter(s => s.status === 'submitted').length,
        calificadas: entregasFormateadas.filter(s => s.status === 'graded').length
      }
    })
  )

  return (
    <CalificarContent 
      curso={curso} 
      tareas={tareasConEntregas} 
      totalAlumnos={totalAlumnos || 0}
    />
  )
}