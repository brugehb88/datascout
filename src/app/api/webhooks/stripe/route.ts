import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// Cliente Supabase com service role (para criar usuários)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Handler de webhook da Stripe
 * POST /api/webhooks/stripe
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("⚠️ Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    console.log(`✅ Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`⏭️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * 🎯 EVENTO PRINCIPAL: Checkout completo
 * Cria conta no Supabase + envia email mágico
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🎉 Checkout completed:", session.id);

  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const planId = session.metadata?.plan_id || "pro";

  if (!customerEmail) {
    console.error("❌ No email found in checkout session");
    return;
  }

  console.log(`📧 Processing new customer: ${customerEmail}`);

  try {
    // 1. Verificar se o usuário já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === customerEmail
    );

    let userId: string;

    if (existingUser) {
      // Usuário já existe - apenas atualiza
      console.log(`👤 User already exists: ${existingUser.id}`);
      userId = existingUser.id;
    } else {
      // 2. Criar novo usuário no Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true, // Já considera o email confirmado
        user_metadata: {
          plan_id: planId,
          stripe_customer_id: customerId,
          source: "checkout_public",
        },
      });

      if (createError) {
        console.error("❌ Error creating user:", createError);
        throw createError;
      }

      userId = newUser.user!.id;
      console.log(`✨ New user created: ${userId}`);
    }

    // 3. Criar/atualizar registro de subscription no banco
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_id: planId,
          status: "trialing",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      console.error("⚠️ Error saving subscription:", subError);
    }

    // 4. Enviar email mágico (Magic Link) para o cliente
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: customerEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://datascout.com.br"}/auth/callback`,
      },
    });

    if (emailError) {
      console.error("⚠️ Error generating magic link:", emailError);
    } else {
      console.log(`✉️ Magic link sent to: ${customerEmail}`);
    }
  } catch (error) {
    console.error("❌ Error in handleCheckoutCompleted:", error);
    throw error;
  }
}

/**
 * Subscription criada
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("🎯 Subscription created:", subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  await supabase
    .from("subscriptions")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Subscription atualizada
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("🔄 Subscription updated:", subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  await supabase
    .from("subscriptions")
    .update({
      stripe_price_id: priceId,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Subscription cancelada
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("🗑️ Subscription deleted:", subscription.id);

  const customerId = subscription.customer as string;

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Fatura paga
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("📧 Invoice paid:", invoice.id);

  const customerId = invoice.customer as string;

  await supabase
    .from("subscriptions")
    .update({
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Falha no pagamento da fatura
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("⚠️ Invoice payment failed:", invoice.id);

  const customerId = invoice.customer as string;

  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}
