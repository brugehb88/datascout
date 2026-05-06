import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  const hostname = request.headers.get('host') || ''
  const isAppSubdomain = hostname.startsWith('app.')

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Rotas públicas (LP, login, planos, checkout, auth callback)
    const publicPaths = ['/', '/login', '/planos', '/checkout', '/auth']
    const isPublicPath = publicPaths.some(p => 
      p === '/' ? path === '/' : path.startsWith(p)
    )

    // Subdomínio app: redireciona raiz para /historico se logado, /login se não
    if (isAppSubdomain && path === '/') {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/historico' : '/login'
      return NextResponse.redirect(url)
    }

    // Rotas protegidas (historico, perfil): exige login
    if (!user && (path.startsWith('/historico') || path.startsWith('/perfil'))) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Se logado e tenta acessar /login, vai para /historico
    if (user && path.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/historico'
      return NextResponse.redirect(url)
    }
  } catch {
    return NextResponse.next()
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}