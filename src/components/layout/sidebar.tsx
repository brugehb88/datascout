'use client'

import { useState } from 'react'
import { Search, Trophy, LogOut, Menu, X, Lock, Home, History, Bell, Target, Zap, TrendingUp, Flag } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useFiltros } from '@/store/filtros'
import { useSubscription } from '@/hooks/useSubscription'
import { useAlerts } from '@/hooks/useAlerts'
import { ligaPermitidaPorNome, LIGAS_PRO, canonizar } from '@/config/ligas'

const mercadoIcones: Record<string, any> = {
  resultado: Target,
  ambas_marcam: Zap,
  total_gols: TrendingUp,
  escanteios: Flag,
}

const mercadoLabels: Record<string, string> = {
  resultado: 'Resultado',
  ambas_marcam: 'Ambas marcam',
  total_gols: 'Total de gols',
  escanteios: 'Escanteios',
}

function Logo() {
  return (
    <div className="flex flex-col leading-none">
      <div className="bg-emerald-500 px-1.5 py-0.5 self-start">
        <span className="text-white font-black text-xs tracking-widest">DATA</span>
      </div>
      <span className="text-white font-black text-sm tracking-widest mt-0.5">SCOUT</span>
    </div>
  )
}

function CreditosBar() {
  const { sub } = useSubscription()
  if (!sub) return null

  const percent = Math.round((sub.analyses_used / sub.analyses_limit) * 100)
  const restantes = Math.max(0, sub.analyses_limit - sub.analyses_used)

  return (
    <div className="px-4 pb-2">
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-500 text-xs">Créditos</span>
          <span className={`text-xs font-semibold ${restantes <= 1 ? 'text-red-400' : restantes <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {sub.analyses_used} / {sub.analyses_limit}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function AlertasPanel({ onFechar }: { onFechar: () => void }) {
  const { alerts, naoLidos, isPro, marcarComoLido, marcarTodosComoLidos } = useAlerts()

  if (!isPro) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-sm">Alertas</span>
          <button onClick={onFechar} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center py-8">
          <Lock size={20} className="text-amber-400 mb-2" />
          <p className="text-gray-500 text-xs text-center">Alertas disponíveis no plano Pro</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-sm">Alertas</span>
        <div className="flex items-center gap-2">
          {naoLidos > 0 && (
            <button
              onClick={marcarTodosComoLidos}
              className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors"
            >
              Marcar todos
            </button>
          )}
          <button onClick={onFechar} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <Bell size={20} className="text-gray-700 mb-2" />
          <p className="text-gray-600 text-xs">Nenhum alerta recente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {alerts.map((alerta) => {
            const Icone = mercadoIcones[alerta.mercado] || Target
            return (
              <button
                key={alerta.id}
                onClick={() => { if (!alerta.lido) marcarComoLido(alerta.id) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  alerta.lido
                    ? 'bg-transparent border-gray-800/50 opacity-60'
                    : 'bg-emerald-500/5 border-emerald-500/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <Icone size={12} className={alerta.lido ? 'text-gray-600' : 'text-emerald-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${alerta.lido ? 'text-gray-500' : 'text-white'}`}>
                      {alerta.home_team} × {alerta.away_team}
                    </p>
                    <p className="text-gray-600 text-[10px] mt-0.5">
                      {mercadoLabels[alerta.mercado] || alerta.mercado} — {alerta.probabilidade}%
                    </p>
                    <p className="text-gray-700 text-[10px]">
                      {alerta.horario} · {alerta.league}
                    </p>
                  </div>
                  {!alerta.lido && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SidebarConteudo({ onFechar }: { onFechar?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const { planoEfetivo } = useSubscription()
  const { naoLidos, isPro } = useAlerts()
  const [alertasAberto, setAlertasAberto] = useState(false)
  const {
    busca,
    setBusca,
    ligasDisponiveis,
    ligaSelecionada,
    setLiga,
    jogos,
  } = useFiltros()

  const ligasDinamicas = ligasDisponiveis()
  const ligas = ligasDinamicas.length > 0 ? ligasDinamicas : LIGAS_PRO

  const ligasOrdenadas = [...ligas].sort((a, b) => {
    const aPermitida = ligaPermitidaPorNome(a, planoEfetivo)
    const bPermitida = ligaPermitidaPorNome(b, planoEfetivo)
    if (aPermitida && !bPermitida) return -1
    if (!aPermitida && bPermitida) return 1
    return a.localeCompare(b)
  })

  const ligasFiltradas = ligasOrdenadas.filter(l =>
    l.toLowerCase().includes(busca.toLowerCase())
  )
  const naHome = pathname === '/'

  function handleClickLiga(liga: string) {
    const permitida = ligaPermitidaPorNome(liga, planoEfetivo)
    if (!permitida) {
      router.push('/planos')
      if (onFechar) onFechar()
      return
    }

    if (ligaSelecionada === liga) {
      setLiga(null)
    } else {
      setLiga(liga)
    }

    if (!naHome) {
      router.push('/')
    }
    if (onFechar) onFechar()
  }

  function handleHome() {
    setLiga(null)
    router.push('/')
    if (onFechar) onFechar()
  }

  function contarJogos(ligaCanonica: string): number {
    return jogos.filter(j => canonizar(j.league_id) === ligaCanonica).length
  }

  if (alertasAberto) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <button onClick={handleHome} className="hover:opacity-80 transition-opacity">
            <Logo />
          </button>
          {onFechar && (
            <button onClick={onFechar} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <AlertasPanel onFechar={() => setAlertasAberto(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <button onClick={handleHome} className="hover:opacity-80 transition-opacity">
          <Logo />
        </button>
        <div className="flex items-center gap-2">
          {/* Sino de alertas */}
          <button
            onClick={() => setAlertasAberto(true)}
            className="relative text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <Bell size={16} />
            {isPro && naoLidos > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">{naoLidos > 9 ? '9+' : naoLidos}</span>
              </span>
            )}
          </button>
          {onFechar && (
            <button onClick={onFechar} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-1">
        <button
          onClick={handleHome}
          className={`w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
            naHome && !ligaSelecionada
              ? 'bg-emerald-500/10 text-emerald-400 font-medium'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          <Home size={15} />
          <span>Início</span>
        </button>
        <button
          onClick={() => { router.push('/historico'); if (onFechar) onFechar() }}
          className={`w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
            pathname === '/historico'
              ? 'bg-emerald-500/10 text-emerald-400 font-medium'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          <History size={15} />
          <span>Histórico</span>
        </button>
      </div>

      {/* Busca */}
      <div className="px-4 pb-4 border-b border-gray-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar time ou liga..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-gray-900 text-gray-300 text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Ligas como navegação */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-1 mb-3">
          <Trophy size={13} className="text-gray-500" />
          <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Ligas</span>
        </div>

        <div className="flex flex-col gap-1">
          {ligasFiltradas.map((liga) => {
            const permitida = ligaPermitidaPorNome(liga, planoEfetivo)
            const ativa = ligaSelecionada === liga
            const qtd = contarJogos(liga)

            return (
              <button
                key={liga}
                onClick={() => handleClickLiga(liga)}
                className={`flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
                  ativa
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : permitida
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                      : 'text-gray-700 hover:bg-gray-900/50 cursor-pointer'
                }`}
              >
                {!permitida && (
                  <Lock size={12} className="text-gray-700 flex-shrink-0" />
                )}
                <span className="truncate flex-1">{liga}</span>
                {!permitida ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex-shrink-0">
                    PRO
                  </span>
                ) : qtd > 0 ? (
                  <span className={`text-xs flex-shrink-0 ${ativa ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {qtd}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Créditos */}
      <CreditosBar />

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <a href="/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">U</span>
            </div>
            <span className="text-gray-400 text-sm">Minha conta</span>
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileAberto, setMobileAberto] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 h-screen bg-gray-950 border-r border-gray-800 flex-col fixed left-0 top-0 z-30">
        <SidebarConteudo />
      </aside>

      {/* Mobile — barra topo */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-950 border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <Logo />
        <button
          onClick={() => setMobileAberto(true)}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile — overlay */}
      {mobileAberto && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileAberto(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-full w-72 bg-gray-950 border-r border-gray-800 z-50 flex flex-col overflow-hidden">
            <SidebarConteudo onFechar={() => setMobileAberto(false)} />
          </aside>
        </>
      )}
    </>
  )
}