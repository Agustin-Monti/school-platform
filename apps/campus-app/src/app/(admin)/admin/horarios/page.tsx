import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { HorariosContent } from '@/components/admin/horarios-content'

export default async function HorariosPage() {
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

  // Obtener cursos
  const { data: cursos } = await supabase
    .from('courses')
    .select('id, name, year, division, color, classroom')
    .order('year')
    .order('division')

  // Obtener TODOS los horarios con info del curso
  const { data: horariosRaw } = await supabase
  .from('schedules')
  .select(`
    id, day_of_week, start_time, end_time, course_id,
    courses!inner (id, name, year, division, color)
  `)
  .order('day_of_week')
  .order('start_time')

  // Formatear: courses viene como array, tomar el primero
  const horarios = (horariosRaw || []).map((h: any) => ({
    ...h,
    courses: Array.isArray(h.courses) ? h.courses[0] : h.courses
  }))

  return <HorariosContent cursos={cursos || []} horarios={horarios} />
}