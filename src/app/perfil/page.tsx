'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Zap, Calendar, BarChart2, LogOut, ChevronRight, User, CreditCard } from 'lucide-react'
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
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [secao, setSecao] = useState<'menu' | 'assinatura'>('menu')

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

  if (!user) {
    router.push('/login')
    return null
  }

  const plano = planConfig[sub?.plan ?? 'trial']
  const PlanoIcone = plano.icone
  const diasRestantes = sub?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const trialAtivo = sub?.status === 'trialing' && diasRestantes > 0
  const percentUso = sub ? Math.round((sub.analyses_used / sub.analyses_limit) * 100) : 0

  // Seção: Assinatura
  if (secao === 'assinatura') {
    return (
      <MainLayout>
        <div className="max-w-2xl pt-2 md:pt-0">
          {/* Voltar */}
          <button
            onClick={() => setSecao('menu')}
            className="text-gray-500 text-sm hover:text-gray-300 transition-colors mb-4"
          >
            ← Voltar ao perfil
          </button>

          <h1 className="text-white font-bold text-xl mb-6">Assinatura</h1>

          {/* Plano atual */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PlanoIcone size={16} className={plano.cor.split(' ')[0]} />
                <span className="text-white font-semibold">Plano atual</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${plano.cor}`}>
                {plano.nome}
              </span>
            </div>

            {/* Trial info */}
            {trialAtivo && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={13} className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {diasRestantes} {diasRestantes === 1 ? 'dia restante' : 'dias restantes'} de trial
                  </span>
                </div>
                <p className="text-blue-300/60 text-xs">
                  Plano selecionado após trial: <span className="text-blue-300 font-medium capitalize">{sub?.chosen_plan}</span> — R$ {sub?.chosen_plan === 'pro' ? '97' : '47'}/mês
                </p>
              </div>
            )}

            {/* Status ativo */}
            {!trialAtivo && sub?.status === 'active' && sub.current_period_end && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-emerald-400 text-sm">
                  Assinatura ativa até {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {/* Trial expirado */}
            {!trialAtivo && sub?.status === 'expired' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">
                  Seu trial expirou. Assine um plano para continuar usando.
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

          {/* Botão upgrade */}
          {(sub?.plan === 'trial' || sub?.plan === 'starter') && (
            <button
              onClick={() => router.push('/planos')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Crown size={16} />
              {sub?.plan === 'trial' ? 'Escolher plano' : 'Fazer upgrade para Pro'}
            </button>
          )}

          {/* Gerenciar assinatura */}
          {sub?.stripe_subscription_id && (
            <button
            onClick={async () => {
              try {
                const res = await fetch('/api/stripe/portal', { method: 'POST' })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              } catch (err) {
                console.error('Erro ao abrir portal:', err)
              }
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-sm py-3 rounded-xl transition-colors"
          >
            Gerenciar assinatura
            <button
            onClick={async () => {
              try {
                const res = await fetch('/api/stripe/portal', { method: 'POST' })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              } catch (err) {
                console.error('Erro ao abrir portal:', err)
              }
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-sm py-3 rounded-xl transition-colors"
          >
            Gerenciar assinatura
          </button>
          </button>
          )}
        </div>
      </MainLayout>
    )
  }

  // Seção: Menu principal do perfil
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
              <p className="text-white font-semibold truncate">{user.user_metadata?.nome || user.email}</p>
              <p className="text-gray-500 text-sm truncate">{user.email}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${plano.cor}`}>
              {plano.nome}
            </span>
          </div>
        </div>

        {/* Menu de opções */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <button
            onClick={() => setSecao('assinatura')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors border-b border-gray-800"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-gray-500" />
              <div className="text-left">
                <p className="text-gray-200 text-sm font-medium">Assinatura</p>
                <p className="text-gray-600 text-xs">Plano, uso e cobrança</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-700" />
          </button>

          <button
            onClick={() => router.push('/planos')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Crown size={16} className="text-gray-500" />
              <div className="text-left">
                <p className="text-gray-200 text-sm font-medium">Planos</p>
                <p className="text-gray-600 text-xs">Ver planos e fazer upgrade</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-700" />
          </button>
        </div>

        {/* Sair */}
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