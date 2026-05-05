"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Lock,
  Shield,
  Clock,
  CreditCard,
  ArrowLeft,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// =============================================================================
// PLANOS - Mesma estrutura da LP
// =============================================================================

const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 47,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_1TFLpwRpq7vHDxvseVlcf6n5",
    description: "Ideal pra quem quer começar com análises sólidas nas ligas principais.",
    features: [
      "30 análises pré-jogo por mês",
      "10 ligas principais (BR + Europa top 5)",
      "Veredito estatístico potencializado por IA",
      "Suporte por e-mail",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 97,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TFLq9Rpq7vHDxvs6WHcjCIf",
    description: "Pra quem leva a sério. Todas as ligas, histórico e análise de intervalo.",
    features: [
      "150 análises pré-jogo por mês",
      "20+ ligas (todas disponíveis)",
      "Análise de intervalo (halftime) — EXCLUSIVO",
      "Histórico completo de análises",
      "Exportar análises em PDF",
      "Alertas de jogos com alta confiança",
      "Suporte prioritário no WhatsApp",
    ],
    highlight: true,
  },
};

// =============================================================================
// TRUST BADGES
// =============================================================================

const TRUST_BADGES = [
  { icon: Lock, label: "Pagamento Seguro" },
  { icon: Shield, label: "Stripe Encryption" },
  { icon: Clock, label: "7 Dias Grátis" },
  { icon: CreditCard, label: "Cancele Quando Quiser" },
];

// =============================================================================
// CHECKOUT FORM
// =============================================================================

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = (searchParams.get("plan") || "pro") as "starter" | "pro";
  const canceled = searchParams.get("canceled") === "true";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS[planId] || PLANS.pro;

  useEffect(() => {
    if (canceled) {
      setError("Pagamento cancelado. Tudo certo, você não foi cobrado.");
    }
  }, [canceled]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar checkout");
      }

      // Redireciona para Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header simples */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="bg-[#00C853] text-black px-3 py-1 font-black text-lg tracking-tight">
              DATA
            </span>
            <span className="text-white font-black text-lg tracking-tight">
              SCOUT
            </span>
          </div>

          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-[#00C853]">
              <div className="w-6 h-6 rounded-full bg-[#00C853] text-black flex items-center justify-center text-xs font-black">
                1
              </div>
              <span className="font-bold">Plano</span>
            </div>
            <div className="w-12 h-px bg-[#00C853]" />
            <div className="flex items-center gap-2 text-[#00C853]">
              <div className="w-6 h-6 rounded-full bg-[#00C853] text-black flex items-center justify-center text-xs font-black">
                2
              </div>
              <span className="font-bold">Pagamento</span>
            </div>
            <div className="w-12 h-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/40">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">
                3
              </div>
              <span>Acesso</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* COLUNA ESQUERDA - Resumo do plano (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                Você está a um passo
                <br />
                de <span className="text-[#00C853]">apostar com inteligência</span>.
              </h1>
              <p className="text-white/60">
                Confira seu plano e finalize a assinatura abaixo.
              </p>
            </div>

            {/* Card do plano selecionado */}
            <div
              className={`p-6 rounded-lg border ${
                plan.highlight
                  ? "bg-gradient-to-br from-[#00C853]/10 to-transparent border-[#00C853]/30"
                  : "bg-zinc-950 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black">Plano {plan.name}</h2>
                    {plan.highlight && (
                      <span className="bg-[#00C853] text-black text-xs font-black px-2 py-0.5">
                        MAIS ESCOLHIDO
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">
                    R$ {plan.price}
                  </div>
                  <div className="text-white/40 text-sm">/mês</div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="text-sm text-white/60 mb-3 font-medium">
                  Incluído no plano:
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-white/80"
                    >
                      <Check className="w-4 h-4 text-[#00C853] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trocar de plano */}
            {planId === "pro" ? (
              <Link
                href="/checkout?plan=starter"
                className="block text-center text-sm text-white/40 hover:text-white/70 transition"
              >
                Quero o plano Starter (R$ 47/mês)
              </Link>
            ) : (
              <Link
                href="/checkout?plan=pro"
                className="block text-center text-sm text-[#00C853] hover:text-[#00E676] font-bold transition"
              >
                ⬆ Upgrade para Pro (R$ 97/mês) — Recomendado
              </Link>
            )}

            {/* Social proof */}
            <div className="bg-zinc-950 border border-white/5 p-6 rounded-lg">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#00C853]"
                    fill="currentColor"
                  />
                ))}
                <span className="text-sm text-white/60 ml-2">
                  4.9 / 5 — apostadores que viraram analistas
                </span>
              </div>
              <p className="text-white/80 text-sm italic mb-3">
                &quot;Em 2 meses recuperei o investimento e ainda saí no lucro.
                A análise do intervalo é o diferencial — vejo a partida virar e
                tomo decisões antes da maioria.&quot;
              </p>
              <div className="text-xs text-white/40">
                — Apostador profissional há 5 anos
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - CTA de Pagamento (2/5) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="bg-zinc-950 border border-white/10 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-1">Resumo do pedido</h3>
                <p className="text-white/40 text-xs mb-6">
                  7 dias grátis, depois R$ {plan.price}/mês
                </p>

                {/* Highlight: 3 análises grátis */}
                <div className="bg-[#00C853]/10 border border-[#00C853]/30 p-3 mb-6 rounded">
                  <div className="flex items-start gap-2">
                    <div className="bg-[#00C853] text-black text-xs font-black px-2 py-0.5 rounded flex-shrink-0">
                      GRÁTIS
                    </div>
                    <div className="text-sm">
                      <strong className="text-white">3 análises de teste</strong>
                      <span className="text-white/60"> durante o trial — sem cobrança</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Plano {plan.name}</span>
                    <span className="font-bold">R$ {plan.price}/mês</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Trial gratuito</span>
                    <span className="text-[#00C853] font-bold">7 dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Cobrança hoje</span>
                    <span className="font-black text-lg">R$ 0,00</span>
                  </div>
                </div>

                <div className="text-xs text-white/40 mb-6 leading-relaxed">
                  Após 7 dias, sua assinatura iniciará automaticamente em
                  <strong className="text-white/60"> R$ {plan.price}/mês</strong>.
                  Cancele a qualquer momento antes do fim do trial e não pague
                  nada.
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#00C853] hover:bg-[#00E676] text-black font-black py-4 px-6 rounded transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
                >
                  {loading ? "Carregando..." : "Começar trial grátis →"}
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                  {TRUST_BADGES.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.label}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-3 h-3 text-[#00C853]" />
                        <span>{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Garantia */}
              <div className="mt-4 p-4 bg-[#00C853]/5 border border-[#00C853]/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm mb-1">
                      Garantia de 7 dias
                    </div>
                    <div className="text-white/60 text-xs leading-relaxed">
                      Se não achar que vale a pena, cancele dentro do trial e
                      não pague nada. Sem perguntas.
                    </div>
                  </div>
                </div>
              </div>

              {/* Stripe trust */}
              <div className="mt-4 text-center">
                <div className="text-xs text-white/30 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  Pagamento processado pela Stripe
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-black text-center mb-8">
            Dúvidas comuns antes de assinar
          </h3>

          <div className="space-y-3">
            {[
              {
                q: "O que acontece após o trial de 7 dias?",
                a: "Após 7 dias, sua assinatura é cobrada automaticamente. Você pode cancelar a qualquer momento antes disso e não será cobrado nada.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim. Sem fidelidade, sem multa. Cancele com 1 clique direto na sua conta.",
              },
              {
                q: "Como recebo meu acesso após o pagamento?",
                a: "Você recebe um e-mail imediatamente com link para criar sua senha e acessar a plataforma.",
              },
              {
                q: "Vocês garantem que vou ganhar dinheiro?",
                a: "Não. Nenhuma plataforma séria pode prometer ganhos. Entregamos análises probabilísticas para você tomar decisões fundamentadas — não com base em sorte.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-zinc-950 border border-white/5 rounded-lg group"
              >
                <summary className="p-4 cursor-pointer hover:bg-white/[0.02] transition flex items-center justify-between font-bold text-sm">
                  {faq.q}
                  <span className="text-[#00C853] group-open:rotate-180 transition">
                    ▼
                  </span>
                </summary>
                <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Footer minimalista */}
      <footer className="border-t border-white/5 mt-16 py-8 text-center text-white/30 text-xs">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-2">
            © {new Date().getFullYear()} DataScout. Todos os direitos
            reservados.
          </div>
          <div>
            Aposte com responsabilidade. Apenas para maiores de 18 anos.
          </div>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT (com Suspense para useSearchParams)
// =============================================================================

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-white/60">Carregando...</div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
