import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Checkout PÚBLICO - não exige autenticação prévia
 * Cliente paga primeiro, conta é criada automaticamente via webhook
 */
export async function POST(request: NextRequest) {
  try {
    const { priceId, planId, email } = await request.json()

    if (!priceId || !planId) {
      return NextResponse.json(
        { error: 'priceId e planId são obrigatórios' },
        { status: 400 }
      )
    }

    const origin =
      request.headers.get('origin') || 'https://app.datascout.com.br'

    // Criar checkout session SEM customer pré-existente
    // Stripe vai coletar o email no próprio checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // Se já temos email (vem do form de pré-checkout), pré-preenche
      ...(email && { customer_email: email }),
      // Para coletar email se não tiver
      ...(!email && { customer_creation: 'always' }),
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?plan=${planId}&canceled=true`,
      // Trial de 7 dias - aumenta conversão
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan_id: planId,
        },
      },
      metadata: {
        plan_id: planId,
      },
      // Permite cupons de desconto
      allow_promotion_codes: true,
      // Localização BR
      locale: 'pt-BR',
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Erro ao criar checkout público:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
