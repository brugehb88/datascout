"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Brain,
  Clock,
  Zap,
  Shield,
  Target,
  Activity,
  Check,
  ArrowRight,
  ChevronDown,
  Timer,
  Trophy,
  Database,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// =============================================================================
// CONSTANTS
// =============================================================================

const STATS = [
  { value: "50k+", label: "Partidas Analisadas" },
  { value: "150+", label: "Ligas Cobertas" },
  { value: "24/7", label: "Análise em Tempo Real" },
  { value: "+12%", label: "ROI Médio dos Usuários" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Probabilidades Reais",
    description:
      "Cálculo estatístico baseado em milhares de partidas, não em achismo de comentarista.",
  },
  {
    icon: Timer,
    title: "Análise no Intervalo",
    description:
      "Receba as novas probabilidades no meio-tempo com base no que está acontecendo em campo.",
    highlight: true,
  },
  {
    icon: Database,
    title: "Histórico Completo",
    description:
      "Acesse o histórico de confronto, performance e tendências de cada time.",
  },
  {
    icon: Activity,
    title: "Dados em Tempo Real",
    description:
      "Posse de bola, finalizações, escanteios — tudo atualizado conforme a partida acontece.",
  },
  {
    icon: Brain,
    title: "Análise Inteligente",
    description:
      "Modelo proprietário que cruza dezenas de variáveis para te dar a melhor leitura.",
  },
  {
    icon: Trophy,
    title: "Top 5 Ligas + Brasileirão",
    description:
      "Premier League, La Liga, Serie A, Bundesliga, Ligue 1 e Brasileirão completos.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Escolha a partida",
    description:
      "Selecione qualquer jogo das principais ligas do mundo na nossa plataforma.",
  },
  {
    number: "02",
    title: "Veja as probabilidades",
    description:
      "Receba análise pré-jogo com probabilidades fundamentadas em histórico real.",
  },
  {
    number: "03",
    title: "Acompanhe no intervalo",
    description:
      "No meio-tempo, receba uma nova análise baseada no que aconteceu nos primeiros 45min.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "29",
    period: "/mês",
    description: "Para quem quer começar a apostar com inteligência.",
    features: [
      "Análise pré-jogo das principais ligas",
      "Probabilidades calculadas",
      "Histórico básico de confrontos",
      "Suporte por e-mail",
    ],
    cta: "Começar com Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: "79",
    period: "/mês",
    description: "Para quem quer dominar o intervalo e maximizar acertos.",
    features: [
      "Tudo do Starter, e mais:",
      "Análise no intervalo (meio-tempo)",
      "Dados em tempo real durante a partida",
      "Histórico completo + tendências",
      "Análise de mercados específicos (escanteios, cartões)",
      "Suporte prioritário no WhatsApp",
    ],
    cta: "Quero o Pro",
    highlight: true,
    badge: "MAIS ESCOLHIDO",
  },
];

const FAQS = [
  {
    q: "O DataScout garante que vou ganhar minhas apostas?",
    a: "Não. Nenhuma plataforma séria pode garantir ganhos em apostas esportivas. O que entregamos são análises probabilísticas fundamentadas em dados reais para que você tome decisões mais inteligentes — não baseadas em achismo. Aposte sempre com responsabilidade.",
  },
  {
    q: "Como funciona a análise no intervalo?",
    a: "Durante o intervalo da partida, nosso modelo recalcula as probabilidades considerando tudo que aconteceu nos primeiros 45 minutos: posse, finalizações, dominância, escanteios, cartões, lesões, etc. Você recebe uma nova projeção do segundo tempo em poucos segundos.",
  },
  {
    q: "Quais ligas estão disponíveis?",
    a: "Cobrimos as principais ligas do mundo: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirão Série A e B, Champions League, Libertadores, e mais 140+ competições.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa, sem letras miúdas. Cancele com um clique direto na sua conta a qualquer momento.",
  },
  {
    q: "Em quanto tempo começo a usar?",
    a: "Imediatamente. Após a confirmação do pagamento (instantânea via cartão), você já tem acesso completo à plataforma.",
  },
  {
    q: "É seguro? Meus dados estão protegidos?",
    a: "Sim. Usamos Stripe (mesma plataforma da Apple, Google e Amazon) para processar pagamentos. Não armazenamos dados de cartão. Sua conta é protegida com criptografia de ponta a ponta.",
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#00C853] text-black px-3 py-1 font-black text-xl tracking-tight">
            DATA
          </span>
          <span className="text-white font-black text-xl tracking-tight">
            SCOUT
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition">
            Recursos
          </a>
          <a href="#how-it-works" className="hover:text-white transition">
            Como funciona
          </a>
          <a href="#pricing" className="hover:text-white transition">
            Planos
          </a>
          <a href="#faq" className="hover:text-white transition">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-white/70 hover:text-white transition"
          >
            Entrar
          </Link>
          <Link
            href="/planos"
            className="bg-[#00C853] hover:bg-[#00E676] text-black font-bold text-sm px-5 py-2.5 transition-all hover:scale-105"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00C853]/10 rounded-full blur-[120px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#00C853]/10 border border-[#00C853]/20 px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#00C853]" />
            <span className="text-[#00C853] text-sm font-medium tracking-wide">
              INTELIGÊNCIA ESPORTIVA
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
            ENQUANTO ELES{" "}
            <span className="text-white/40 line-through">CHUTAM</span>,
            <br />
            VOCÊ <span className="text-[#00C853]">CALCULA</span>.
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-xl">
            DataScout analisa milhares de dados em tempo real e calcula as
            probabilidades reais de cada partida —{" "}
            <span className="text-white font-semibold">
              antes do jogo e no intervalo
            </span>
            . Aposte fundamentado, não no impulso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href="/planos"
              className="group bg-[#00C853] hover:bg-[#00E676] text-black font-bold px-8 py-4 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Começar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <a
              href="#how-it-works"
              className="border border-white/20 hover:border-white/40 text-white font-bold px-8 py-4 transition flex items-center justify-center gap-2"
            >
              Ver como funciona
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00C853]" />
              Sem fidelidade
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00C853]" />
              Cancele quando quiser
            </div>
          </div>
        </motion.div>

        {/* Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#00C853] rounded-full animate-pulse" />
                <span className="text-xs text-white/60 font-medium">
                  ANÁLISE AO VIVO
                </span>
              </div>
              <span className="text-xs text-white/40">2º TEMPO • 67'</span>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-1">Real Madrid</div>
                  <div className="text-4xl font-black text-white">2</div>
                </div>
                <div className="text-white/30 text-sm">×</div>
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-1">Barcelona</div>
                  <div className="text-4xl font-black text-white">1</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Vitória Real Madrid</span>
                  <span className="text-[#00C853] font-bold">68%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00C853]"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Empate</span>
                  <span className="text-white/80 font-bold">22%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40"
                    style={{ width: "22%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Vitória Barcelona</span>
                  <span className="text-white/60 font-bold">10%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/30"
                    style={{ width: "10%" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-white/40 mb-1">xG Real</div>
                <div className="text-sm font-bold text-white">2.47</div>
              </div>
              <div>
                <div className="text-xs text-white/40 mb-1">Posse</div>
                <div className="text-sm font-bold text-white">61%</div>
              </div>
              <div>
                <div className="text-xs text-white/40 mb-1">Finalizações</div>
                <div className="text-sm font-bold text-white">14</div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 bg-[#00C853] text-black px-4 py-2 font-black text-sm shadow-lg">
            +12% ROI
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="bg-[#00C853] py-8 border-y border-black/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-black text-black mb-1">
              {stat.value}
            </div>
            <div className="text-xs md:text-sm text-black/70 font-medium uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  const pains = [
    "Você passa horas pesquisando estatísticas espalhadas em 5 sites diferentes",
    "Não tem como saber se a partida virou no intervalo",
    "Aposta no instinto e percebe tarde demais que perdeu dinheiro",
    "As casas de apostas têm os dados. Você só tem o palpite.",
  ];

  return (
    <section className="py-24 bg-black border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#00C853] text-sm font-bold tracking-widest uppercase mb-4 block">
            O Problema
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Toda vez que você aposta no
            <br />
            <span className="text-white/30">instinto, você perde.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3 p-6 bg-zinc-950 border border-white/5"
            >
              <div className="w-6 h-6 bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-sm">✕</span>
              </div>
              <p className="text-white/80 text-base leading-relaxed">{pain}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-2xl md:text-3xl font-bold text-white">
            Existe um jeito melhor.{" "}
            <span className="text-[#00C853]">E você acabou de achar.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-zinc-950 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#00C853] text-sm font-bold tracking-widest uppercase mb-4 block">
            Como Funciona
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Da escolha à decisão.
            <br />
            Em 3 passos.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative p-8 bg-black border border-white/10 hover:border-[#00C853]/30 transition-colors"
            >
              <div className="text-7xl font-black text-[#00C853]/20 mb-4">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#00C853] text-sm font-bold tracking-widest uppercase mb-4 block">
            Recursos
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Tudo que você precisa.
            <br />
            <span className="text-[#00C853]">Em um só lugar.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`p-6 border transition-all hover:scale-[1.02] ${
                  feature.highlight
                    ? "bg-[#00C853]/5 border-[#00C853]/30"
                    : "bg-zinc-950 border-white/10 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center mb-4 ${
                    feature.highlight
                      ? "bg-[#00C853] text-black"
                      : "bg-white/5 text-[#00C853]"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
                {feature.highlight && (
                  <span className="inline-block mt-4 text-xs bg-[#00C853] text-black px-2 py-1 font-bold">
                    EXCLUSIVO PRO
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HalfTimeFeature() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#00C853]/10 via-black to-black border-t border-white/5 overflow-hidden relative">
      <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[600px] h-[600px] bg-[#00C853]/20 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#00C853] text-black px-3 py-1 mb-6 font-bold text-xs tracking-wide">
            <Timer className="w-4 h-4" />
            EXCLUSIVO DO PLANO PRO
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-[0.95]">
            NO INTERVALO,
            <br />
            <span className="text-[#00C853]">A PARTIDA</span>
            <br />
            É OUTRA.
          </h2>

          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            Enquanto outros vão tomar café, você recebe uma{" "}
            <span className="text-white font-semibold">
              análise completamente nova do segundo tempo
            </span>{" "}
            — calculada com base em tudo que aconteceu nos primeiros 45 minutos:
            posse, finalizações, dominância, escanteios, lesões.
          </p>

          <ul className="space-y-3 mb-8">
            {[
              "Recalculo automático no minuto 45",
              "Probabilidades atualizadas em segundos",
              "Mercados específicos do segundo tempo",
              "Análise contextual da partida",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/80">
                <Check className="w-5 h-5 text-[#00C853] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/planos"
            className="inline-flex items-center gap-2 bg-[#00C853] hover:bg-[#00E676] text-black font-bold px-8 py-4 transition-all hover:scale-105"
          >
            Quero o plano Pro
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="relative">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <span className="text-xs text-white/60 font-bold tracking-wider">
                ANÁLISE INTERVALO
              </span>
              <span className="text-xs text-[#00C853] font-bold">ATIVO</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 p-3 text-center">
                <div className="text-xs text-white/40 mb-1">PRÉ-JOGO</div>
                <div className="text-sm font-bold text-white/60">45% / 30%</div>
              </div>
              <div className="bg-[#00C853]/10 border border-[#00C853]/30 p-3 text-center">
                <div className="text-xs text-[#00C853] mb-1">INTERVALO</div>
                <div className="text-sm font-bold text-white">68% / 22%</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/60 py-2 border-b border-white/5">
                <span>Posse 1º tempo</span>
                <span className="text-white font-bold">61% / 39%</span>
              </div>
              <div className="flex justify-between text-white/60 py-2 border-b border-white/5">
                <span>Finalizações no gol</span>
                <span className="text-white font-bold">7 / 2</span>
              </div>
              <div className="flex justify-between text-white/60 py-2 border-b border-white/5">
                <span>xG acumulado</span>
                <span className="text-white font-bold">1.84 / 0.41</span>
              </div>
              <div className="flex justify-between text-white/60 py-2">
                <span>Pressão no campo adv.</span>
                <span className="text-[#00C853] font-bold">ALTA</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#00C853]/10 border border-[#00C853]/30">
              <div className="text-xs text-[#00C853] font-bold mb-1">
                💡 RECOMENDAÇÃO
              </div>
              <div className="text-sm text-white">
                Tendência clara de gol no 2º tempo. Mercado{" "}
                <span className="font-bold">Mais 2.5 gols</span> com alta
                probabilidade.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const items = [
    { before: "Apostas no achismo", after: "Decisões com base em dados reais" },
    { before: "Pesquisa em 5 sites", after: "Tudo em uma única plataforma" },
    {
      before: "Sem análise no intervalo",
      after: "Probabilidades atualizadas em segundos",
    },
    {
      before: "Resultados aleatórios",
      after: "Estratégia consistente e mensurável",
    },
    { before: "Tempo perdido pesquisando", after: "Análise pronta em segundos" },
  ];

  return (
    <section className="py-24 bg-zinc-950 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            A diferença é{" "}
            <span className="text-[#00C853]">brutal.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/5">
          <div className="bg-black p-8">
            <div className="text-red-500/80 text-sm font-bold tracking-widest uppercase mb-6">
              Sem DataScout
            </div>
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.before}
                  className="flex items-start gap-3 text-white/60"
                >
                  <span className="text-red-500/60 flex-shrink-0">✕</span>
                  <span className="line-through">{item.before}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black p-8 border-l-2 border-[#00C853]">
            <div className="text-[#00C853] text-sm font-bold tracking-widest uppercase mb-6">
              Com DataScout
            </div>
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.after}
                  className="flex items-start gap-3 text-white"
                >
                  <Check className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{item.after}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-black border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#00C853] text-sm font-bold tracking-widest uppercase mb-4 block">
            Planos
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Escolha seu nível
            <br />
            de inteligência.
          </h2>
          <p className="text-white/60 text-lg">
            Sem fidelidade. Cancele quando quiser. Sem letras miúdas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 ${
                plan.highlight
                  ? "bg-gradient-to-br from-[#00C853]/10 to-transparent border-2 border-[#00C853]"
                  : "bg-zinc-950 border border-white/10"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C853] text-black text-xs font-black px-4 py-1 tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-white/60 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-white/5">
                <span className="text-sm text-white/60">R$</span>
                <span className="text-6xl font-black text-white">
                  {plan.price}
                </span>
                <span className="text-white/60">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-white/80 text-sm"
                  >
                    <Check className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/planos"
                className={`block text-center font-bold py-4 transition-all ${
                  plan.highlight
                    ? "bg-[#00C853] hover:bg-[#00E676] text-black hover:scale-105"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-sm text-white/40">
          🔒 Pagamento seguro processado pela Stripe. Sem armazenamento de dados
          de cartão.
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-zinc-950 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#00C853] text-sm font-bold tracking-widest uppercase mb-4 block">
            Dúvidas
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Perguntas frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-black border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition"
              >
                <span className="text-white font-bold pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#00C853] flex-shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-white/70 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#00C853]/10 rounded-full blur-[150px]" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[0.95]">
          Pronto para apostar
          <br />
          <span className="text-[#00C853]">com inteligência?</span>
        </h2>

        <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
          Junte-se a milhares de apostadores que já decidem com dados, não com
          sorte.
        </p>

        <Link
          href="/planos"
          className="inline-flex items-center gap-3 bg-[#00C853] hover:bg-[#00E676] text-black font-black text-lg px-10 py-5 transition-all hover:scale-105"
        >
          Começar agora
          <ArrowRight className="w-6 h-6" />
        </Link>

        <p className="mt-6 text-sm text-white/40">
          Sem cartão de crédito requerido para criar conta · Cancele quando
          quiser
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#00C853] text-black px-3 py-1 font-black text-xl tracking-tight">
                DATA
              </span>
              <span className="text-white font-black text-xl tracking-tight">
                SCOUT
              </span>
            </div>
            <p className="text-white/50 text-sm max-w-md">
              A plataforma de inteligência esportiva que transforma dados em
              decisões fundamentadas.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Planos
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Suporte
            </h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>
                <a href="#faq" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@datascout.com.br"
                  className="hover:text-white transition"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div>
            © {new Date().getFullYear()} DataScout. Todos os direitos
            reservados.
          </div>
          <div className="text-center md:text-right">
            <strong className="text-white/60">Aposte com responsabilidade.</strong>{" "}
            Apostas envolvem risco. Apenas para maiores de 18 anos.
          </div>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function LandingPage() {
  return (
    <main className="bg-black min-h-screen">
      <Header />
      <Hero />
      <StatsBar />
      <Problem />
      <HowItWorks />
      <Features />
      <HalfTimeFeature />
      <Comparison />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
