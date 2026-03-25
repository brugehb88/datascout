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
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) console.error('Supabase update error:', error)
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

  const obj = event.data.object

  // Helpers para extrair dados de qualquer versão da API Stripe
  const getMeta = (o: any) => {
    if (o.metadata && Object.keys(o.metadata).length > 0) return o.metadata
    if (o.parent?.subscription_details?.metadata) return o.parent.subscription_details.metadata
    return {}
  }

  const getSubId = (o: any): string | null => {
    return o.subscription || o.parent?.subscription_details?.subscription || null
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const meta = getMeta(obj)
        const userId = meta.supabase_user_id
        const planId = meta.plan_id
        const subId = getSubId(obj)

        if (!userId || !planId) {
          console.log('checkout: missing userId or planId', meta)
          break
        }

        // Calcular trial end (7 dias a partir de agora)
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 7)

        // Calcular period end (1 mês a partir de agora, após trial)
        const periodEnd = new Date()
        periodEnd.setDate(periodEnd.getDate() + 37) // 7 dias trial + 30 dias

        await updateSubscription(userId, {
          plan: planId,
          status: 'trialing',
          stripe_subscription_id: subId,
          stripe_customer_id: obj.customer,
          chosen_plan: planId,
          analyses_limit: planId === 'pro' ? 150 : 30,
          analyses_used: 0,
          trial_ends_at: trialEnd.toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        console.log('checkout.session.completed: success for', userId)
        break
      }

      case 'invoice.paid': {
        const subId = getSubId(obj)
        if (!subId) break

        // Buscar metadata da subscription via lines
        const meta = getMeta(obj)
        let userId = meta.supabase_user_id

        // Se não tem na invoice metadata, tenta nas lines
        if (!userId && obj.lines?.data?.[0]) {
          const lineMeta = obj.lines.data[0].metadata || {}
          userId = lineMeta.supabase_user_id
        }

        // Se ainda não tem, tenta no parent
        if (!userId && obj.parent?.subscription_details?.metadata) {
          userId = obj.parent.subscription_details.metadata.supabase_user_id
        }

        if (!userId) {
          console.log('invoice.paid: no user id found')
          break
        }

        // Calcular próximo período (1 mês)
        const nextPeriodEnd = new Date()
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1)

        await updateSubscription(userId, {
          status: 'active',
          analyses_used: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: nextPeriodEnd.toISOString(),
        })
        console.log('invoice.paid: success for', userId)
        break
      }

      case 'invoice.payment_failed': {
        const meta = getMeta(obj)
        let userId = meta.supabase_user_id
        if (!userId && obj.parent?.subscription_details?.metadata) {
          userId = obj.parent.subscription_details.metadata.supabase_user_id
        }
        if (!userId) break

        await updateSubscription(userId, { status: 'past_due' })
        break
      }

      case 'customer.subscription.deleted': {
        const meta = getMeta(obj)
        const userId = meta.supabase_user_id
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
        const meta = getMeta(obj)
        const userId = meta.supabase_user_id
        if (!userId) break

        const updateData: any = {
          status: obj.status === 'trialing' ? 'trialing' : obj.status,
        }

        if (obj.current_period_end) {
          updateData.current_period_end = new Date(obj.current_period_end * 1000).toISOString()
        }

        await updateSubscription(userId, updateData)
        break
      }
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}