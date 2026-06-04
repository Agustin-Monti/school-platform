import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. No autenticado → redirigir a login
  if (!user && (path.startsWith('/dashboard') || path.startsWith('/panel') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Autenticado → verificar estado y rol
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    const status = profile?.status

    // 🆕 Si está pendiente, solo puede ver la página de espera
    if (status === 'pending' && path !== '/pendiente' && path !== '/login') {
      return NextResponse.redirect(new URL('/pendiente', request.url))
    }

    // 🆕 Si está rechazado, solo puede ver login
    if (status === 'rejected' && path !== '/login') {
      return NextResponse.redirect(new URL('/login?error=rejected', request.url))
    }

    // Si está activo y en /pendiente, redirigir según rol
    if (status === 'active' && path === '/pendiente') {
      let destino = '/dashboard'
      if (role === 'TEACHER') destino = '/panel'
      if (role === 'ADMIN') destino = '/admin'
      return NextResponse.redirect(new URL(destino, request.url))
    }

    // En login/register → redirigir según rol (solo si está activo)
    if (path === '/login' || path === '/register') {
      if (status === 'active') {
        let destino = '/dashboard'
        if (role === 'TEACHER') destino = '/panel'
        if (role === 'ADMIN') destino = '/admin'
        return NextResponse.redirect(new URL(destino, request.url))
      }
      // Si está pendiente, se queda en login o va a /pendiente
      if (status === 'pending') {
        return NextResponse.redirect(new URL('/pendiente', request.url))
      }
    }

    // Estudiante intenta entrar a panel o admin
    if (role === 'STUDENT' && (path.startsWith('/panel') || path.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Profesor intenta entrar a dashboard o admin
    if (role === 'TEACHER' && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/panel', request.url))
    }

    // Admin intenta entrar a dashboard o panel
    if (role === 'ADMIN' && (path.startsWith('/dashboard') || path.startsWith('/panel'))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/panel/:path*', '/admin/:path*', '/login', '/register', '/pendiente'],
}