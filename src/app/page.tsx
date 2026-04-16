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

export default function Home() {
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null)
  const [painelMobileAberto, setPainelMobileAberto] = useState(false)
  const { ligaSelecionada, setJogos, periodo, jogos, jogosFiltrados } = useFiltros()

  // Carrega jogos no nível da page — nunca desmonta
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

        {/* Lista de jogos */}
        {!mostrarBoasVindas && (
          <div className="w-full md:w-80 md:flex-shrink-0">
            <div className="mb-4">
              <h1 className="text-white font-bold text-xl">{ligaSelecionada}</h1>
            </div>
            <ListaJogos
              onSelecionarJogo={handleSelecionarJogo}
              jogoSelecionado={jogoSelecionado}
            />
          </div>
        )}

        {/* Desktop: painel ou boas vindas */}
        <div className={`${mostrarBoasVindas ? 'w-full' : 'hidden md:block flex-1'}`}>
          {mostrarBoasVindas ? (
            <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Trophy size={28} className="text-emerald-400" />
              </div>
              <h1 className="text-white font-bold text-2xl mb-2 text-center">Bem-vindo ao DataScout</h1>
              <p className="text-gray-500 text-sm text-center leading-relaxed mb-8">
                Selecione uma liga no menu lateral para ver os jogos disponíveis e gerar análises estatísticas com veredito.
              </p>
              {jogos.length > 0 && jogosFiltrados().length === 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 w-full text-center mb-4">
                  <p className="text-gray-500 text-sm">Nenhum jogo nas ligas do seu plano hoje. Volte mais tarde ou confira amanhã.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-emerald-400 text-2xl font-bold">4</p>
                  <p className="text-gray-500 text-xs mt-1">Mercados por jogo</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-emerald-400 text-2xl font-bold">10+</p>
                  <p className="text-gray-500 text-xs mt-1">Ligas disponíveis</p>
                </div>
              </div>
            </div>
          ) : jogoSelecionado ? (
            <PainelJogo key={jogoSelecionado.id} jogo={jogoSelecionado} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800 mt-12">
              <Target className="text-gray-700 mb-3" size={32} />
              <p className="text-gray-600 text-sm">Selecione um jogo para ver a análise</p>
            </div>
          )}
        </div>

      </div>

      {/* Mobile: painel como overlay */}
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
                <PainelJogo key={jogoSelecionado.id} jogo={jogoSelecionado} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  )
}