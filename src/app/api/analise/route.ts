import { NextRequest, NextResponse } from 'next/server'

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'

export const maxDuration = 30

async function fetchFootball(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${API_FOOTBALL_URL}/${endpoint}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
  })
  const data = await res.json()
  return data.response || []
}

export async function POST(request: NextRequest) {
  try {
    const { fixture_id } = await request.json()

    if (!fixture_id) {
      return NextResponse.json({ error: 'fixture_id obrigatório' }, { status: 400 })
    }

    // Busca todos os dados em paralelo
    const [dadosJogo, estatisticas] = await Promise.all([
      fetchFootball('fixtures', { id: String(fixture_id) }),
      fetchFootball('fixtures/statistics', { fixture: String(fixture_id) }),
    ])

    if (!dadosJogo.length) {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })
    }

    const homeId = dadosJogo[0].teams.home.id
    const awayId = dadosJogo[0].teams.away.id

    // Busca H2H e últimos jogos em paralelo
    const [h2h, ultimosMandante, ultimosVisitante] = await Promise.all([
      fetchFootball('fixtures/headtohead', { H2H: `${homeId}-${awayId}`, last: '10' }),
      fetchFootball('fixtures', { team: String(homeId), last: '10' }),
      fetchFootball('fixtures', { team: String(awayId), last: '10' }),
    ])

    // Chama OpenAI
    const prompt = `Você é um analista esportivo especializado em probabilidades. Analise este confronto e retorne um JSON.

REGRA ABSOLUTA: Use EXCLUSIVAMENTE os dados fornecidos abaixo. Se alguma informação não está presente nos dados, escreva "Dados insuficientes". NUNCA invente estatísticas.

DADOS DO JOGO: ${JSON.stringify(dadosJogo[0])}
ESTATÍSTICAS: ${JSON.stringify(estatisticas)}
H2H: ${JSON.stringify(h2h)}
ÚLTIMOS 10 JOGOS MANDANTE: ${JSON.stringify(ultimosMandante)}
ÚLTIMOS 10 JOGOS VISITANTE: ${JSON.stringify(ultimosVisitante)}

Retorne EXATAMENTE este JSON, sem texto adicional, sem markdown:
{
  "mercados": {
    "resultado": {
      "probabilidade": (0-100),
      "recomendacao": "Alta confiança — Vitória mandante",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "forma_recente": {
          "mandante_5jogos": "xV xE xD",
          "visitante_5jogos": "xV xE xD",
          "pontos_por_jogo_mandante": "x.x",
          "pontos_por_jogo_visitante": "x.x"
        },
        "mandante_visitante": {
          "mandante_em_casa": "xV xE xD",
          "visitante_fora": "xV xE xD"
        },
        "h2h": {
          "vitorias_mandante": 0,
          "empates": 0,
          "vitorias_visitante": 0,
          "ultimo_resultado": "x × x"
        },
        "veredito_ia": "Parágrafo curto baseado nos dados."
      }
    },
    "ambas_marcam": {
      "probabilidade": (0-100),
      "recomendacao": "Alta confiança — Sim",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "ofensivo": {
          "media_gols_mandante": "x.x",
          "media_gols_visitante": "x.x",
          "jogos_sem_marcar_mandante": "x de 10",
          "jogos_sem_marcar_visitante": "x de 10"
        },
        "defensivo": {
          "media_sofridos_mandante": "x.x",
          "media_sofridos_visitante": "x.x",
          "clean_sheets_mandante": "x de 10",
          "clean_sheets_visitante": "x de 10"
        },
        "btts_historico": {
          "btts_h2h": "x de y",
          "btts_mandante_casa": "x de y",
          "btts_visitante_fora": "x de y"
        },
        "veredito_ia": "Parágrafo curto baseado nos dados."
      }
    },
    "total_gols": {
      "probabilidade": (0-100),
      "recomendacao": "Alta confiança — Over 2.5",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "medias": {
          "media_combinada": "x.x",
          "media_mandante": "x.x",
          "media_visitante": "x.x",
          "media_h2h": "x.x"
        },
        "over_under": {
          "over_mandante_casa": "x de y",
          "over_visitante_fora": "x de y",
          "over_h2h": "x de y"
        },
        "veredito_ia": "Parágrafo curto baseado nos dados."
      }
    },
    "escanteios": {
      "probabilidade": (0-100),
      "recomendacao": "Alta confiança — Over 9.5",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "medias": {
          "media_combinada": "x.x",
          "media_mandante_casa": "x.x",
          "media_visitante_fora": "x.x"
        },
        "over_under": {
          "over_mandante_casa": "x de y",
          "over_visitante_fora": "x de y",
          "over_h2h": "x de y"
        },
        "estilo": {
          "posse_mandante": "xx%",
          "posse_visitante": "xx%",
          "cruzamentos_mandante": "x.x",
          "cruzamentos_visitante": "x.x"
        },
        "veredito_ia": "Parágrafo curto baseado nos dados."
      }
    }
  }
}`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    const openaiData = await openaiRes.json()
    const content = openaiData.choices?.[0]?.message?.content || ''
    const limpo = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const analise = JSON.parse(limpo)
      return NextResponse.json(analise)
    } catch {
      return NextResponse.json({ error: 'Falha ao processar análise', raw: limpo }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
