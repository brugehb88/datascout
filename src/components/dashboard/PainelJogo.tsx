'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, TrendingUp, Flag, ChevronRight, Brain, Swords, Shield, History, Home, Plane, BarChart2, Sparkles, Clock } from 'lucide-react'
import { Jogo } from '@/types'
import { Drawer, Metrica, Secao } from './Drawer'
import { supabase } from '@/lib/supabase'

const nivelCor: Record<string, string> = {
  alta: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  media: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  baixa: 'text-red-400 bg-red-500/10 border-red-500/20',
}

interface MercadoAnalise {
  probabilidade: number
  recomendacao: string
  nivel: 'alta' | 'media' | 'baixa'
  analise: any
}

interface AnaliseCompleta {
  resultado: MercadoAnalise
  ambas_marcam: MercadoAnalise
  total_gols: MercadoAnalise
  escanteios: MercadoAnalise
  gerada_em?: string
}

const mercadosConfig = [
  { id: 'resultado', titulo: 'Resultado da partida', icone: Target, cor: 'bg-blue-500/20 text-blue-400', corPonto: 'bg-blue-400' },
  { id: 'ambas_marcam', titulo: 'Ambas marcam', icone: Zap, cor: 'bg-amber-500/20 text-amber-400', corPonto: 'bg-amber-400' },
  { id: 'total_gols', titulo: 'Total de gols', icone: TrendingUp, cor: 'bg-emerald-500/20 text-emerald-400', corPonto: 'bg-emerald-400' },
  { id: 'escanteios', titulo: 'Escanteios', icone: Flag, cor: 'bg-purple-500/20 text-purple-400', corPonto: 'bg-purple-400' },
]

interface Props {
  jogo: Jogo
}

function AnaliseResultado({ jogo, dados }: { jogo: Jogo; dados: any }) {
  return (
    <>
      <Secao icone={History} titulo="Forma recente">
        <Metrica label={`${jogo.time_casa} — últimos 5 jogos`} valor={dados?.forma_recente?.mandante_5jogos ?? '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — últimos 5 jogos`} valor={dados?.forma_recente?.visitante_5jogos ?? '—'} positivo={false} />
        <Metrica label="Pontos por jogo — mandante" valor={dados?.forma_recente?.pontos_por_jogo_mandante ? `${dados.forma_recente.pontos_por_jogo_mandante} pts` : '—'} positivo={true} />
        <Metrica label="Pontos por jogo — visitante" valor={dados?.forma_recente?.pontos_por_jogo_visitante ? `${dados.forma_recente.pontos_por_jogo_visitante} pts` : '—'} positivo={false} />
      </Secao>
      <Secao icone={Home} titulo="Mandante / Visitante">
        <Metrica label={`${jogo.time_casa} em casa`} valor={dados?.mandante_visitante?.mandante_em_casa ?? '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} fora`} valor={dados?.mandante_visitante?.visitante_fora ?? '—'} positivo={false} />
      </Secao>
      <Secao icone={Swords} titulo="Confronto direto (H2H)">
        <Metrica label="Vitórias mandante" valor={String(dados?.h2h?.vitorias_mandante ?? '—')} positivo={true} />
        <Metrica label="Empates" valor={String(dados?.h2h?.empates ?? '—')} />
        <Metrica label="Vitórias visitante" valor={String(dados?.h2h?.vitorias_visitante ?? '—')} positivo={false} />
        <Metrica label="Último resultado" valor={dados?.h2h?.ultimo_resultado ?? '—'} />
      </Secao>
      <Secao icone={Brain} titulo="Veredito">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{dados?.veredito_ia ?? '—'}</p>
        </div>
      </Secao>
    </>
  )
}

function AnaliseAmbasMarcam({ jogo, dados }: { jogo: Jogo; dados: any }) {
  return (
    <>
      <Secao icone={Swords} titulo="Poder ofensivo">
        <Metrica label={`${jogo.time_casa} — média gols marcados`} valor={dados?.ofensivo?.media_gols_mandante ? `${dados.ofensivo.media_gols_mandante} / jogo` : '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — média gols marcados`} valor={dados?.ofensivo?.media_gols_visitante ? `${dados.ofensivo.media_gols_visitante} / jogo` : '—'} />
        <Metrica label={`${jogo.time_casa} — jogos sem marcar`} valor={dados?.ofensivo?.jogos_sem_marcar_mandante ?? '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — jogos sem marcar`} valor={dados?.ofensivo?.jogos_sem_marcar_visitante ?? '—'} positivo={false} />
      </Secao>
      <Secao icone={Shield} titulo="Vulnerabilidade defensiva">
        <Metrica label={`${jogo.time_casa} — média gols sofridos`} valor={dados?.defensivo?.media_sofridos_mandante ? `${dados.defensivo.media_sofridos_mandante} / jogo` : '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — média gols sofridos`} valor={dados?.defensivo?.media_sofridos_visitante ? `${dados.defensivo.media_sofridos_visitante} / jogo` : '—'} positivo={false} />
        <Metrica label={`${jogo.time_casa} — clean sheets`} valor={dados?.defensivo?.clean_sheets_mandante ?? '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — clean sheets`} valor={dados?.defensivo?.clean_sheets_visitante ?? '—'} positivo={false} />
      </Secao>
      <Secao icone={History} titulo="Histórico BTTS">
        <Metrica label="Ambas marcaram no H2H" valor={dados?.btts_historico?.btts_h2h ?? '—'} />
        <Metrica label={`${jogo.time_casa} em casa — BTTS`} valor={dados?.btts_historico?.btts_mandante_casa ?? '—'} />
        <Metrica label={`${jogo.time_fora} fora — BTTS`} valor={dados?.btts_historico?.btts_visitante_fora ?? '—'} />
      </Secao>
      <Secao icone={Brain} titulo="Veredito">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{dados?.veredito_ia ?? '—'}</p>
        </div>
      </Secao>
    </>
  )
}

function AnaliseTotalGols({ jogo, dados }: { jogo: Jogo; dados: any }) {
  return (
    <>
      <Secao icone={BarChart2} titulo="Média de gols">
        <Metrica label="Média combinada" valor={dados?.medias?.media_combinada ? `${dados.medias.media_combinada} gols` : '—'} positivo={true} />
        <Metrica label={`${jogo.time_casa} — média total`} valor={dados?.medias?.media_mandante ? `${dados.medias.media_mandante} gols / jogo` : '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — média total`} valor={dados?.medias?.media_visitante ? `${dados.medias.media_visitante} gols / jogo` : '—'} />
        <Metrica label="Média do H2H" valor={dados?.medias?.media_h2h ? `${dados.medias.media_h2h} gols / jogo` : '—'} />
      </Secao>
      <Secao icone={TrendingUp} titulo="Over / Under histórico">
        <Metrica label={`${jogo.time_casa} em casa — Over 2.5`} valor={dados?.over_under?.over_mandante_casa ?? '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} fora — Over 2.5`} valor={dados?.over_under?.over_visitante_fora ?? '—'} positivo={true} />
        <Metrica label="H2H — Over 2.5" valor={dados?.over_under?.over_h2h ?? '—'} positivo={true} />
      </Secao>
      <Secao icone={Brain} titulo="Veredito">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{dados?.veredito_ia ?? '—'}</p>
        </div>
      </Secao>
    </>
  )
}

function AnaliseEscanteios({ jogo, dados }: { jogo: Jogo; dados: any }) {
  return (
    <>
      <Secao icone={BarChart2} titulo="Média de escanteios">
        <Metrica label="Média combinada" valor={dados?.medias?.media_combinada ? `${dados.medias.media_combinada} / jogo` : '—'} />
        <Metrica label={`${jogo.time_casa} — média em casa`} valor={dados?.medias?.media_mandante_casa ? `${dados.medias.media_mandante_casa} / jogo` : '—'} />
        <Metrica label={`${jogo.time_fora} — média fora`} valor={dados?.medias?.media_visitante_fora ? `${dados.medias.media_visitante_fora} / jogo` : '—'} />
      </Secao>
      <Secao icone={TrendingUp} titulo="Over / Under histórico">
        <Metrica label={`${jogo.time_casa} em casa — Over 9.5`} valor={dados?.over_under?.over_mandante_casa ?? '—'} positivo={false} />
        <Metrica label={`${jogo.time_fora} fora — Over 9.5`} valor={dados?.over_under?.over_visitante_fora ?? '—'} positivo={false} />
        <Metrica label="H2H — Over 9.5" valor={dados?.over_under?.over_h2h ?? '—'} />
      </Secao>
      <Secao icone={Plane} titulo="Estilo de jogo">
        <Metrica label={`${jogo.time_casa} — posse média`} valor={dados?.estilo?.posse_mandante ?? '—'} positivo={true} />
        <Metrica label={`${jogo.time_fora} — posse média`} valor={dados?.estilo?.posse_visitante ?? '—'} positivo={false} />
        <Metrica label="Cruzamentos — mandante" valor={dados?.estilo?.cruzamentos_mandante ?? '—'} />
        <Metrica label="Cruzamentos — visitante" valor={dados?.estilo?.cruzamentos_visitante ?? '—'} />
      </Secao>
      <Secao icone={Brain} titulo="Veredito">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{dados?.veredito_ia ?? '—'}</p>
        </div>
      </Secao>
    </>
  )
}

export default function PainelJogo({ jogo }: Props) {
  const [analise, setAnalise] = useState<AnaliseCompleta | null>(null)
  const [gerando, setGerando] = useState(false)
  const [drawerAberto, setDrawerAberto] = useState<string | null>(null)
  const mercadoAtivo = mercadosConfig.find(m => m.id === drawerAberto)

  async function verificarCache(): Promise<AnaliseCompleta | null> {
    const hoje = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('analises')
      .select('*')
      .eq('fixture_id', jogo.id)
      .eq('data_jogo', hoje)
      .eq('tipo', 'pre_jogo')
      .single()

    if (error || !data) return null

    return {
      resultado: data.resultado,
      ambas_marcam: data.ambas_marcam,
      total_gols: data.total_gols,
      escanteios: data.escanteios,
      gerada_em: data.gerada_em,
    }
  }

  async function salvarCache(analiseData: AnaliseCompleta) {
    const hoje = new Date().toISOString().split('T')[0]
    await supabase.from('analises').insert({
      fixture_id: jogo.id,
      data_jogo: hoje,
      time_casa: jogo.time_casa,
      time_fora: jogo.time_fora,
      liga: jogo.liga,
      horario: jogo.horario,
      resultado: analiseData.resultado,
      ambas_marcam: analiseData.ambas_marcam,
      total_gols: analiseData.total_gols,
      escanteios: analiseData.escanteios,
      tipo: 'pre_jogo',
    })
  }

  async function gerarAnalise() {
    setGerando(true)
    try {
      // 1. Verifica cache primeiro
      const cache = await verificarCache()
      if (cache) {
        setAnalise(cache)
        setGerando(false)
        return
      }

      // 2. Chama o n8n
      const response = await fetch(`${process.env.NEXT_PUBLIC_N8N_URL}/analise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixture_id: jogo.id }),
      })

      if (!response.ok) throw new Error('Erro ao buscar análise')

      const dados = await response.json()
      const analiseFormatada: AnaliseCompleta = {
        resultado: dados.mercados.resultado,
        ambas_marcam: dados.mercados.ambas_marcam,
        total_gols: dados.mercados.total_gols,
        escanteios: dados.mercados.escanteios,
        gerada_em: new Date().toISOString(),
      }

      // 3. Salva no cache
      await salvarCache(analiseFormatada)

      // 4. Incrementa contador de análises
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.rpc('incrementar_analise', { uid: user.id })
        await supabase.from('analysis_log').insert({
          user_id: user.id,
          fixture_id: jogo.id,
          league: jogo.liga,
          home_team: jogo.time_casa,
          away_team: jogo.time_fora,
          plan_at_time: 'trial',
        })
      }

      setAnalise(analiseFormatada)

    } catch (err) {
      console.error('Erro ao gerar análise:', err)
    } finally {
      setGerando(false)
    }
  }

  function renderAnalise() {
    if (!analise) return null
    const dados = (analise as any)[drawerAberto!]?.analise
    switch (drawerAberto) {
      case 'resultado': return <AnaliseResultado jogo={jogo} dados={dados} />
      case 'ambas_marcam': return <AnaliseAmbasMarcam jogo={jogo} dados={dados} />
      case 'total_gols': return <AnaliseTotalGols jogo={jogo} dados={dados} />
      case 'escanteios': return <AnaliseEscanteios jogo={jogo} dados={dados} />
      default: return null
    }
  }

  return (
    <>
      {/* Header do jogo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-xs uppercase tracking-wider">{jogo.liga}</span>
          <span className="flex items-center gap-1.5 text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            <Clock size={10} />
            Análise pré-jogo
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex-1">
            <p className="text-white text-xl font-bold">{jogo.time_casa}</p>
            <p className="text-gray-500 text-sm mt-0.5">Mandante</p>
          </div>
          <div className="flex flex-col items-center px-6">
            <span className="text-gray-600 text-2xl font-light">×</span>
            <span className="text-gray-600 text-xs mt-1">{jogo.horario}</span>
          </div>
          <div className="flex-1 text-right">
            <p className="text-white text-xl font-bold">{jogo.time_fora}</p>
            <p className="text-gray-500 text-sm mt-0.5">Visitante</p>
          </div>
        </div>

        {analise?.gerada_em && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-gray-600 text-xs">
              Análise gerada às {new Date(analise.gerada_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </motion.div>

      {/* Estado: aguardando geração */}
      {!analise && !gerando && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold text-base mb-1">Análise não gerada</h3>
          <p className="text-gray-500 text-sm text-center mb-6 max-w-xs">
            Clique para gerar a análise completa deste confronto com dados estatísticos e veredito.
          </p>
          <button
            onClick={gerarAnalise}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <Sparkles size={16} />
            Gerar análise
          </button>
          <p className="text-gray-600 text-xs mt-3">Consome 1 crédito de análise</p>
        </motion.div>
      )}

      {/* Estado: gerando */}
      {gerando && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={24} className="text-emerald-400" />
            </motion.div>
          </div>
          <h3 className="text-white font-semibold text-base mb-1">Analisando confronto...</h3>
          <p className="text-gray-500 text-sm">Buscando dados e gerando veredito</p>
        </motion.div>
      )}

      {/* Estado: análise pronta — grid de cards */}
      {analise && !gerando && (
        <div className="grid grid-cols-2 gap-4">
          {mercadosConfig.map((mercado, i) => {
            const dados = (analise as any)[mercado.id] as MercadoAnalise
            return (
              <motion.button
                key={mercado.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => setDrawerAberto(mercado.id)}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all text-left group hover:bg-gray-900 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${mercado.cor}`}>
                      <mercado.icone size={14} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{mercado.titulo}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
                </div>

                <div className="mb-3">
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-white text-4xl font-bold leading-none">
                      {dados?.probabilidade != null ? `${dados.probabilidade}%` : '—'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dados?.probabilidade ?? 0}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06 + 0.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        dados?.nivel === 'alta' ? 'bg-emerald-500' :
                        dados?.nivel === 'media' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>

                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${nivelCor[dados?.nivel ?? 'baixa']}`}>
                  {dados?.recomendacao ?? '—'}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Drawer */}
      <Drawer
        aberto={!!drawerAberto}
        onFechar={() => setDrawerAberto(null)}
        titulo={mercadoAtivo?.titulo ?? ''}
        cor={mercadoAtivo?.corPonto ?? ''}
      >
        {mercadoAtivo && analise && (
          <div>
            <div className="bg-gray-900 rounded-2xl p-5 mb-6 text-center border border-gray-800">
              <p className="text-gray-500 text-sm mb-1">Probabilidade calculada</p>
              <p className="text-white text-6xl font-bold">
                {(analise as any)[drawerAberto!]?.probabilidade}%
              </p>
              <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full border font-medium mt-3 ${nivelCor[(analise as any)[drawerAberto!]?.nivel ?? 'baixa']}`}>
                {(analise as any)[drawerAberto!]?.recomendacao}
              </span>
            </div>
            {renderAnalise()}
          </div>
        )}
      </Drawer>
    </>
  )
}