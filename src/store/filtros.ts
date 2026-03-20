import { create } from 'zustand'
import { Jogo } from '@/types'
import { canonizar } from '@/config/ligas'

interface FiltrosState {
  jogos: Jogo[]
  setJogos: (jogos: Jogo[]) => void

  ligaSelecionada: string | null
  setLiga: (liga: string | null) => void

  busca: string
  setBusca: (busca: string) => void

  periodo: 'hoje' | 'amanha' | 'semana'
  setPeriodo: (periodo: 'hoje' | 'amanha' | 'semana') => void

  jogosFiltrados: () => Jogo[]
  ligasDisponiveis: () => string[]
}

export const useFiltros = create<FiltrosState>((set, get) => ({
  jogos: [],
  setJogos: (jogos) => set({ jogos }),

  ligaSelecionada: null,
  setLiga: (liga) => set({ ligaSelecionada: liga }),

  busca: '',
  setBusca: (busca) => set({ busca }),

  periodo: 'hoje',
  setPeriodo: (periodo) => set({ periodo }),

  // Ligas disponíveis = nomes canônicos únicos (só ligas reconhecidas)
  ligasDisponiveis: () => {
    const { jogos } = get()
    const canonicas = jogos
      .map(j => canonizar(j.league_id))
      .filter((c): c is string => c !== null)
    return [...new Set(canonicas)].sort()
  },

  jogosFiltrados: () => {
    const { jogos, ligaSelecionada, busca } = get()

    return jogos.filter(jogo => {
      // Só ligas reconhecidas
      const canonica = canonizar(jogo.league_id)
      if (!canonica) return false

      // Filtro de liga
      if (ligaSelecionada && canonica !== ligaSelecionada) return false

      // Filtro de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase()
        const match =
          jogo.time_casa.toLowerCase().includes(termo) ||
          jogo.time_fora.toLowerCase().includes(termo) ||
          canonica.toLowerCase().includes(termo)
        if (!match) return false
      }

      return true
    })
  },
}))