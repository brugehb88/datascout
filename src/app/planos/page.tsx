'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Crown, Zap, ArrowLeft, Sparkles, Shield, History, FileText, Bell, Globe, Timer } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Subscription {
  plan: string
  status: string
  chosen_plan: string
}

const planos = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 47,
    cor: 'emerald',
    icone: Zap,
    descricao: 'Ideal pra quem quer começar com análises sólidas nas ligas principais.',
    features: [
      { icone: Sparkles, texto: '30 análises pré-jogo por mês' },
      { icone: Globe, texto: '10 ligas principais (BR + Europa top 5)' },
      { icone: Shield, texto: 'Veredito com IA por mercado' },
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

  useEffect(() => {
    async function carregar() {
      if (!user) return
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, chosen_plan')
        .eq('user_id', user.id)
        .single()

      if (!error && data) setSub(data)
      setLoading(false)
    }
    if (!authLoading) carregar()
  }, [user, authLoading])

  async function handleEscolherPlano(planoId: string) {
    if (!user) return

    // Se trial, salva o plano escolhido
    if (sub?.status === 'trialing') {
      await supabase
        .from('subscriptions')
        .update({ chosen_plan: planoId })
        .eq('user_id', user.id)

      setSub(prev => prev ? { ...prev, chosen_plan: planoId } : prev)
      return
    }

    // TODO: quando Stripe estiver pronto, redireciona pro checkout
    // Por agora, salva a escolha
    await supabase
      .from('subscriptions')
      .update({ chosen_plan: planoId })
      .eq('user_id', user.id)

    setSub(prev => prev ? { ...prev, chosen_plan: planoId } : prev)
  }

  if (authLoading || loading) {
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
        {/* Header */}
        <button
          onClick={() => router.push('/perfil')}
          className="text-gray-500 text-sm hover:text-gray-300 transition-colors mb-4"
        >
          ← Voltar ao perfil
        </button>

        <div className="mb-8">
          <h1 className="text-white font-bold text-xl mb-1">Escolha seu plano</h1>
          <p className="text-gray-500 text-sm">
            {sub?.status === 'trialing'
              ? 'Selecione o plano que será ativado ao final do seu trial.'
              : 'Assine para acessar análises completas com veredito de IA.'}
          </p>
        </div>

        {/* Cards de plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planos.map((plano) => {
            const selecionado = sub?.chosen_plan === plano.id
            const planoAtual = sub?.plan === plano.id && sub?.status === 'active'
            const Icone = plano.icone
            const corBorder = plano.cor === 'amber' ? 'border-amber-500/30' : 'border-emerald-500/30'
            const corBg = plano.cor === 'amber' ? 'bg-amber-500/5' : 'bg-emerald-500/5'
            const corTexto = plano.cor === 'amber' ? 'text-amber-400' : 'text-emerald-400'
            const corBtn = plano.cor === 'amber'
              ? 'bg-amber-500 hover:bg-amber-400 text-gray-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950'

            return (
              <div
                key={plano.id}
                className={`bg-gray-900/80 border rounded-2xl p-5 flex flex-col transition-all ${
                  selecionado || plano.destaque
                    ? `${corBorder} ${corBg}`
                    : 'border-gray-800'
                }`}
              >
                {/* Header do plano */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icone size={18} className={corTexto} />
                    <span className="text-white font-bold text-lg">{plano.nome}</span>
                  </div>
                  {plano.destaque && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Mais popular
                    </span>
                  )}
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
                {planoAtual ? (
                  <div className="w-full text-center text-sm text-gray-500 py-3 border border-gray-800 rounded-xl">
                    Plano atual
                  </div>
                ) : selecionado && sub?.status === 'trialing' ? (
                  <div className={`w-full text-center text-sm ${corTexto} py-3 border ${corBorder} rounded-xl font-medium`}>
                    ✓ Selecionado para após o trial
                  </div>
                ) : (
                  <button
                    onClick={() => handleEscolherPlano(plano.id)}
                    className={`w-full font-bold text-sm py-3 rounded-xl transition-colors ${corBtn}`}
                  >
                    {sub?.status === 'trialing' ? 'Selecionar este plano' : 'Assinar agora'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Nota sobre trial */}
        {sub?.status === 'trialing' && (
          <p className="text-gray-600 text-xs text-center mt-6">
            Você não será cobrado durante o período de trial. A cobrança inicia automaticamente ao final dos 7 dias no plano selecionado.
          </p>
        )}
      </div>
    </MainLayout>
  )
}