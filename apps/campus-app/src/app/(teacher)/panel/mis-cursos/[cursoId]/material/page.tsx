import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MaterialContent } from '@/components/teacher/material-content'

export default async function MaterialPage({ params }: { params: { cursoId: string } }) {
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
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('course_id', cursoId)
    .order('name')

  // Obtener materiales existentes
  const { data: materialesRaw } = await supabase
  .from('materials')
  .select(`
    id,
    title,
    description,
    type,
    url,
    file_size,
    created_at,
    subject_id,
    subjects (
      name
    )
  `)
  .eq('course_id', cursoId)
  .order('created_at', { ascending: false })

  // Formatear: subjects viene como array, tomar el primero
    const materiales = (materialesRaw || []).map((m: any) => ({
    ...m,
    subjects: Array.isArray(m.subjects) ? m.subjects[0] : m.subjects
    }))

  return (
    <MaterialContent 
        curso={curso} 
        materias={subjects || []} 
        materiales={materiales} 
    />
    )
}