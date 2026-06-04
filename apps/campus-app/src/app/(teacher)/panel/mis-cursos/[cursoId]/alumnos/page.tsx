import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AlumnosContent } from '@/components/teacher/alumnos-content'

export default async function AlumnosPage({ params }: { params: { cursoId: string } }) {
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
  console.log('🔍 Buscando alumnos del curso:', cursoId)

  // Obtener curso
  const { data: curso, error: cursoError } = await supabase
    .from('courses')
    .select('id, name, year, division, color')
    .eq('id', cursoId)
    .single()

  console.log('📚 Curso:', { curso, cursoError })

  // Obtener alumnos del curso - CONSULTA SIMPLIFICADA
  const { data: enrollments, error: enrollError } = await supabase
  .from('enrollments')
  .select(`
    id,
    student_id
  `)
  .eq('course_id', cursoId)

console.log('📋 Enrollments:', enrollments)

if (!enrollments || enrollments.length === 0) {
  console.log('⚠️ No se encontraron enrollments')
  return <AlumnosContent curso={curso} alumnos={[]} />
}

// Obtener los student_id
const studentIds = enrollments.map(e => e.student_id)

// Obtener students por separado
const { data: students } = await supabase
  .from('students')
  .select('id, student_code, profile_id')
  .in('id', studentIds)

console.log('👤 Students:', students)

// Obtener profile_ids
const profileIds = students?.map(s => s.profile_id).filter(Boolean) || []

// Obtener perfiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, full_name')
  .in('id', profileIds)

console.log('👥 Profiles:', profiles)

// Mapa de perfiles
const profileMap = new Map()
profiles?.forEach(p => profileMap.set(p.id, p))

// Mapa de students
const studentMap = new Map()
students?.forEach(s => studentMap.set(s.id, s))

// Obtener materias del curso
const { data: subjects } = await supabase
  .from('subjects')
  .select('id')
  .eq('course_id', cursoId)

const subjectIds = subjects?.map(s => s.id) || []

// Para cada alumno, obtener promedio y asistencia
const alumnosConStats = await Promise.all(
  enrollments.map(async (enrollment) => {
    const student = studentMap.get(enrollment.student_id)
    const studentId = student?.id
    const profile = profileMap.get(student?.profile_id)
    
    console.log(`📊 Procesando: ${profile?.full_name}`)
    
    // Promedio
    let promedio = '--'
    if (subjectIds.length > 0 && studentId) {
      const { data: grades } = await supabase
        .from('grades')
        .select('value')
        .eq('student_id', studentId)
        .in('subject_id', subjectIds)

      if (grades && grades.length > 0) {
        promedio = (grades.reduce((acc, g) => acc + g.value, 0) / grades.length).toFixed(1)
      }
    }

    // Asistencia
    let totalAsistencias = 0
    let porcentajeAsistencia = 0
    if (studentId) {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId)
        .eq('course_id', cursoId)

      totalAsistencias = attendance?.length || 0
      const presentes = attendance?.filter(a => a.status === 'present').length || 0
      porcentajeAsistencia = totalAsistencias > 0
        ? Math.round((presentes / totalAsistencias) * 100)
        : 0
    }

    return {
      id: studentId || enrollment.student_id,
      student_code: student?.student_code || '',
      full_name: profile?.full_name || 'Sin nombre',
      promedio,
      asistencias: totalAsistencias,
      porcentajeAsistencia
    }
  })
)

  console.log('✅ Alumnos finales:', alumnosConStats.length)
  console.log('✅ Datos:', JSON.stringify(alumnosConStats, null, 2))

  return <AlumnosContent curso={curso} alumnos={alumnosConStats} />
}