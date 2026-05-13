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

// Lista de domínios de email descartáveis mais comuns
const BLOCKED_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'spam4.me', 'trashmail.com',
  'trashmail.me', 'trashmail.net', 'dispostable.com', 'mailnull.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org', 'tempr.email',
  'fakeinbox.com', 'mailnesia.com', 'maildrop.cc', 'discard.email',
  'spamspot.com', 'spamthisplease.com', 'fakemail.net', 'mailexpire.com',
  'throwam.com', 'bouncr.com', 'discardmail.com', 'spamherelots.com',
  'tempinbox.com', 'throwam.com', 'trbvm.com', 'bugmenot.com',
])

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? BLOCKED_EMAIL_DOMAINS.has(domain) : false
}

function normalizeWhatsapp(whatsapp: string): string {
  return whatsapp.replace(/\D/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, whatsapp, priceId, planId } = await request.json()

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

    // 1. Bloquear emails descartáveis
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Por favor, use um email válido. Emails temporários não são permitidos.' },
        { status: 400 }
      )
    }

    // 2. Verificar se WhatsApp já está em uso (se fornecido)
    const whatsappNormalizado = whatsapp ? normalizeWhatsapp(whatsapp) : null

    if (whatsappNormalizado && whatsappNormalizado.length >= 10) {
      const { data: whatsappExistente } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('whatsapp', whatsappNormalizado)
        .single()

      if (whatsappExistente) {
        return NextResponse.json(
          {
            error: 'Este número de WhatsApp já está associado a uma conta.',
            code: 'whatsapp_exists',
          },
          { status: 409 }
        )
      }
    }

    // 3. Verificar se o usuário já existe
    const { data: existingUsersData } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsersData.users.find(
      (u: { email?: string }) => u.email === email
    )

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Este e-mail já está cadastrado. Faça login para continuar.',
          code: 'user_exists',
        },
        { status: 409 }
      )
    }

    // 4. Criar usuário no Supabase Auth
    const { data: newUserData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || null,
          whatsapp: whatsappNormalizado || null,
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

    // 5. Criar perfil
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName || null,
      whatsapp: whatsappNormalizado || null,
    })

    if (profileError) {
      console.error('⚠️ Error creating profile:', profileError)
    }

    // 6. Criar customer no Stripe
    const customer = await stripe.customers.create({
      email,
      name: fullName || undefined,
      phone: whatsappNormalizado || undefined,
      metadata: {
        supabase_user_id: userId,
        plan_id: planId,
      },
    })

    // 7. Criar registro inicial em subscriptions (UPSERT para evitar duplicatas)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: customer.id,
          plan: planId,
          chosen_plan: planId,
          status: 'pending',
        },
        { onConflict: 'user_id' }
      )

    if (subError) {
      console.error('⚠️ Error creating subscription record:', subError)
    }

    // 8. Criar Stripe Checkout Session
    const origin = request.headers.get('origin') || 'https://app.datascout.com.br'

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
