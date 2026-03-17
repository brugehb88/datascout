'use client'

import { useState } from 'react'
import { Target } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import ListaJogos from '@/components/dashboard/ListaJogos'
import PainelJogo from '@/components/dashboard/PainelJogo'
import { Jogo } from '@/types'

export default function Home() {
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null)

  function handleSelecionarJogo(jogo: Jogo) {
    setJogoSelecionado(jogo)
    // No mobile, faz scroll suave para o painel
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('painel')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <MainLayout>
      {/* Desktop: lado a lado | Mobile: empilhado */}
      <div className="flex flex-col md:flex-row gap-6 pt-2 md:pt-0
">

        {/* Lista de jogos */}
        <div className="w-full md:w-80 md:flex-shrink-0">
          <div className="mb-4">
            <h1 className="text-white font-bold text-xl">Jogos de hoje</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quinta-feira, 12 de março</p>
          </div>
          <ListaJogos
            onSelecionarJogo={handleSelecionarJogo}
            jogoSelecionado={jogoSelecionado}
          />
        </div>

        {/* Painel do jogo */}
        <div id="painel" className="flex-1">
          {jogoSelecionado ? (
            <PainelJogo jogo={jogoSelecionado} />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-64 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800 mt-12">
              <Target className="text-gray-700 mb-3" size={32} />
              <p className="text-gray-600 text-sm">Selecione um jogo para ver a análise</p>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  )
}