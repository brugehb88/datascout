'use client'

import { Clock, ChevronRight, Zap, Loader2 } from 'lucide-react'
import { Jogo } from '@/types'
import { useFiltros } from '@/store/filtros'

interface Props {
  onSelecionarJogo: (jogo: Jogo) => void
  jogoSelecionado: Jogo | null
}

export default function ListaJogos({ onSelecionarJogo, jogoSelecionado }: Props) {
  const {
    jogos,
    jogosFiltrados,
    periodo,
    setPeriodo,
    ligaSelecionada,
  } = useFiltros()

  const filtrados = jogosFiltrados()
  const carregando = jogos.length === 0
  const ligasUnicas = [...new Set(filtrados.map(j => j.liga))]

  return (
    <div className="flex flex-col gap-4">
      {/* Filtro de período */}
      <div className="flex gap-2">
        {(['hoje', 'amanha', 'semana'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`text-sm px-4 py-2 rounded-xl capitalize transition-colors ${
              periodo === p
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            {p === 'amanha' ? 'amanhã' : p}
          </button>
        ))}
      </div>

      {/* Título contextual */}
      {ligaSelecionada && (
        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">
          {ligaSelecionada} — {filtrados.length} {filtrados.length === 1 ? 'jogo' : 'jogos'}
        </p>
      )}

      {/* Loading */}
      {carregando && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={22} className="text-emerald-400 animate-spin" />
          <p className="text-gray-500 text-sm">Carregando jogos...</p>
        </div>
      )}

      {/* Sem resultados */}
      {!carregando && filtrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-600 text-sm">
            {ligaSelecionada
              ? `Nenhum jogo encontrado para ${ligaSelecionada}.`
              : 'Nenhum jogo encontrado.'}
          </p>
        </div>
      )}

      {/* Lista de jogos */}
      {filtrados.map(jogo => (
        <button
          key={jogo.id}
          onClick={() => onSelecionarJogo(jogo)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
            jogoSelecionado?.id === jogo.id
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-[52px]">
              {jogo.status === 'ao_vivo' ? (
                <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                  <Zap size={10} className="fill-red-400" /> AO VIVO
                </span>
              ) : jogo.status === 'encerrado' ? (
                <span className="text-gray-600 text-xs">FIM</span>
              ) : (
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <Clock size={10} /> {jogo.horario}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className={`text-sm font-medium truncate ${jogoSelecionado?.id === jogo.id ? 'text-white' : 'text-gray-200'}`}>
                {jogo.time_casa}
              </span>
              <span className={`text-sm truncate ${jogoSelecionado?.id === jogo.id ? 'text-gray-300' : 'text-gray-400'}`}>
                {jogo.time_fora}
              </span>
            </div>
          </div>
          <ChevronRight size={14} className={`flex-shrink-0 transition-colors ${jogoSelecionado?.id === jogo.id ? 'text-emerald-400' : 'text-gray-700'}`} />
        </button>
      ))}
    </div>
  )
}