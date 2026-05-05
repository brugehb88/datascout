import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
export const maxDuration = 30;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tipos de eventos suportados
type SupportedEvent =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.paid"
  | "invoice.payment_failed";

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
    // Log do evento recebido
    console.log(`✅ Received event: ${event.type}`);

    // Roteador de eventos
    switch (event.type as SupportedEvent) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
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
 * Pagamento realizado com sucesso
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("💳 Payment Intent succeeded:", paymentIntent.id);

  const customerId = paymentIntent.customer as string;

  if (!customerId) {
    console.warn("No customer ID found in payment intent");
    return;
  }

  // Atualizar status do usuário no banco de dados
  // Exemplo: ativar acesso ao plano
  await supabase
    .from("users")
    .update({
      stripe_payment_status: "success",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Pagamento falhou
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("❌ Payment Intent failed:", paymentIntent.id);

  const customerId = paymentIntent.customer as string;

  if (!customerId) {
    console.warn("No customer ID found in payment intent");
    return;
  }

  // Notificar usuário ou tomar ação apropriada
  await supabase
    .from("users")
    .update({
      stripe_payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Subscription criada
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("🎯 Subscription created:", subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  // Atualizar usuário com informações de subscription
  await supabase
    .from("users")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      stripe_subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Subscription atualizada (mudança de plano, ciclo, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("🔄 Subscription updated:", subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  await supabase
    .from("users")
    .update({
      stripe_price_id: priceId,
      stripe_subscription_status: status,
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

  // Desativar acesso ou marcar como cancelado
  await supabase
    .from("users")
    .update({
      stripe_subscription_status: "canceled",
      stripe_subscription_id: null,
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

  // Registrar pagamento ou atualizar período
  await supabase
    .from("users")
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

  // Notificar usuário ou tomar ação
  await supabase
    .from("users")
    .update({
      last_payment_failed: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}
