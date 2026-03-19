import { create } from 'zustand'
import { Jogo } from '@/types'

interface FiltrosState {
  // Dados
  jogos: Jogo[]
  setJogos: (jogos: Jogo[]) => void

  // Filtro de ligas (toggle múltiplo)
  ligasSelecionadas: Set<string>
  toggleLiga: (liga: string) => void
  selecionarTodasLigas: () => void
  limparLigas: () => void

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

  ligasSelecionadas: new Set<string>(),
  toggleLiga: (liga) => set((state) => {
    const novas = new Set(state.ligasSelecionadas)
    if (novas.has(liga)) novas.delete(liga)
    else novas.add(liga)
    return { ligasSelecionadas: novas }
  }),
  selecionarTodasLigas: () => set({ ligasSelecionadas: new Set<string>() }),
  limparLigas: () => set({ ligasSelecionadas: new Set<string>() }),

  busca: '',
  setBusca: (busca) => set({ busca }),

  periodo: 'hoje',
  setPeriodo: (periodo) => set({ periodo }),

  ligasDisponiveis: () => {
    const { jogos } = get()
    return [...new Set(jogos.map(j => j.liga))].sort()
  },

  jogosFiltrados: () => {
    const { jogos, ligasSelecionadas, busca } = get()

    return jogos.filter(jogo => {
      // Filtro de liga (set vazio = todas)
      if (ligasSelecionadas.size > 0 && !ligasSelecionadas.has(jogo.liga)) {
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