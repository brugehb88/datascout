'use client'

import { useState } from 'react'
import { Target, ArrowLeft } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import ListaJogos from '@/components/dashboard/ListaJogos'
import PainelJogo from '@/components/dashboard/PainelJogo'
import { Jogo } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null)
  const [painelMobileAberto, setPainelMobileAberto] = useState(false)

  function handleSelecionarJogo(jogo: Jogo) {
    setJogoSelecionado(jogo)
    if (window.innerWidth < 768) {
      setPainelMobileAberto(true)
    }
  }

  function handleFecharPainelMobile() {
    setPainelMobileAberto(false)
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6 pt-2 md:pt-0 min-w-0">

        {/* Lista de jogos */}
        <div className="w-full md:w-80 md:flex-shrink-0">
          <div className="mb-4">
            <h1 className="text-white font-bold text-xl">Jogos</h1>
          </div>
          <ListaJogos
            onSelecionarJogo={handleSelecionarJogo}
            jogoSelecionado={jogoSelecionado}
          />
        </div>

        {/* Desktop: painel inline */}
        <div className="hidden md:block flex-1">
          {jogoSelecionado ? (
            <PainelJogo jogo={jogoSelecionado} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800 mt-12">
              <Target className="text-gray-700 mb-3" size={32} />
              <p className="text-gray-600 text-sm">Selecione um jogo para ver a análise</p>
            </div>
          )}
        </div>

      </div>

      {/* Mobile: painel como overlay fullscreen */}
      <AnimatePresence>
        {painelMobileAberto && jogoSelecionado && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
              onClick={handleFecharPainelMobile}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed inset-0 top-0 bg-gray-950 z-50 flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 flex-shrink-0">
                <button
                  onClick={handleFecharPainelMobile}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {jogoSelecionado.time_casa} × {jogoSelecionado.time_fora}
                  </p>
                  <p className="text-gray-500 text-xs">{jogoSelecionado.liga}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <PainelJogo jogo={jogoSelecionado} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  )
}