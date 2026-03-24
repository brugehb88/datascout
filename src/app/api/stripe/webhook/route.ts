import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function updateSubscription(userId: string, data: any) {
  const supabaseAdmin = getSupabaseAdmin()
  await supabaseAdmin
    .from('subscriptions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const obj = event.data.object

    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = obj.metadata?.supabase_user_id
        const planId = obj.metadata?.plan_id
        if (!userId || !planId) break

        const sub = await stripe.subscriptions.retrieve(obj.subscription as string)

        await updateSubscription(userId, {
          plan: planId,
          status: sub.status === 'trialing' ? 'trialing' : 'active',
          stripe_subscription_id: obj.subscription,
          stripe_customer_id: obj.customer,
          chosen_plan: planId,
          analyses_limit: planId === 'pro' ? 150 : 30,
          analyses_used: 0,
          trial_ends_at: sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        })
        break
      }

      case 'invoice.paid': {
        const subId = obj.subscription as string
        if (!subId) break
        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await updateSubscription(userId, {
          status: 'active',
          analyses_used: 0,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        })
        break
      }

      case 'invoice.payment_failed': {
        const subId = obj.subscription as string
        if (!subId) break
        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await updateSubscription(userId, { status: 'past_due' })
        break
      }

      case 'customer.subscription.deleted': {
        const userId = obj.metadata?.supabase_user_id
        if (!userId) break

        await updateSubscription(userId, {
          status: 'canceled',
          plan: 'trial',
          analyses_limit: 0,
          stripe_subscription_id: null,
        })
        break
      }

      case 'customer.subscription.updated': {
        const userId = obj.metadata?.supabase_user_id
        if (!userId) break

        await updateSubscription(userId, {
          status: obj.status === 'trialing' ? 'trialing' : obj.status,
          current_period_end: new Date(obj.current_period_end * 1000).toISOString(),
        })
        break
      }
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}