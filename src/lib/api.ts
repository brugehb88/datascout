export async function buscarJogosDodia(): Promise<any[]> {
  try {
    const response = await fetch('/api/jogos', {
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
