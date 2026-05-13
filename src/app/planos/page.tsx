'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Zap, Sparkles, Shield, History, FileText, Bell, Globe, Timer, Check } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Subscription {
  plan: string
  status: string
  chosen_plan: string
  stripe_subscription_id: string | null
}

const planos = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 47,
    priceId: 'price_1TWio1Rpq7vHDxvslNAcxhRA',
    cor: 'emerald',
    icone: Zap,
    descricao: 'Ideal pra quem quer começar com análises sólidas nas ligas principais.',
    features: [
      { icone: Sparkles, texto: '30 análises pré-jogo por mês' },
      { icone: Globe, texto: '10 ligas principais (BR + Europa top 5)' },
      { icone: Shield, texto: 'Veredito estatístico potencializado por IA' },
    ],
    ligas: [
      'Brasileirão Série A', 'Brasileirão Série B', 'Copa do Brasil',
      'Libertadores', 'Sul-Americana',
      'Premier League', 'La Liga', 'Serie A Italiana', 'Bundesliga', 'Ligue 1',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 97,
    priceId: 'price_1TWioGRpq7vHDxvs0kYn5nzw',
    cor: 'amber',
    icone: Crown,
    destaque: true,
    descricao: 'Pra quem leva a sério. Todas as ligas, histórico e análise de intervalo.',
    features: [
      { icone: Sparkles, texto: '150 análises pré-jogo por mês' },
      { icone: Globe, texto: '20+ ligas (todas disponíveis)' },
      { icone: History, texto: 'Histórico completo de análises' },
      { icone: FileText, texto: 'Exportar análises em PDF' },
      { icone: Bell, texto: 'Alertas de jogos com alta confiança' },
      { icone: Timer, texto: 'Análise de intervalo (halftime)' },
    ],
    ligas: [
      'Tudo do Starter +',
      'Champions League', 'Europa League', 'Conference League',
      'MLS', 'Liga MX', 'Eredivisie', 'Primeira Liga (Portugal)',
      'Scottish Premiership', 'Turkish Süper Lig', 'Saudi Pro League',
      'Copa do Mundo / Eurocopa (quando ativo)',
    ],
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [planoExpandido, setPlanoExpandido] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    async function carregar() {
      if (!user) return
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, chosen_plan, stripe_subscription_id')
        .eq('user_id', user.id)
        .single()

      if (!error && data) setSub(data)
      setLoading(false)
    }
    if (!authLoading) carregar()
  }, [user, authLoading])

  async function handleEscolherPlano(planoId: string) {
    if (!user || processando) return
    setProcessando(true)

    try {
      // Se já tem assinatura ativa, redireciona pro portal do Stripe
      if (sub?.stripe_subscription_id && sub?.status === 'active') {
        const response = await fetch('/api/stripe/portal', { method: 'POST' })
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
      }

      // Senão, cria novo checkout (antecipar trial ou nova assinatura)
      const planoConfig = planos.find(p => p.id === planoId)
      const priceId = planoConfig?.priceId
      const skipTrial = sub?.status === 'trialing'

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planId: planoId, skipTrial }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Erro no checkout:', data.error)
      }
    } catch (err) {
      console.error('Erro ao iniciar checkout:', err)
    } finally {
      setProcessando(false)
    }
  }

  const emTrial = sub?.status === 'trialing'
  const assinaturaAtiva = sub?.status === 'active'

  // Plano escolhido: durante trial, usa chosen_plan; se ativo, usa plan
  // Fallback: se chosen_plan for null/undefined, usa plan, depois 'starter'
  const planoEscolhidoId = assinaturaAtiva
    ? (sub?.plan || 'starter')
    : (sub?.chosen_plan || sub?.plan || 'starter')

  if (loading || authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-3xl pt-2 md:pt-0">
        <button
          onClick={() => router.push('/perfil')}
          className="text-gray-500 text-sm hover:text-gray-300 transition-colors mb-4"
        >
          ← Voltar ao perfil
        </button>

        <div className="mb-8">
          <h1 className="text-white font-bold text-xl mb-1">Escolha seu plano</h1>
          <p className="text-gray-500 text-sm">
            {emTrial
              ? `Você está no trial gratuito. Seu plano ${planoEscolhidoId === 'pro' ? 'Pro' : 'Starter'} será ativado automaticamente ao final do trial, ou antecipe agora.`
              : assinaturaAtiva
                ? 'Gerencie sua assinatura ou faça upgrade/downgrade.'
                : 'Assine para acessar análises completas.'}
          </p>
        </div>

        {/* Cards de plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planos.map((plano) => {
            const Icone = plano.icone

            // Durante trial: destaca o plano ESCOLHIDO (chosen_plan)
            // Se ativo: destaca o plano ATUAL
            const isPlanoEscolhido = planoEscolhidoId === plano.id
            const isPlanoAtivo = assinaturaAtiva && sub?.plan === plano.id

            const corBorder = isPlanoEscolhido
              ? plano.cor === 'amber' ? 'border-amber-500/40' : 'border-emerald-500/40'
              : 'border-gray-800'
            const corBg = isPlanoEscolhido
              ? plano.cor === 'amber' ? 'bg-amber-500/5' : 'bg-emerald-500/5'
              : ''
            const corTexto = plano.cor === 'amber' ? 'text-amber-400' : 'text-emerald-400'
            const corBtn = plano.cor === 'amber'
              ? 'bg-amber-500 hover:bg-amber-400 text-gray-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950'

            // Label do botão
            let btnLabel = 'Assinar agora'
            let btnDisabled = false

            if (isPlanoAtivo) {
              btnLabel = 'Plano atual'
              btnDisabled = true
            } else if (emTrial && isPlanoEscolhido) {
              btnLabel = 'Antecipar assinatura'
            } else if (emTrial && !isPlanoEscolhido) {
              btnLabel = 'Mudar para este plano'
            } else if (assinaturaAtiva && plano.id === 'pro') {
              btnLabel = 'Fazer upgrade para Pro'
            } else if (assinaturaAtiva && plano.id === 'starter') {
              btnLabel = 'Fazer downgrade'
            }

            // Badge label
            let badgeLabel = ''
            if (emTrial && isPlanoEscolhido) badgeLabel = 'Seu plano'
            else if (isPlanoAtivo) badgeLabel = 'Atual'
            else if (plano.destaque && !isPlanoEscolhido) badgeLabel = 'Mais popular'

            return (
              <div
                key={plano.id}
                className={`bg-gray-900/80 border rounded-2xl p-5 flex flex-col transition-all ${corBorder} ${corBg}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icone size={18} className={corTexto} />
                    <span className="text-white font-bold text-lg">{plano.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badgeLabel && (
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1 ${
                        plano.cor === 'amber'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {(isPlanoEscolhido || isPlanoAtivo) && <Check size={10} />}
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-4">{plano.descricao}</p>

                {/* Preço */}
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-white text-3xl font-bold">R$ {plano.preco}</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-3 mb-5 flex-1">
                  {plano.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <f.icone size={14} className={`${corTexto} mt-0.5 flex-shrink-0`} />
                      <span className="text-gray-300 text-sm">{f.texto}</span>
                    </div>
                  ))}
                </div>

                {/* Ligas */}
                <button
                  onClick={() => setPlanoExpandido(planoExpandido === plano.id ? null : plano.id)}
                  className="text-gray-500 text-xs hover:text-gray-300 transition-colors mb-4 text-left"
                >
                  {planoExpandido === plano.id ? '▾ Ocultar ligas' : '▸ Ver ligas incluídas'}
                </button>
                {planoExpandido === plano.id && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {plano.ligas.map((liga, i) => (
                      <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                        {liga}
                      </span>
                    ))}
                  </div>
                )}

                {/* Botão */}
                {btnDisabled ? (
                  <div className={`w-full text-center text-sm py-3 rounded-xl border font-medium ${
                    plano.cor === 'amber'
                      ? 'text-amber-400 border-amber-500/20'
                      : 'text-emerald-400 border-emerald-500/20'
                  }`}>
                    <span className="flex items-center justify-center gap-1.5">
                      <Check size={14} />
                      Plano atual
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEscolherPlano(plano.id)}
                    disabled={processando}
                    className={`w-full font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${corBtn}`}
                  >
                    {processando ? 'Redirecionando...' : btnLabel}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Nota */}
        {emTrial && (
          <p className="text-gray-600 text-xs text-center mt-6">
            Ao antecipar, a cobrança acontece imediatamente e o trial é encerrado.
            Caso não antecipe, o plano é ativado automaticamente ao final do período.
          </p>
        )}
      </div>
    </MainLayout>
  )
}
