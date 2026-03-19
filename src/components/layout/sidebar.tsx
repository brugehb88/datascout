'use client'

import { useState } from 'react'
import { Search, Trophy, Settings, LogOut, Menu, X, Check, Lock, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useFiltros } from '@/store/filtros'
import { useSubscription } from '@/hooks/useSubscription'
import { ligaPermitida } from '@/config/ligas'

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

function SidebarConteudo({ onFechar }: { onFechar?: () => void }) {
  const router = useRouter()
  const { planoEfetivo } = useSubscription()
  const {
    busca,
    setBusca,
    ligasDisponiveis,
    ligasSelecionadas,
    toggleLiga,
    selecionarTodasLigas,
  } = useFiltros()

  const ligas = ligasDisponiveis()
  const ligasFiltradas = ligas.filter(l =>
    l.toLowerCase().includes(busca.toLowerCase())
  )
  const todasSelecionadas = ligasSelecionadas.size === 0

  function handleClickLiga(liga: string) {
    const permitida = ligaPermitida(liga, planoEfetivo)
    if (!permitida) {
      router.push('/planos')
      if (onFechar) onFechar()
      return
    }
    toggleLiga(liga)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <Logo />
        {onFechar && (
          <button onClick={onFechar} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="p-4 border-b border-gray-800">
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

      {/* Ligas dinâmicas */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Trophy size={13} className="text-gray-500" />
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Ligas</span>
          </div>
          {!todasSelecionadas && (
            <button
              onClick={selecionarTodasLigas}
              className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors"
            >
              Ver todas
            </button>
          )}
        </div>

        {ligas.length === 0 ? (
          <p className="text-gray-600 text-sm py-4 text-center">Carregando ligas...</p>
        ) : (
          <div className="flex flex-col gap-1">
            {ligasFiltradas.map((liga) => {
              const permitida = ligaPermitida(liga, planoEfetivo)
              const ativa = permitida && (todasSelecionadas || ligasSelecionadas.has(liga))

              return (
                <button
                  key={liga}
                  onClick={() => handleClickLiga(liga)}
                  className={`flex items-center gap-3 text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    permitida
                      ? ativa
                        ? 'text-gray-200 hover:bg-gray-900'
                        : 'text-gray-600 hover:text-gray-400 hover:bg-gray-900'
                      : 'text-gray-700 hover:bg-gray-900/50 cursor-pointer'
                  }`}
                >
                  {permitida ? (
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      ativa
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'border-gray-700 bg-transparent'
                    }`}>
                      {ativa && <Check size={10} className="text-emerald-400" />}
                    </div>
                  ) : (
                    <Lock size={12} className="text-gray-700 flex-shrink-0" />
                  )}
                  <span className="truncate flex-1">{liga}</span>
                  {!permitida && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex-shrink-0">
                      PRO
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <a href="/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">U</span>
            </div>
            <span className="text-gray-400 text-sm">Minha conta</span>
          </a>
          <div className="flex gap-2">
            <button className="text-gray-600 hover:text-gray-400 transition-colors">
              <Settings size={15} />
            </button>
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