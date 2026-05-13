'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Zap, Calendar, BarChart2, LogOut, ChevronRight, CreditCard, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Subscription {
  plan: string
  status: string
  analyses_used: number
  analyses_limit: number
  trial_ends_at: string | null
  chosen_plan: string
  current_period_end: string | null
  stripe_subscription_id: string | null
}

const planConfig: Record<string, { nome: string; cor: string; icone: any }> = {
  trial: { nome: 'Trial gratuito', cor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icone: Zap },
  starter: { nome: 'Starter', cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icone: Zap },
  pro: { nome: 'Pro', cor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icone: Crown },
  canceled: { nome: 'Cancelado', cor: 'text-red-400 bg-red-500/10 border-red-500/20', icone: XCircle },
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [secao, setSecao] = useState<'menu' | 'assinatura'>('menu')
  const [cancelando, setCancelando] = useState(false)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    async function carregar() {
      if (!user) return
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (!error && data) setSub(data)
      setLoading(false)
    }
    if (!authLoading) carregar()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </MainLayout>
    )
  }

  if (!user) { router.push('/login'); return null }

  const trialAtivo = sub?.status === 'trialing'
  const assinaturaAtiva = sub?.status === 'active'
  const cancelado = sub?.status === 'canceled'

  const planoExibido = assinaturaAtiva
    ? (sub?.plan ?? 'starter')
    : cancelado ? 'canceled'
    : trialAtivo ? 'trial'
    : (sub?.plan ?? 'trial')

  const plano = planConfig[planoExibido] ?? planConfig['trial']
  const PlanoIcone = plano.icone

  const chosenPlan = sub?.chosen_plan || sub?.plan || 'starter'
  const chosenPlanConfig = planConfig[chosenPlan] ?? planConfig['starter']
  const chosenPlanPreco = chosenPlan === 'pro' ? 'R$ 49,90' : 'R$ 29,90'

  const diasRestantes = sub?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const percentUso = sub ? Math.round((sub.analyses_used / sub.analyses_limit) * 100) : 0

  async function abrirPortalStripe() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao abrir portal. Tente novamente.' })
    }
  }

  async function cancelarTrial() {
    setCancelando(true)
    setMensagem(null)
    try {
      const res = await fetch('/api/stripe/cancel-trial', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSub(prev => prev ? { ...prev, status: 'canceled' } : null)
        setMensagem({ tipo: 'sucesso', texto: 'Trial cancelado. Seu acesso foi encerrado.' })
        setConfirmandoCancelamento(false)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao cancelar. Tente novamente.' })
    } finally {
      setCancelando(false)
    }
  }

  // Seção: Assinatura completa
  if (secao === 'assinatura') {
    return (
      <MainLayout>
        <div className="max-w-2xl pt-2 md:pt-0">
          <button onClick={() => setSecao('menu')} className="text-gray-500 text-sm hover:text-gray-300 transition-colors mb-4">
            ← Voltar ao perfil
          </button>

          <h1 className="text-white font-bold text-xl mb-6">Assinatura e planos</h1>

          {/* Mensagem de feedback */}
          {mensagem && (
            <div className={`flex items-center gap-2 p-4 rounded-xl mb-4 ${
              mensagem.tipo === 'sucesso'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {mensagem.tipo === 'sucesso'
                ? <CheckCircle2 size={16} />
                : <AlertTriangle size={16} />}
              <span className="text-sm">{mensagem.texto}</span>
            </div>
          )}

          {/* Status atual */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PlanoIcone size={16} className={plano.cor.split(' ')[0]} />
                <span className="text-white font-semibold">Status atual</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${plano.cor}`}>
                {plano.nome}
              </span>
            </div>

            {/* Trial ativo */}
            {trialAtivo && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={13} className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {diasRestantes} {diasRestantes === 1 ? 'dia restante' : 'dias restantes'} de trial
                  </span>
                </div>
                <p className="text-blue-300/60 text-xs">
                  Plano que será ativado: <span className={`font-medium ${chosenPlanConfig.cor.split(' ')[0]}`}>{chosenPlanConfig.nome}</span> — {chosenPlanPreco}/mês
                </p>
              </div>
            )}

            {/* Assinatura ativa */}
            {assinaturaAtiva && sub?.current_period_end && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-emerald-400 text-sm">
                  Assinatura ativa até {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {/* Cancelado */}
            {cancelado && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">
                  Assinatura cancelada. Assine novamente para recuperar o acesso.
                </p>
              </div>
            )}

            {/* Uso de análises */}
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={13} className="text-gray-500" />
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Uso do mês</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Análises geradas</span>
              <span className="text-white text-sm font-semibold">
                {sub?.analyses_used ?? 0} / {sub?.analyses_limit ?? 3}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentUso >= 90 ? 'bg-red-500' : percentUso >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(percentUso, 100)}%` }}
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3">
            {/* Upgrade/Mudar plano */}
            {!cancelado && (
              <button
                onClick={() => router.push('/planos')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Crown size={16} />
                {trialAtivo ? 'Antecipar assinatura' : assinaturaAtiva ? 'Mudar plano' : 'Assinar agora'}
              </button>
            )}

            {/* Portal Stripe — gerenciar pagamento */}
            {assinaturaAtiva && sub?.stripe_subscription_id && (
              <button
                onClick={abrirPortalStripe}
                className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-sm py-3 rounded-xl transition-colors"
              >
                Gerenciar pagamento e cartão
              </button>
            )}

            {/* Cancelar assinatura ativa */}
            {assinaturaAtiva && sub?.stripe_subscription_id && (
              <button
                onClick={abrirPortalStripe}
                className="w-full text-red-400 hover:text-red-300 text-sm py-2 transition-colors"
              >
                Cancelar assinatura
              </button>
            )}

            {/* Cancelar trial */}
            {trialAtivo && (
              <>
                {!confirmandoCancelamento ? (
                  <button
                    onClick={() => setConfirmandoCancelamento(true)}
                    className="w-full text-red-400/70 hover:text-red-400 text-sm py-2 transition-colors"
                  >
                    Cancelar trial gratuito
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-medium mb-1">Tem certeza?</p>
                    <p className="text-red-400/60 text-xs mb-4">
                      Ao cancelar, você perderá acesso imediato à plataforma e seus créditos de trial.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={cancelarTrial}
                        disabled={cancelando}
                        className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                      >
                        {cancelando ? 'Cancelando...' : 'Sim, cancelar'}
                      </button>
                      <button
                        onClick={() => setConfirmandoCancelamento(false)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2.5 rounded-lg transition-colors"
                      >
                        Manter trial
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Reativar após cancelamento */}
            {cancelado && (
              <button
                onClick={() => router.push('/planos')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm py-4 rounded-xl transition-colors"
              >
                Reativar assinatura
              </button>
            )}
          </div>
        </div>
      </MainLayout>
    )
  }

  // Menu principal
  return (
    <MainLayout>
      <div className="max-w-2xl pt-2 md:pt-0">
        <h1 className="text-white font-bold text-xl mb-6">Minha conta</h1>

        {/* Info do usuário */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-lg font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-gray-500 text-sm truncate">{user.email}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${plano.cor}`}>
              {plano.nome}
            </span>
          </div>
        </div>

        {/* Trial banner */}
        {trialAtivo && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={13} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                {diasRestantes} {diasRestantes === 1 ? 'dia restante' : 'dias restantes'} de trial
              </span>
            </div>
            <p className="text-blue-300/60 text-xs">
              Seu plano <span className={`font-medium ${chosenPlanConfig.cor.split(' ')[0]}`}>{chosenPlanConfig.nome}</span> será ativado automaticamente ao final do trial.
            </p>
          </div>
        )}

        {/* Menu */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <button
            onClick={() => setSecao('assinatura')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-gray-500" />
              <div className="text-left">
                <p className="text-gray-200 text-sm font-medium">Assinatura e planos</p>
                <p className="text-gray-600 text-xs">Plano, uso, cobrança, upgrade e cancelamento</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-700" />
          </button>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm py-3 transition-colors"
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      </div>
    </MainLayout>
  )
}
