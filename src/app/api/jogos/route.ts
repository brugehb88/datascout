import { NextRequest, NextResponse } from 'next/server'

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!
const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'

export async function GET(request: NextRequest) {
  try {
    const hoje = new Date().toISOString().split('T')[0]

    const res = await fetch(
      `${API_FOOTBALL_URL}/fixtures?date=${hoje}&timezone=America/Sao_Paulo`,
      {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY },
        next: { revalidate: 300 }, // cache 5 minutos
      }
    )

    const data = await res.json()
    const fixtures = data.response || []

    const jogos = fixtures.map((f: any) => ({
      id: f.fixture.id,
      league_id: f.league.id,
      time_casa: f.teams.home.name,
      time_fora: f.teams.away.name,
      horario: f.fixture.date.substring(11, 16),
      liga: f.league.name,
      status:
        f.fixture.status.short === 'NS' ? 'agendado' :
        f.fixture.status.short === 'HT' ? 'intervalo' :
        (f.fixture.status.short === '1H' || f.fixture.status.short === '2H') ? 'ao_vivo' :
        'encerrado',
      placar_casa: f.goals.home,
      placar_fora: f.goals.away,
      logo_casa: f.teams.home.logo,
      logo_fora: f.teams.away.logo,
    }))

    return NextResponse.json({ jogos })
  } catch (error) {
    console.error('Erro ao buscar jogos:', error)
    return NextResponse.json({ jogos: [], error: 'Falha ao buscar jogos' }, { status: 500 })
  }
}
