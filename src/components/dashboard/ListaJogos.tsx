'use client'

import { useEffect, useState } from 'react'
import { Clock, ChevronRight, Zap, Loader2 } from 'lucide-react'
import { Jogo } from '@/types'
import { buscarJogosDodia } from '@/lib/api'

interface Props {
  onSelecionarJogo: (jogo: Jogo) => void
  jogoSelecionado: Jogo | null
}

export default function ListaJogos({ onSelecionarJogo, jogoSelecionado }: Props) {
  const [jogos, setJogos] = useState<Jogo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const dados = await buscarJogosDodia()
        setJogos(dados)
      } catch {
        setErro('Não foi possível carregar os jogos.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={22} className="text-emerald-400 animate-spin" />
        <p className="text-gray-500 text-sm">Carregando jogos...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
        <p className="text-red-400 text-sm">{erro}</p>
      </div>
    )
  }

  if (jogos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-sm">Nenhum jogo encontrado para hoje.</p>
      </div>
    )
  }

  const ligasUnicas = [...new Set(jogos.map(j => j.liga))]

  return (
    <div className="flex flex-col gap-6">
      {ligasUnicas.map(liga => (
        <div key={liga}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">{liga}</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
          <div className="flex flex-col gap-1">
            {jogos.filter(j => j.liga === liga).map(jogo => (
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
        </div>
      ))}
    </div>
  )
}