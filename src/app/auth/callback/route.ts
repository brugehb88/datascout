import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Callback de autenticação
 * Rota: /auth/callback
 *
 * Suporta dois fluxos:
 * 1. Code (?code=xxx) - magic links e signInWithOtp
 * 2. Token Hash (?token_hash=xxx&type=invite) - invites
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as
    | 'invite'
    | 'magiclink'
    | 'recovery'
    | 'signup'
    | null
  const next = searchParams.get('next') ?? '/app/historico'

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fluxo 1: Code Exchange (magic links)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
    console.error('Code exchange error:', error)
  }

  // Fluxo 2: Token Hash (invites)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return response
    }
    console.error('Token verification error:', error)
  }

  // Se chegou aqui, deu erro
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
