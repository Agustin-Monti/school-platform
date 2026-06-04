import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { EgresadosAdminContent } from '@/components/admin/egresados-admin-content'

export default async function EgresadosAdminPage() {
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

  const { data: promos } = await supabase
    .from('promos')
    .select('*')
    .order('graduation_year', { ascending: false })

  return <EgresadosAdminContent promos={promos || []} />
}