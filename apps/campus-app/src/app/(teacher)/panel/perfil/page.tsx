import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ProfesorPerfilContent } from '@/components/teacher/profesor-perfil-content'

export default async function PerfilPage() {
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

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Obtener datos de teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('profile_id', user?.id)
    .single()

  return (
    <ProfesorPerfilContent 
      user={user} 
      profile={profile} 
      teacher={teacher} 
    />
  )
}