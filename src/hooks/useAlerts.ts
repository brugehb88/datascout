'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useSubscription } from './useSubscription'

export interface Alert {
  id: string
  fixture_id: number
  home_team: string
  away_team: string
  league: string
  mercado: string
  probabilidade: number
  recomendacao: string
  nivel: string
  horario: string
  data_jogo: string
  created_at: string
  lido: boolean
}

export function useAlerts() {
  const { user } = useAuth()
  const { sub } = useSubscription()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const isPro = sub?.plan === 'pro'

  useEffect(() => {
    async function carregar() {
      if (!user || !isPro) {
        setAlerts([])
        setLoading(false)
        return
      }

      // Buscar alertas dos últimos 7 dias
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .gte('created_at', seteDiasAtras.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      // Buscar quais o usuário já leu
      const { data: readsData } = await supabase
        .from('alert_reads')
        .select('alert_id')
        .eq('user_id', user.id)

      const readIds = new Set((readsData || []).map(r => r.alert_id))

      const resultado = (alertsData || []).map(a => ({
        ...a,
        lido: readIds.has(a.id),
      }))

      setAlerts(resultado)
      setLoading(false)
    }

    carregar()
  }, [user, isPro, sub])

  const naoLidos = alerts.filter(a => !a.lido).length

  async function marcarComoLido(alertId: string) {
    if (!user) return
    await supabase.from('alert_reads').insert({
      user_id: user.id,
      alert_id: alertId,
    })
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, lido: true } : a
    ))
  }

  async function marcarTodosComoLidos() {
    if (!user) return
    const naoLidosIds = alerts.filter(a => !a.lido).map(a => a.id)
    if (naoLidosIds.length === 0) return

    const inserts = naoLidosIds.map(id => ({ user_id: user.id, alert_id: id }))
    await supabase.from('alert_reads').insert(inserts)
    setAlerts(prev => prev.map(a => ({ ...a, lido: true })))
  }

  return { alerts, naoLidos, loading, isPro, marcarComoLido, marcarTodosComoLidos }
}