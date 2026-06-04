import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NuevaTareaContent } from '@/components/teacher/nueva-tarea-content'

export default async function NuevaTareaPage({ params }: { params: { cursoId: string } }) {
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

  const { data: curso } = await supabase
    .from('courses')
    .select('id, name, year, division, color')
    .eq('id', cursoId)
    .single()

  return <NuevaTareaContent curso={curso} />
}