export interface Jogo {
  id: number
  league_id: number
  time_casa: string
  time_fora: string
  horario: string
  liga: string
  status: 'agendado' | 'ao_vivo' | 'intervalo' | 'encerrado'
  placar_casa?: number | null
  placar_fora?: number | null
  logo_casa?: string
  logo_fora?: string
}

export interface Odds {
  jogo_id: number
  resultado: {
    casa: number
    empate: number
    fora: number
  }
  ambas_marcam: {
    sim: number
    nao: number
  }
  total_gols: {
    over: number
    under: number
    linha: number
  }
  escanteios: {
    over: number
    under: number
    linha: number
  }
}

export interface Usuario {
  id: string
  email: string
  plano: 'gratuito' | 'premium' | 'whitelabel'
  ativo: boolean
}