import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
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

  // Stats generales
  const { count: totalAlumnos } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const { count: totalProfesores } = await supabase
    .from('teachers')
    .select('*', { count: 'exact', head: true })

  const { count: totalCursos } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  const { count: totalMaterias } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })

  // Cursos recientes
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
        profiles (full_name)
      )
    `)
    .order('year')
    .order('division')
    .limit(6)

  const stats = {
    totalAlumnos: totalAlumnos || 0,
    totalProfesores: totalProfesores || 0,
    totalCursos: totalCursos || 0,
    totalMaterias: totalMaterias || 0,
  }

  return (
    <AdminDashboard 
      user={user} 
      profile={profile} 
      stats={stats}
      cursos={cursos || []}
    />
  )
}