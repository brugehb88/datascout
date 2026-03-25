import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/perfil`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar portal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}