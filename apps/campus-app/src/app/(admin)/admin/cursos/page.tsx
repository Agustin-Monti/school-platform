import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CursosContent } from '@/components/admin/cursos-content'

export default async function CursosPage() {
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

  // Obtener todos los cursos con profesor y materias
  const { data: cursos } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      year,
      division,
      classroom,
      color,
      teachers (
        id,
        speciality,
        profiles (full_name)
      ),
      subjects (id, name),
      schedules (id, day_of_week, start_time, end_time),
      enrollments (student_id)
    `)
    .order('year')
    .order('division')

  // Obtener profesores disponibles para el formulario
  const { data: teachers } = await supabase
    .from('teachers')
    .select('id, speciality, profiles (full_name)')

  return <CursosContent cursos={cursos || []} teachers={teachers || []} />
}