'use client'

import { useEffect } from 'react'
import { X, TrendingUp, Shield, Swords, History, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DrawerProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  cor: string
  children: React.ReactNode
}

export function Drawer({ aberto, onFechar, titulo, cor, children }: DrawerProps) {
  useEffect(() => {
    if (aberto) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
className="fixed inset-y-0 right-0 left-0 md:left-auto md:w-[480px] bg-gray-950 border-l border-gray-800 z-50 flex flex-col"          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b border-gray-800`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${cor}`} />
                <span className="text-white font-semibold">{titulo}</span>
              </div>
              <button
                onClick={onFechar}
                className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo */}
<div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface MetricaProps {
  label: string
  valor: string
  sub?: string
  positivo?: boolean
}

export function Metrica({ label, valor, sub, positivo }: MetricaProps) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-800">
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-semibold ${positivo === true ? 'text-emerald-400' : positivo === false ? 'text-red-400' : 'text-white'}`}>
          {valor}
        </span>
        {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

interface SecaoProps {
  icone: any
  titulo: string
  children: React.ReactNode
}

export function Secao({ icone: Icone, titulo, children }: SecaoProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icone size={14} className="text-gray-500" />
        <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">{titulo}</span>
      </div>
      {children}
    </div>
  )
}