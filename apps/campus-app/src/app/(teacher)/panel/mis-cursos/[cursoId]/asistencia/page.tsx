import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AsistenciaContent } from '@/components/teacher/asistencia-content'

export default async function AsistenciaPage({ params }: { params: { cursoId: string } }) {
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
    .select('id, name, year, division, color')
    .eq('id', cursoId)
    .single()

  // Obtener alumnos del curso
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', cursoId)

  const studentIds = (enrollments || []).map(e => e.student_id)

  // Obtener students con perfiles
  const { data: students } = await supabase
    .from('students')
    .select('id, student_code, profile_id')
    .in('id', studentIds)

  const profileIds = students?.map(s => s.profile_id).filter(Boolean) || []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', profileIds)

  // Mapa de perfiles
  const profileMap = new Map()
  profiles?.forEach(p => profileMap.set(p.id, p))

  // Armar lista de alumnos
  const alumnos = (students || []).map(s => ({
    id: s.id,
    student_code: s.student_code,
    full_name: profileMap.get(s.profile_id)?.full_name || 'Sin nombre',
    profile_id: s.profile_id
  }))

  // Obtener asistencia del día actual
  const hoy = new Date().toISOString().split('T')[0]
  
  const { data: asistenciaHoy } = await supabase
    .from('attendance')
    .select('student_id, status')
    .eq('course_id', cursoId)
    .eq('date', hoy)

  // Mapa de asistencia de hoy
  const asistenciaMap = new Map()
  asistenciaHoy?.forEach(a => asistenciaMap.set(a.student_id, a.status))

  // Obtener historial de asistencia (últimos 30 días)
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)
  
  const { data: historialAsistencia } = await supabase
    .from('attendance')
    .select('date, status, student_id')
    .eq('course_id', cursoId)
    .gte('date', hace30Dias.toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <AsistenciaContent 
      curso={curso} 
      alumnos={alumnos} 
      asistenciaHoy={asistenciaMap}
      historial={historialAsistencia || []}
    />
  )
}