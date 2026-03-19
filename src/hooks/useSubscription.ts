'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Subscription {
  plan: string
  status: string
  analyses_used: number
  analyses_limit: number
  trial_ends_at: string | null
  chosen_plan: string
  current_period_end: string | null
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      if (!user) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error && data) setSub(data)
      setLoading(false)
    }
    if (!authLoading) carregar()
  }, [user, authLoading])

  const planoAtivo = sub?.plan ?? 'trial'
  const emTrial = sub?.status === 'trialing'
  const planoEfetivo = emTrial ? 'starter' : planoAtivo

  return { sub, loading: loading || authLoading, planoAtivo, planoEfetivo, emTrial }
}