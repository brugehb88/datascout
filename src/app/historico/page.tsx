'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, Crown, Target, Zap, TrendingUp, Flag, Calendar, Lock } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'

interface AnaliseHistorico {
  id: string
  fixture_id: number
  league: string
  home_team: string
  away_team: string
  created_at: string
  analise?: {
    resultado: any
    ambas_marcam: any
    total_gols: any
    escanteios: any
  }
}

const mercadoIcones: Record<string, any> = {
  resultado: Target,
  ambas_marcam: Zap,
  total_gols: TrendingUp,
  escanteios: Flag,
}

const nivelCor: Record<string, string> = {
  alta: 'text-emerald-400',
  media: 'text-amber-400',
  baixa: 'text-red-400',
}

export default function HistoricoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { sub, planoEfetivo } = useSubscription()
  const [analises, setAnalises] = useState<AnaliseHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)

  const bloqueado = planoEfetivo !== 'pro' && sub?.plan !== 'pro'

  useEffect(() => {
    async function carregar() {
      if (!user || bloqueado) {
        setLoading(false)
        return
      }

      // Buscar logs do usuário
      const { data: logs, error: logsError } = await supabase
        .from('analysis_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (logsError || !logs || logs.length === 0) {
        setLoading(false)
        return
      }

      // Buscar dados das análises correspondentes
      const fixtureIds = [...new Set(logs.map(l => l.fixture_id))]
      const { data: analisesData } = await supabase
        .from('analises')
        .select('fixture_id, resultado, ambas_marcam, total_gols, escanteios')
        .in('fixture_id', fixtureIds)

      // Combinar
      const analisesMap = new Map(
        (analisesData || []).map(a => [a.fixture_id, a])
      )

      const resultado: AnaliseHistorico[] = logs.map(log => ({
        id: log.id,
        fixture_id: log.fixture_id,
        league: log.league,
        home_team: log.home_team,
        away_team: log.away_team,
        created_at: log.created_at,
        analise: analisesMap.get(log.fixture_id) || undefined,
      }))

      setAnalises(resultado)
      setLoading(false)
    }

    if (!authLoading) carregar()
  }, [user, authLoading, bloqueado])

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </MainLayout>
    )
  }

  // Bloqueado pra quem não é Pro
  if (bloqueado) {
    return (
      <MainLayout>
        <div className="max-w-2xl pt-2 md:pt-0">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
              <Lock size={28} className="text-amber-400" />
            </div>
            <h1 className="text-white font-bold text-xl mb-2">Histórico exclusivo do plano Pro</h1>
            <p className="text-gray-500 text-sm text-center mb-8 max-w-sm">
              Com o plano Pro você tem acesso ao histórico completo de todas as suas análises geradas.
            </p>
            <button
              onClick={() => router.push('/planos')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <Crown size={16} />
              Fazer upgrade para Pro
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Agrupar por data
  const agrupado = analises.reduce((acc, a) => {
    const data = new Date(a.created_at).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!acc[data]) acc[data] = []
    acc[data].push(a)
    return acc
  }, {} as Record<string, AnaliseHistorico[]>)

  return (
    <MainLayout>
      <div className="max-w-3xl pt-2 md:pt-0">
        <div className="flex items-center gap-3 mb-6">
          <History size={20} className="text-emerald-400" />
          <h1 className="text-white font-bold text-xl">Histórico de análises</h1>
        </div>

        {analises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <History size={32} className="text-gray-700 mb-3" />
            <p className="text-gray-600 text-sm">Nenhuma análise gerada ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(agrupado).map(([data, items]) => (
              <div key={data}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={13} className="text-gray-500" />
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium capitalize">{data}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-700 text-xs">{items.length}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                        className={`w-full bg-gray-900/80 border rounded-2xl p-4 text-left transition-all ${
                          expandido === item.id
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-semibold">
                              {item.home_team} × {item.away_team}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">{item.league}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600 text-xs">
                              {new Date(item.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Mini resumo dos mercados */}
                        {item.analise && (
                          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-800">
                            {(['resultado', 'ambas_marcam', 'total_gols', 'escanteios'] as const).map((mercado) => {
                              const dados = (item.analise as any)?.[mercado]
                              if (!dados) return null
                              const Icone = mercadoIcones[mercado]
                              return (
                                <div key={mercado} className="flex items-center gap-1.5">
                                  <Icone size={11} className="text-gray-600" />
                                  <span className={`text-xs font-semibold ${nivelCor[dados.nivel] || 'text-gray-500'}`}>
                                    {dados.probabilidade}%
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </button>

                      {/* Expandido: detalhes */}
                      {expandido === item.id && item.analise && (
                        <div className="bg-gray-900/50 border border-gray-800 border-t-0 rounded-b-2xl px-4 py-4 -mt-2">
                          <div className="grid grid-cols-2 gap-3">
                            {(['resultado', 'ambas_marcam', 'total_gols', 'escanteios'] as const).map((mercado) => {
                              const dados = (item.analise as any)?.[mercado]
                              if (!dados) return null
                              const Icone = mercadoIcones[mercado]
                              const labels: Record<string, string> = {
                                resultado: 'Resultado',
                                ambas_marcam: 'Ambas marcam',
                                total_gols: 'Total de gols',
                                escanteios: 'Escanteios',
                              }
                              return (
                                <div key={mercado} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <Icone size={12} className="text-gray-500" />
                                    <span className="text-gray-400 text-xs">{labels[mercado]}</span>
                                  </div>
                                  <p className={`text-lg font-bold ${nivelCor[dados.nivel] || 'text-white'}`}>
                                    {dados.probabilidade}%
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">{dados.recomendacao}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}