import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard'

export default async function PanelPage() {
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

  // Obtener notificaciones del profesor
  const { data: notificaciones } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.id)  // ← user?.id
    .order('created_at', { ascending: false })
    .limit(10)

  let profile = null
  let stats = {
    totalCursos: 0,
    totalAlumnos: 0,
    tareasPendientesCalificar: 0,
    promedioGeneral: 0
  }
  let cursos: any[] = []

  if (user) {
    // Obtener perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    profile = profileData

    // Obtener teacher_id
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (teacher) {
      // Obtener cursos del profesor
      const { data: cursosData } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          year,
          division,
          color,
          classroom,
          subjects (id, name)
        `)
        .eq('teacher_id', teacher.id)

      if (cursosData && cursosData.length > 0) {
        cursos = cursosData
        stats.totalCursos = cursosData.length

        const courseIds = cursosData.map(c => c.id)

        // Contar alumnos ÚNICOS (un alumno puede estar en varios cursos)
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('student_id')
          .in('course_id', courseIds)

        // Contar alumnos únicos
        const uniqueStudents = new Set(enrollmentsData?.map(e => e.student_id))
        stats.totalAlumnos = uniqueStudents.size

        // Tareas pendientes de calificar
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('id')
          .in('course_id', courseIds)

        const assignmentIds = assignmentsData?.map(a => a.id) || []

        if (assignmentIds.length > 0) {
          const { count: pendientesCount } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'submitted')
            .in('assignment_id', assignmentIds)

          stats.tareasPendientesCalificar = pendientesCount || 0

          // Promedio general de todas las calificaciones
          const { data: gradesData } = await supabase
            .from('grades')
            .select('value')
            .in('subject_id', (
              await supabase.from('subjects').select('id').in('course_id', courseIds)
            ).data?.map(s => s.id) || [])

          if (gradesData && gradesData.length > 0) {
            const promedio = gradesData.reduce((acc, g) => acc + g.value, 0) / gradesData.length
            stats.promedioGeneral = Number(promedio.toFixed(1))
          }
        }
      }
    }
  }

  return (
    <TeacherDashboard 
      user={user} 
      profile={profile} 
      stats={stats}
      cursos={cursos}
      notificacionesIniciales={notificaciones || []}
    />
  )
}