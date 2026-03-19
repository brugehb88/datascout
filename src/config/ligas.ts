export const LIGAS_STARTER = [
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

export const LIGAS_PRO = [
  ...LIGAS_STARTER,
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

export function ligasDoPlano(plano: string): string[] {
  switch (plano) {
    case 'pro': return LIGAS_PRO
    case 'starter': return LIGAS_STARTER
    case 'trial': return LIGAS_STARTER
    default: return LIGAS_STARTER
  }
}

export function ligaPermitida(liga: string, plano: string): boolean {
  const permitidas = ligasDoPlano(plano)
  return permitidas.some(l => liga.toLowerCase().includes(l.toLowerCase()))
}