"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  Check,
  Lock,
  Shield,
  Clock,
  CreditCard,
  ArrowLeft,
  Star,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 47,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ||
      "price_1TWio1Rpq7vHDxvslNAcxhRA",
    description:
      "Ideal pra quem quer começar com análises sólidas nas ligas principais.",
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
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ||
      "price_1TWioGRpq7vHDxvs0kYn5nzw",
    description:
      "Pra quem leva a sério. Todas as ligas, histórico e análise de intervalo.",
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

const TRUST_BADGES = [
  { icon: Lock, label: "Pagamento Seguro" },
  { icon: Shield, label: "Stripe Encryption" },
  { icon: Clock, label: "7 Dias Grátis" },
  { icon: CreditCard, label: "Cancele Quando Quiser" },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = (searchParams.get("plan") || "pro") as "starter" | "pro";
  const canceled = searchParams.get("canceled") === "true";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    canceled ? "Pagamento cancelado. Você não foi cobrado." : null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const plan = PLANS[planId] || PLANS.pro;

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Preencha email e senha para continuar.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Cria conta + checkout session
      const response = await fetch("/api/auth/signup-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || null,
          whatsapp: whatsapp.replace(/\D/g, "") || null,
          priceId: plan.priceId,
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "user_exists") {
          setError(
            "Este e-mail já está cadastrado. Faça login para continuar."
          );
        } else {
          throw new Error(data.error || "Erro ao processar cadastro");
        }
        setLoading(false);
        return;
      }

      // Salva email + senha temporariamente no sessionStorage
      // para auto-login após retorno do Stripe
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pending_login_email", email);
        sessionStorage.setItem("pending_login_password", password);
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
      {/* Header */}
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
              <span className="font-bold">Cadastro</span>
            </div>
            <div className="w-12 h-px bg-[#00C853]" />
            <div className="flex items-center gap-2 text-white/40">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">
                2
              </div>
              <span>Pagamento</span>
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
          {/* COLUNA ESQUERDA - Plano (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                Crie sua conta
                <br />e <span className="text-[#00C853]">comece grátis</span>.
              </h1>
              <p className="text-white/60">
                7 dias de trial. Sem cobrança hoje.
              </p>
            </div>

            <div
              className={`p-6 rounded-lg border ${
                plan.highlight
                  ? "bg-gradient-to-br from-[#00C853]/10 to-transparent border-[#00C853]/30"
                  : "bg-zinc-950 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-xl font-black">Plano {plan.name}</h2>
                    {plan.highlight && (
                      <span className="bg-[#00C853] text-black text-xs font-black px-2 py-0.5">
                        MAIS ESCOLHIDO
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-xs">{plan.description}</p>
                </div>
                <div className="text-right flex-shrink-0 whitespace-nowrap">
                  <div className="text-2xl font-black">R$ {plan.price}</div>
                  <div className="text-white/40 text-xs">/mês</div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
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
                ⬆ Upgrade para Pro (R$ 97/mês)
              </Link>
            )}

            {/* Resumo */}
            <div className="bg-zinc-950 border border-white/10 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Plano {plan.name}</span>
                  <span className="font-bold">R$ {plan.price}/mês</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Trial gratuito</span>
                  <span className="text-[#00C853] font-bold">7 dias</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/5">
                  <span className="text-white/60">Cobrança hoje</span>
                  <span className="font-black text-lg">R$ 0,00</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - Form (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-6 md:p-8">
              <h2 className="text-2xl font-black mb-2">
                Crie sua conta DataScout
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Você já estará logado quando finalizar o pagamento.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    E-mail <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded text-white placeholder:text-white/30 focus:border-[#00C853] focus:outline-none transition"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Senha <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded text-white placeholder:text-white/30 focus:border-[#00C853] focus:outline-none transition pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nome (opcional) */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nome completo{" "}
                    <span className="text-white/40 text-xs font-normal">
                      (opcional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="João Silva"
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded text-white placeholder:text-white/30 focus:border-[#00C853] focus:outline-none transition"
                  />
                </div>

                {/* WhatsApp (opcional) */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    WhatsApp{" "}
                    <span className="text-white/40 text-xs font-normal">
                      (opcional, para suporte)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded text-white placeholder:text-white/30 focus:border-[#00C853] focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00C853] hover:bg-[#00E676] text-black font-black py-4 rounded transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando sua conta...
                    </>
                  ) : (
                    <>
                      Continuar para pagamento →
                    </>
                  )}
                </button>

                <p className="text-xs text-white/40 text-center">
                  Ao criar sua conta, você concorda com nossos termos.
                  <br />
                  Você não será cobrado nos primeiros 7 dias.
                </p>
              </form>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-2 text-xs text-white/40">
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

              <div className="mt-4 text-center text-xs text-white/30">
                Já tem conta?{" "}
                <Link
                  href="/login"
                  className="text-[#00C853] hover:underline font-bold"
                >
                  Faça login
                </Link>
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-6 bg-zinc-950 border border-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 text-[#00C853]"
                    fill="currentColor"
                  />
                ))}
                <span className="text-xs text-white/60 ml-2">
                  4.9 / 5 — apostadores satisfeitos
                </span>
              </div>
              <p className="text-white/70 text-xs italic">
                &quot;Em 2 meses recuperei o investimento. A análise do
                intervalo é o diferencial.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8 text-center text-white/30 text-xs">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-2">
            © {new Date().getFullYear()} DataScout. Todos os direitos
            reservados.
          </div>
          <div>Aposte com responsabilidade. Apenas para maiores de 18 anos.</div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#00C853] animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
