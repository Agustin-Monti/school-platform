import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ReportesContent } from '@/components/admin/reportes-content'

export default async function ReportesPage({ searchParams }: { searchParams: { anio?: string } }) {
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

  const anioSeleccionado = searchParams?.anio ? Number(searchParams.anio) : null

  // ==========================================
  // FALTAS
  // ==========================================
  let faltasQuery = supabase
    .from('attendance')
    .select(`
      student_id,
      students!inner (
        id, student_code,
        profiles:profile_id (full_name)
      ),
      courses!inner (name, year, division)
    `)
    .in('status', ['absent'])
    .order('date', { ascending: false })
    .limit(200)

  if (anioSeleccionado) {
    faltasQuery = faltasQuery.eq('courses.year', anioSeleccionado)
  }

  const { data: faltasData } = await faltasQuery

  const faltasMap = new Map()
  faltasData?.forEach(f => {
    const student = Array.isArray(f.students) ? f.students[0] : f.students
    const course = Array.isArray(f.courses) ? f.courses[0] : f.courses
    const profile = Array.isArray(student?.profiles) ? student?.profiles[0] : student?.profiles
    const name = profile?.full_name || 'Sin nombre'
    
    if (!faltasMap.has(student?.id)) {
      faltasMap.set(student?.id, {
        id: student?.id, name, student_code: student?.student_code,
        faltas: 0, cursos: new Set()
      })
    }
    const entry = faltasMap.get(student?.id)
    entry.faltas++
    entry.cursos.add(`${course?.name} ${course?.year}°${course?.division}`)
  })

  const topFaltas = Array.from(faltasMap.values())
    .sort((a, b) => b.faltas - a.faltas)
    .slice(0, 10)
    .map(f => ({ ...f, cursos: Array.from(f.cursos) }))

  // ==========================================
  // PROMEDIOS
  // ==========================================
  let gradesQuery = supabase
    .from('grades')
    .select(`
      student_id, value,
      students!inner (
        id, student_code,
        profiles:profile_id (full_name)
      ),
      subjects!inner (
        course_id,
        courses!inner (year)
      )
    `)
    .limit(500)

  if (anioSeleccionado) {
    gradesQuery = gradesQuery.eq('subjects.courses.year', anioSeleccionado)
  }

  const { data: gradesData } = await gradesQuery

  const promediosMap = new Map()
  gradesData?.forEach(g => {
    const student = Array.isArray(g.students) ? g.students[0] : g.students
    const profile = Array.isArray(student?.profiles) ? student?.profiles[0] : student?.profiles
    const name = profile?.full_name || 'Sin nombre'
    
    if (!promediosMap.has(student?.id)) {
      promediosMap.set(student?.id, {
        id: student?.id, name, student_code: student?.student_code,
        total: 0, count: 0
      })
    }
    const entry = promediosMap.get(student?.id)
    entry.total += g.value
    entry.count++
  })

  const promedios = Array.from(promediosMap.values())
    .map(p => ({ ...p, promedio: p.count > 0 ? (p.total / p.count) : 0 }))
    .filter(p => p.count >= 1)

  const promediosBajos = [...promedios].sort((a, b) => a.promedio - b.promedio).slice(0, 10)
  const promediosAltos = [...promedios].sort((a, b) => b.promedio - a.promedio).slice(0, 10)

  // ==========================================
  // ASISTENCIA POR CURSO
  // ==========================================
  let attendanceQuery = supabase
    .from('attendance')
    .select(`status, courses!inner (id, name, year, division)`)
    .limit(2000)

  if (anioSeleccionado) {
    attendanceQuery = attendanceQuery.eq('courses.year', anioSeleccionado)
  }

  const { data: attendanceData } = await attendanceQuery

  const cursoMap = new Map()
  attendanceData?.forEach(a => {
    const course = Array.isArray(a.courses) ? a.courses[0] : a.courses
    const key = `${course?.name} ${course?.year}°${course?.division}`
    
    if (!cursoMap.has(key)) {
      cursoMap.set(key, { curso: key, total: 0, presentes: 0, tardes: 0, ausentes: 0 })
    }
    const entry = cursoMap.get(key)
    entry.total++
    if (a.status === 'present') entry.presentes++
    if (a.status === 'late') entry.tardes++
    if (a.status === 'absent') entry.ausentes++
  })

  const asistenciaPorCurso = Array.from(cursoMap.values())
    .map(c => ({ ...c, porcentaje: c.total > 0 ? Math.round((c.presentes / c.total) * 100) : 0 }))
    .sort((a, b) => a.porcentaje - b.porcentaje)

  return (
    <ReportesContent 
      topFaltas={topFaltas}
      promediosBajos={promediosBajos}
      promediosAltos={promediosAltos}
      asistenciaPorCurso={asistenciaPorCurso}
      anioSeleccionado={anioSeleccionado}
    />
  )
}