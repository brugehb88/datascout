const MAPA_LIGAS: Record<string, string> = {
  // === STARTER ===
  'Copa Do Brasil': 'Copa do Brasil',
  'Copa do Brasil': 'Copa do Brasil',
  'CONMEBOL Libertadores': 'Libertadores',
  'Libertadores': 'Libertadores',
  'Copa Libertadores': 'Libertadores',
  'CONMEBOL Sudamericana': 'Sul-Americana',
  'Sul-Americana': 'Sul-Americana',
  'La Liga': 'La Liga',
  'Serie A': 'Serie A Italiana',
  'Ligue 1': 'Ligue 1',
  'Bundesliga': 'Bundesliga',

  // === PRO ===
  'UEFA Champions League': 'Champions League',
  'Champions League': 'Champions League',
  'UEFA Europa League': 'Europa League',
  'Europa League': 'Europa League',
  'UEFA Europa Conference League': 'Conference League',
  'Conference League': 'Conference League',
  'MLS': 'MLS',
  'Liga MX': 'Liga MX',
  'Eredivisie': 'Eredivisie',
  'Primeira Liga': 'Primeira Liga',
  'Liga Portugal': 'Primeira Liga',
  'Scottish Premiership': 'Scottish Premiership',
  'Süper Lig': 'Turkish Süper Lig',
  'Super Lig': 'Turkish Süper Lig',
  'Saudi Professional League': 'Saudi Pro League',
  'Saudi Pro League': 'Saudi Pro League',
  'Copa do Mundo': 'Copa do Mundo',
  'World Cup': 'Copa do Mundo',
  'Eurocopa': 'Eurocopa',
  'Euro Championship': 'Eurocopa',
}

// NOTE: "Premier League" e "Brasileirão" removidos do mapa por enquanto.
// "Premier League" é ambíguo (Inglaterra, Cazaquistão, Gana...).
// "Brasileirão" não aparece na API com esse nome.
// Solução definitiva: adicionar league_id no n8n.
// Ligas que dependem de league_id pra funcionar:
// - Premier League (England) = league_id 39
// - Brasileirão Série A = league_id 71
// - Brasileirão Série B = league_id 72

const CANONICAS_STARTER = [
  'Brasileirão Série A',
  'Brasileirão Série B',
  'Copa do Brasil',
  'Libertadores',
  'Sul-Americana',
  'Premier League',
  'La Liga',
  'Serie A Italiana',
  'Bundesliga',
  'Ligue 1',
]

const CANONICAS_PRO = [
  ...CANONICAS_STARTER,
  'Champions League',
  'Europa League',
  'Conference League',
  'MLS',
  'Liga MX',
  'Eredivisie',
  'Primeira Liga',
  'Scottish Premiership',
  'Turkish Süper Lig',
  'Saudi Pro League',
  'Copa do Mundo',
  'Eurocopa',
]

export function canonizar(ligaDaApi: string): string | null {
  return MAPA_LIGAS[ligaDaApi] ?? null
}

export function displayName(ligaDaApi: string): string {
  return MAPA_LIGAS[ligaDaApi] ?? ligaDaApi
}

export function ligasDoPlano(plano: string): string[] {
  switch (plano) {
    case 'pro': return CANONICAS_PRO
    case 'starter': return CANONICAS_STARTER
    case 'trial': return CANONICAS_STARTER
    default: return CANONICAS_STARTER
  }
}

// Aceita tanto nome da API quanto nome canônico
export function ligaPermitida(liga: string, plano: string): boolean {
  const permitidas = ligasDoPlano(plano)
  // Primeiro tenta como canônico direto
  if (permitidas.includes(liga)) return true
  // Depois tenta canonizar (nome da API)
  const canonica = canonizar(liga)
  if (!canonica) return false
  return permitidas.includes(canonica)
}

export const LIGAS_STARTER = CANONICAS_STARTER
export const LIGAS_PRO = CANONICAS_PRO