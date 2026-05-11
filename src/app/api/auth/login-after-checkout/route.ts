import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Login server-side após checkout
 * Cria sessão e seta cookies via middleware (que já configura domain raiz)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const hostname = request.headers.get('host') || ''
    const isProduction = hostname.includes('datascout.com.br')

    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Configura domain raiz para compartilhar entre subdomínios
              const cookieOptions = isProduction
                ? { ...options, domain: '.datascout.com.br' }
                : options
              response.cookies.set(name, value, cookieOptions)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return response
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ Login after checkout error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
