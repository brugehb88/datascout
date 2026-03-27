import jsPDF from 'jspdf'

interface DadosPdf {
  home_team: string
  away_team: string
  league: string
  created_at: string
  analise: {
    resultado: any
    ambas_marcam: any
    total_gols: any
    escanteios: any
  }
}

export function exportarAnalisePdf(dados: DadosPdf) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFillColor(3, 7, 18)
  doc.rect(0, 0, w, 45, 'F')

  doc.setTextColor(16, 185, 129)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DATA SCOUT', 20, 18)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text(`${dados.home_team} × ${dados.away_team}`, 20, 30)

  doc.setFontSize(9)
  doc.setTextColor(156, 163, 175)
  const dataFormatada = new Date(dados.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`${dados.league} — Análise gerada em ${dataFormatada}`, 20, 38)

  y = 55

  const mercados = [
    { key: 'resultado', titulo: 'Resultado da Partida' },
    { key: 'ambas_marcam', titulo: 'Ambas Marcam' },
    { key: 'total_gols', titulo: 'Total de Gols' },
    { key: 'escanteios', titulo: 'Escanteios' },
  ]

  for (const mercado of mercados) {
    const m = (dados.analise as any)[mercado.key]
    if (!m) continue

    // Check page break
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    // Mercado header
    doc.setFillColor(17, 24, 39)
    doc.roundedRect(15, y - 4, w - 30, 12, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(mercado.titulo, 20, y + 4)

    // Probabilidade
    const cor = m.nivel === 'alta' ? [16, 185, 129] : m.nivel === 'media' ? [245, 158, 11] : [239, 68, 68]
    doc.setTextColor(cor[0], cor[1], cor[2])
    doc.setFontSize(11)
    doc.text(`${m.probabilidade}%`, w - 20, y + 4, { align: 'right' })

    y += 16

    // Recomendação
    doc.setTextColor(156, 163, 175)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Recomendação: ${m.recomendacao || '—'}`, 20, y)
    y += 6

    doc.setTextColor(cor[0], cor[1], cor[2])
    doc.setFontSize(9)
    doc.text(`Confiança: ${m.nivel || '—'}`, 20, y)
    y += 8

    // Análise detalhada
    const analise = m.analise
    if (analise) {
      const secoes = Object.entries(analise)
      for (const [secaoNome, secaoDados] of secoes) {
        if (!secaoDados || typeof secaoDados !== 'object') continue

        if (y > 260) {
          doc.addPage()
          y = 20
        }

        // Seção nome
        const nomeFormatado = secaoNome
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

        doc.setTextColor(107, 114, 128)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(nomeFormatado.toUpperCase(), 24, y)
        y += 5

        // Dados da seção
        if (typeof secaoDados === 'string') {
          doc.setTextColor(209, 213, 219)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          const lines = doc.splitTextToSize(secaoDados, w - 50)
          doc.text(lines, 24, y)
          y += lines.length * 4 + 4
        } else {
          const entries = Object.entries(secaoDados as Record<string, any>)
          for (const [key, value] of entries) {
            if (y > 270) {
              doc.addPage()
              y = 20
            }
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            doc.setTextColor(156, 163, 175)
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(label, 24, y)
            doc.setTextColor(229, 231, 235)
            doc.text(String(value ?? '—'), w - 24, y, { align: 'right' })
            y += 5
          }
        }
        y += 4
      }
    }

    y += 8
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setTextColor(75, 85, 99)
    doc.setFontSize(7)
    doc.text(
      `DataScout — Análise esportiva com inteligência — Página ${i} de ${totalPages}`,
      w / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Download
  const nomeArquivo = `datascout_${dados.home_team}_vs_${dados.away_team}_${new Date(dados.created_at).toISOString().split('T')[0]}.pdf`
    .replace(/\s+/g, '_')
    .toLowerCase()

  doc.save(nomeArquivo)
}