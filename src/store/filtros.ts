import { create } from 'zustand'
import { Jogo } from '@/types'

interface FiltrosState {
  // Dados
  jogos: Jogo[]
  setJogos: (jogos: Jogo[]) => void

  // Liga selecionada (null = todas)
  ligaSelecionada: string | null
  setLiga: (liga: string | null) => void

  // Busca por nome
  busca: string
  setBusca: (busca: string) => void

  // Período
  periodo: 'hoje' | 'amanha' | 'semana'
  setPeriodo: (periodo: 'hoje' | 'amanha' | 'semana') => void

  // Jogos filtrados (derivado)
  jogosFiltrados: () => Jogo[]

  // Ligas disponíveis (derivado dos jogos)
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

  ligasDisponiveis: () => {
    const { jogos } = get()
    return [...new Set(jogos.map(j => j.liga))].sort()
  },

  jogosFiltrados: () => {
    const { jogos, ligaSelecionada, busca } = get()

    return jogos.filter(jogo => {
      // Filtro de liga
      if (ligaSelecionada && jogo.liga !== ligaSelecionada) {
        return false
      }

      // Filtro de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase()
        const match =
          jogo.time_casa.toLowerCase().includes(termo) ||
          jogo.time_fora.toLowerCase().includes(termo) ||
          jogo.liga.toLowerCase().includes(termo)
        if (!match) return false
      }

      return true
    })
  },
}))