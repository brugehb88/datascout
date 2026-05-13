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

    // Busca dados em paralelo
    const [dadosJogo, estatisticas, eventos] = await Promise.all([
      fetchFootball('fixtures', { id: String(fixture_id) }),
      fetchFootball('fixtures/statistics', { fixture: String(fixture_id) }),
      fetchFootball('fixtures/events', { fixture: String(fixture_id) }),
    ])

    if (!dadosJogo.length) {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 })
    }

    const prompt = `Você é um analista esportivo especializado em análise ao vivo de partidas de futebol. Analise o intervalo desta partida e gere análise para o segundo tempo.

Responda EXCLUSIVAMENTE em JSON válido, sem nenhum texto antes ou depois.

DADOS DO JOGO: ${JSON.stringify(dadosJogo[0])}
ESTATÍSTICAS DO 1º TEMPO: ${JSON.stringify(estatisticas)}
EVENTOS (gols, cartões, substituições): ${JSON.stringify(eventos)}

Retorne EXATAMENTE este JSON:
{
  "mercados": {
    "resultado_final": {
      "probabilidade": (0-100),
      "recomendacao": "Vitória do mandante",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "contexto_1tempo": "Resumo do que aconteceu no 1º tempo",
        "tendencia_2tempo": "O que esperar no 2º tempo",
        "fatores_chave": "Fatores decisivos para o resultado"
      }
    },
    "total_gols_2tempo": {
      "probabilidade": (0-100),
      "recomendacao": "Over 1.5 gols no 2º tempo",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "ritmo_1tempo": "Análise do ritmo ofensivo no 1º tempo",
        "projecao": "Projeção de gols para o 2º tempo",
        "historico": "Padrão dos times em segundos tempos"
      }
    },
    "proximo_gol": {
      "probabilidade": (0-100),
      "recomendacao": "Mandante marca o próximo",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "pressao_ofensiva": "Qual time está pressionando mais",
        "oportunidades": "Chances claras criadas",
        "desgaste": "Qual defesa parece mais vulnerável"
      }
    },
    "escanteios_2tempo": {
      "probabilidade": (0-100),
      "recomendacao": "Over 4.5 escanteios no 2º tempo",
      "nivel": "alta" ou "media" ou "baixa",
      "analise": {
        "escanteios_1tempo": "Quantidade e distribuição no 1º tempo",
        "estilo_jogo": "Times jogando pelas laterais",
        "projecao": "Tendência para o 2º tempo"
      }
    }
  }
}

Probabilidade: 0-100. Nível: "alta" (≥70%), "media" (50-69%), "baixa" (<50%).
Baseie sua análise EXCLUSIVAMENTE nos dados fornecidos.`

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
      // Tenta extrair JSON do meio do texto
      const match = limpo.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return NextResponse.json(JSON.parse(match[0]))
        } catch {}
      }
      return NextResponse.json({ error: 'Falha ao processar análise', raw: limpo }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro na análise de intervalo:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
