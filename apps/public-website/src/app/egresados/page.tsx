import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { EgresadosContent } from '@/components/landing/egresados-content'

export default async function EgresadosPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: any) { cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: promos } = await supabase
    .from('promos')
    .select('*')
    .order('graduation_year', { ascending: false })

  return <EgresadosContent promos={promos || []} />
}