const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL

export async function buscarJogosDodia(): Promise<any[]> {
  try {
    const response = await fetch(`${N8N_URL}/jogos`, {
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('Erro ao buscar jogos')
    const data = await response.json()
    return data.jogos || []
  } catch (err) {
    console.error('Erro ao buscar jogos:', err)
    return []
  }
}