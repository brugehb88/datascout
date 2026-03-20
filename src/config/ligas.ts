// Nomes exatos como vêm da API
export const LIGAS_STARTER: string[] = [
  // Brasileiras
  'Serie A',              // Brasileirão (API retorna "Serie A" genérico)
  'Copa Do Brasil',
  // Sul-americanas
  'Libertadores',
  'Copa Libertadores',
  'CONMEBOL Libertadores',
  'Sul-Americana',
  'CONMEBOL Sudamericana',
  // Europa top 5
  'Premier League',
  'La Liga',
  'Ligue 1',
  'Bundesliga',
  // Variações que a API pode mandar
  'Brasileirão Série A',
  'Brasileirão Série B',
  'Serie B',
]

export const LIGAS_PRO: string[] = [
  ...LIGAS_STARTER,
  // Champions / Europa
  'UEFA Champions League',
  'Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  // Américas
  'MLS',
  'Liga MX',
  // Europa extras
  'Eredivisie',
  'Primeira Liga',
  'Liga Portugal',
  'Scottish Premiership',
  'Süper Lig',
  'Saudi Professional League',
  'Saudi Pro League',
  // Seleções
  'Copa do Mundo',
  'World Cup',
  'Eurocopa',
  'Euro Championship',
]

// Nomes de display mais bonitos pro sidebar
export const DISPLAY_NAMES: Record<string, string> = {
  'Serie A': 'Serie A Italiana',
  'Copa Do Brasil': 'Copa do Brasil',
  'Süper Lig': 'Turkish Süper Lig',
  'UEFA Europa League': 'Europa League',
  'UEFA Europa Conference League': 'Conference League',
  'UEFA Champions League': 'Champions League',
}

export function displayName(liga: string): string {
  return DISPLAY_NAMES[liga] ?? liga
}

export function ligasDoPlano(plano: string): string[] {
  switch (plano) {
    case 'pro': return LIGAS_PRO
    case 'starter': return LIGAS_STARTER
    case 'trial': return LIGAS_STARTER
    default: return LIGAS_STARTER
  }
}

export function ligaPermitida(ligaDoJogo: string, plano: string): boolean {
  const permitidas = ligasDoPlano(plano)
  return permitidas.some(l => l.toLowerCase() === ligaDoJogo.toLowerCase())
}