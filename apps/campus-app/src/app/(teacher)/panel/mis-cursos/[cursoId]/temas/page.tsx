import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TemasProfesorContent } from '@/components/teacher/temas-profesor-content'

export default async function TemasProfesorPage({ params }: { params: { cursoId: string } }) {
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

  // Obtener materias del curso
  const { data: materias } = await supabase
    .from('subjects')
    .select('*')
    .eq('course_id', cursoId)
    .order('order_index')

  return (
    <TemasProfesorContent 
      curso={curso} 
      materias={materias || []} 
    />
  )
}