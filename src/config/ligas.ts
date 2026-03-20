// Mapa por league_id (API-Football) — fonte definitiva de verdade
interface LigaConfig {
  nome: string
  plano: 'starter' | 'pro'
}

const MAPA_POR_ID: Record<number, LigaConfig> = {
  // === STARTER ===
  71:  { nome: 'Brasileirão Série A', plano: 'starter' },
  72:  { nome: 'Brasileirão Série B', plano: 'starter' },
  73:  { nome: 'Copa do Brasil', plano: 'starter' },
  13:  { nome: 'Libertadores', plano: 'starter' },
  11:  { nome: 'Sul-Americana', plano: 'starter' },
  39:  { nome: 'Premier League', plano: 'starter' },
  140: { nome: 'La Liga', plano: 'starter' },
  135: { nome: 'Serie A Italiana', plano: 'starter' },
  78:  { nome: 'Bundesliga', plano: 'starter' },
  61:  { nome: 'Ligue 1', plano: 'starter' },

  // === PRO ===
  2:   { nome: 'Champions League', plano: 'pro' },
  3:   { nome: 'Europa League', plano: 'pro' },
  848: { nome: 'Conference League', plano: 'pro' },
  253: { nome: 'MLS', plano: 'pro' },
  262: { nome: 'Liga MX', plano: 'pro' },
  88:  { nome: 'Eredivisie', plano: 'pro' },
  94:  { nome: 'Primeira Liga', plano: 'pro' },
  179: { nome: 'Scottish Premiership', plano: 'pro' },
  203: { nome: 'Turkish Süper Lig', plano: 'pro' },
  307: { nome: 'Saudi Pro League', plano: 'pro' },
  1:   { nome: 'Copa do Mundo', plano: 'pro' },
  4:   { nome: 'Eurocopa', plano: 'pro' },
}

// Nomes canônicos por plano
const CANONICAS_STARTER = Object.values(MAPA_POR_ID)
  .filter(l => l.plano === 'starter')
  .map(l => l.nome)

const CANONICAS_PRO = Object.values(MAPA_POR_ID)
  .map(l => l.nome)

// Dado um league_id, retorna o nome canônico ou null se não reconhecida
export function canonizar(leagueId: number): string | null {
  return MAPA_POR_ID[leagueId]?.nome ?? null
}

// Retorna o nome bonito pra display
export function displayName(leagueId: number): string {
  return MAPA_POR_ID[leagueId]?.nome ?? 'Desconhecida'
}

// Retorna ligas canônicas do plano
export function ligasDoPlano(plano: string): string[] {
  switch (plano) {
    case 'pro': return CANONICAS_PRO
    case 'starter': return CANONICAS_STARTER
    case 'trial': return CANONICAS_STARTER
    default: return CANONICAS_STARTER
  }
}

// Checa se o league_id é permitido no plano
export function ligaPermitida(leagueId: number, plano: string): boolean {
  const config = MAPA_POR_ID[leagueId]
  if (!config) return false
  if (plano === 'pro') return true
  return config.plano === 'starter'
}

// Checa pelo nome canônico (pra sidebar)
export function ligaPermitidaPorNome(nomeCanonica: string, plano: string): boolean {
  const permitidas = ligasDoPlano(plano)
  return permitidas.includes(nomeCanonica)
}

export const LIGAS_STARTER = CANONICAS_STARTER
export const LIGAS_PRO = CANONICAS_PRO