'use client'
import { useState, useEffect } from 'react'
import { Target, ArrowLeft, Trophy } from 'lucide-react'
import MainLayout from '@/components/layout/mainlayout'
import ListaJogos from '@/components/dashboard/ListaJogos'
import PainelJogo from '@/components/dashboard/PainelJogo'
import { Jogo } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useFiltros } from '@/store/filtros'
import { buscarJogosDodia } from '@/lib/api'

export default function InicioDashboard() {
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null)
  const [painelMobileAberto, setPainelMobileAberto] = useState(false)
  const { ligaSelecionada, setJogos, periodo, jogos, jogosFiltrados } = useFiltros()

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarJogosDodia()
        setJogos(dados)
      } catch {
        console.error('Não foi possível carregar os jogos.')
      }
    }
    carregar()
  }, [periodo, setJogos])

  function handleSelecionarJogo(jogo: Jogo) {
    setJogoSelecionado(jogo)
    if (window.innerWidth < 768) {
      setPainelMobileAberto(true)
    }
  }

  function handleFecharPainelMobile() {
    setPainelMobileAberto(false)
  }

  const mostrarBoasVindas = !ligaSelecionada

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6 pt-2 md:pt-0 min-w-0">
        {!mostrarBoasVindas && (
          <div className="w-full md:w-80 md:flex-shrink-0">
            <ListaJogos
              jogos={jogosFiltrados()}
              jogoSelecionado={jogoSelecionado}
              onSelecionar={handleSelecionarJogo}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {mostrarBoasVindas ? (
              <motion.div
                key="boas-vindas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <Trophy size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-white font-semibold text-xl mb-2">
                  Selecione uma liga
                </h2>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Escolha uma liga no menu lateral para ver os jogos disponíveis e iniciar sua análise.
                </p>
              </motion.div>
            ) : jogoSelecionado ? (
              <motion.div
                key="painel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <PainelJogo jogo={jogoSelecionado} />
              </motion.div>
            ) : (
              <motion.div
                key="selecionar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                  <Target size={28} className="text-gray-600" />
                </div>
                <h2 className="text-white font-semibold text-xl mb-2">
                  Selecione um jogo
                </h2>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Clique em um jogo da lista para ver a análise completa com probabilidades e estatísticas.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Painel Mobile */}
        <AnimatePresence>
          {painelMobileAberto && jogoSelecionado && (
            <motion.div
              key="painel-mobile"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-0 z-50 bg-gray-950 overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
                <button
                  onClick={handleFecharPainelMobile}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <ArrowLeft size={20} />
                </button>
                <span className="text-white text-sm font-medium">Análise</span>
              </div>
              <div className="p-4">
                <PainelJogo jogo={jogoSelecionado} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}
