import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cadastro + Checkout em um único endpoint
 * 1. Cria conta no Supabase Auth
 * 2. Cria customer no Stripe (com email)
 * 3. Cria checkout session com email pré-preenchido
 * 4. Retorna URL do Stripe Checkout
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, whatsapp, priceId, planId } =
      await request.json()

    // Validação
    if (!email || !password || !priceId || !planId) {
      return NextResponse.json(
        { error: 'Email, senha, priceId e planId são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    // 1. Verifica se o usuário já existe
    const { data: existingUsersData } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsersData.users.find(
      (u: { email?: string }) => u.email === email
    )

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            'Este e-mail já está cadastrado. Faça login para continuar.',
          code: 'user_exists',
        },
        { status: 409 }
      )
    }

    // 2. Cria usuário no Supabase Auth (já confirmado, sem precisar de email)
    const { data: newUserData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || null,
          whatsapp: whatsapp || null,
          plan_id: planId,
        },
      })

    if (createError || !newUserData.user) {
      console.error('❌ Error creating user:', createError)
      return NextResponse.json(
        { error: createError?.message || 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    const userId = newUserData.user.id

    // 3. Cria perfil
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName || null,
      whatsapp: whatsapp || null,
    })

    if (profileError) {
      console.error('⚠️ Error creating profile:', profileError)
      // Não bloqueia o fluxo
    }

    // 4. Cria customer no Stripe
    const customer = await stripe.customers.create({
      email,
      name: fullName || undefined,
      phone: whatsapp || undefined,
      metadata: {
        supabase_user_id: userId,
        plan_id: planId,
      },
    })

    // 5. Cria registro inicial em subscriptions
    const { error: subError } = await supabaseAdmin.from('subscriptions').upsert({
  user_id: userId,
  stripe_customer_id: customer.id,
  plan: planId,
  chosen_plan: planId,
  status: 'pending',
}, { onConflict: 'user_id' })

    if (subError) {
      console.error('⚠️ Error creating subscription record:', subError)
    }

    // 6. Cria Stripe Checkout Session
    const origin = request.headers.get('origin') || 'https://datascout.com.br'

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?plan=${planId}&canceled=true`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan_id: planId,
          supabase_user_id: userId,
        },
      },
      metadata: {
        plan_id: planId,
        supabase_user_id: userId,
      },
      allow_promotion_codes: true,
      locale: 'pt-BR',
      billing_address_collection: 'auto',
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      userId,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ Erro em signup-checkout:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
