import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UsuariosContent } from '@/components/admin/usuarios-content'

const USUARIOS_POR_PAGINA = 10

export default async function UsuariosPage({ searchParams }: { searchParams: { pagina?: string; busqueda?: string; rol?: string } }) {
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

  const pagina = Number(searchParams?.pagina) || 1
  const busqueda = searchParams?.busqueda || ''
  const rol = searchParams?.rol || 'todos'

  // Construir query base
  let query = supabase.from('profiles').select('*', { count: 'exact' })

  // Filtros
  if (rol !== 'todos') {
    query = query.eq('role', rol)
  }
  
  if (busqueda) {
    query = query.ilike('full_name', `%${busqueda}%`)
  }

  // Paginación
  const desde = (pagina - 1) * USUARIOS_POR_PAGINA
  const hasta = desde + USUARIOS_POR_PAGINA - 1

  const { data: profiles, count } = await query
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  const totalPaginas = Math.ceil((count || 0) / USUARIOS_POR_PAGINA)

  // Obtener students y teachers como antes
  const { data: students } = await supabase.from('students').select('profile_id, student_code, birth_date')
  const { data: teachers } = await supabase.from('teachers').select('profile_id, speciality')

  const studentMap = new Map()
  students?.forEach(s => studentMap.set(s.profile_id, s))
  const teacherMap = new Map()
  teachers?.forEach(t => teacherMap.set(t.profile_id, t))

  const usuarios = (profiles || []).map(p => ({
    ...p,
    student_code: studentMap.get(p.id)?.student_code || null,
    birth_date: studentMap.get(p.id)?.birth_date || null,
    speciality: teacherMap.get(p.id)?.speciality || null,
  }))

  return (
    <UsuariosContent 
      usuarios={usuarios} 
      paginaActual={pagina}
      totalPaginas={totalPaginas}
      totalUsuarios={count || 0}
      busquedaInicial={busqueda}
      rolInicial={rol}
    />
  )
}