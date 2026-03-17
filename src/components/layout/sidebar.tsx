'use client'

import { useState } from 'react'
import { Calendar, Search, Trophy, Settings, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ligas = [
  { id: 1, nome: 'Brasileirão Série A', sigla: 'BSA' },
  { id: 2, nome: 'Brasileirão Série B', sigla: 'BSB' },
  { id: 3, nome: 'Copa do Brasil', sigla: 'CDB' },
  { id: 4, nome: 'Libertadores', sigla: 'LIB' },
  { id: 5, nome: 'Sul-Americana', sigla: 'SUL' },
  { id: 6, nome: 'Premier League', sigla: 'PRL' },
  { id: 7, nome: 'La Liga', sigla: 'LAL' },
  { id: 8, nome: 'Serie A Italiana', sigla: 'ITA' },
  { id: 9, nome: 'Ligue 1', sigla: 'FRA' },
  { id: 10, nome: 'Europa League', sigla: 'UEL' },
  { id: 11, nome: 'Copa do Mundo', sigla: 'WC', emBreve: true },
]

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
  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState('hoje')

  const ligasFiltradas = ligas.filter(l =>
    l.nome.toLowerCase().includes(busca.toLowerCase())
  )

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

      {/* Filtro de data */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-1 mb-3">
          <Calendar size={13} className="text-gray-500" />
          <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Período</span>
        </div>
        <div className="flex flex-col gap-1">
          {['hoje', 'amanhã', 'semana'].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroAtivo(filtro)}
              className={`text-left text-sm px-3 py-2 rounded-lg capitalize transition-colors ${
                filtroAtivo === filtro
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      {/* Ligas */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-1 mb-3">
          <Trophy size={13} className="text-gray-500" />
          <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Ligas</span>
        </div>
        <div className="flex flex-col gap-1">
          {ligasFiltradas.map((liga) => (
            <button
              key={liga.id}
              disabled={liga.emBreve}
              className={`flex items-center gap-3 text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                liga.emBreve
                  ? 'opacity-40 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <span className="text-xs font-mono bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">
                {liga.sigla}
              </span>
              <span className="truncate">{liga.nome}</span>
              {liga.emBreve && (
                <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded flex-shrink-0">
                  em breve
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">U</span>
            </div>
            <span className="text-gray-400 text-sm">Minha conta</span>
          </div>
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