import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let statsData = { promedio: 0, asistencia: 0, tareasPendientes: 0 }
  let proximasClases: any[] = []
  let diaMostrado: number | undefined = undefined
  let esFinde = false

  if (user) {
    // Obtener perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    profile = profileData

    if (profile?.role === 'STUDENT') {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (student) {
        // Obtener cursos del estudiante
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', student.id)

        const courseIds = (enrollments || []).map(e => e.course_id)

        // Promedio general (solo de sus cursos)
        const { data: subjects } = await supabase
          .from('subjects')
          .select('id')
          .in('course_id', courseIds)

        const subjectIds = subjects?.map(s => s.id) || []

        if (subjectIds.length > 0) {
          const { data: grades } = await supabase
            .from('grades')
            .select('value')
            .eq('student_id', student.id)
            .in('subject_id', subjectIds)

          if (grades && grades.length > 0) {
            statsData.promedio = Number((grades.reduce((acc, g) => acc + g.value, 0) / grades.length).toFixed(1))
          }
        }

        // Asistencia (solo de sus cursos)
        if (courseIds.length > 0) {
          const { data: attendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('student_id', student.id)
            .in('course_id', courseIds)

          if (attendance && attendance.length > 0) {
            const presentes = attendance.filter(a => a.status === 'present').length
            const tardes = attendance.filter(a => a.status === 'late').length
            statsData.asistencia = Math.round(((presentes + tardes * 0.5) / attendance.length) * 100)
          }
        }

        // Tareas pendientes (solo de sus cursos)
        if (courseIds.length > 0) {
          const { data: assignments } = await supabase
            .from('assignments')
            .select('id')
            .in('course_id', courseIds)

          const assignmentIds = assignments?.map(a => a.id) || []

          if (assignmentIds.length > 0) {
            const { data: submissions } = await supabase
              .from('submissions')
              .select('status')
              .eq('student_id', student.id)
              .in('assignment_id', assignmentIds)

            const entregadas = submissions?.filter(s => s.status !== 'pending').length || 0
            statsData.tareasPendientes = Math.max(0, assignmentIds.length - entregadas)
          }
        }

        // Próximas clases (solo de sus cursos)
        const hoy = new Date().getDay()
        const horaActual = new Date().toTimeString().substring(0, 5)
        
        esFinde = hoy === 0 || hoy === 6
        let diaBuscar = esFinde ? 1 : hoy

        if (courseIds.length > 0) {
          let { data: horarios } = await supabase
            .from('schedules')
            .select(`
              id,
              day_of_week,
              start_time,
              end_time,
              courses!inner (
                name,
                color,
                classroom
              )
            `)
            .eq('day_of_week', diaBuscar)
            .in('course_id', courseIds)
            .gte('start_time', diaBuscar === hoy ? horaActual : '00:00')
            .order('start_time')
            .limit(3)

          if ((!horarios || horarios.length === 0) && !esFinde && diaBuscar === hoy) {
            let proximoDia = hoy + 1
            if (proximoDia > 5) proximoDia = 1
            
            const { data: horariosProximo } = await supabase
              .from('schedules')
              .select(`
                id,
                day_of_week,
                start_time,
                end_time,
                courses!inner (
                  name,
                  color,
                  classroom
                )
              `)
              .eq('day_of_week', proximoDia)
              .in('course_id', courseIds)
              .order('start_time')
              .limit(3)
            
            horarios = horariosProximo
            diaBuscar = proximoDia
          }

          diaMostrado = diaBuscar

          if (horarios && horarios.length > 0) {
            proximasClases = horarios.map((h: any) => ({
              ...h,
              courses: Array.isArray(h.courses) ? h.courses[0] : h.courses
            }))
          }
        }
      }
    }
  }

  return (
    <DashboardContent 
      user={user} 
      profile={profile} 
      statsData={statsData} 
      proximasClases={proximasClases}
      diaMostrado={diaMostrado}
      esFinde={esFinde}
    />
  )
}