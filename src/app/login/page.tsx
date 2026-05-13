'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

function Logo() {
  return (
    <div className="flex flex-col leading-none items-center">
      <div className="bg-emerald-500 px-2 py-1 self-start">
        <span className="text-white font-black text-sm tracking-widest">DATA</span>
      </div>
      <span className="text-white font-black text-xl tracking-widest mt-1">SCOUT</span>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [modo, setModo] = useState<'login' | 'esqueci' | 'nova_senha'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModo('nova_senha')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  function resetar() {
    setErro('')
    setSucesso('')
    setSenha('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
  }

  async function handleEsqueceu(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw new Error(error.message)
      setSucesso('Email de recuperação enviado! Verifique sua caixa de entrada.')
    } catch {
      setErro('Não foi possível enviar o email. Verifique o endereço e tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleNovaSenha(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (novaSenha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (novaSenha !== confirmarNovaSenha) { setErro('As senhas não coincidem.'); return }
    setCarregando(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw new Error(error.message)
      setSucesso('Senha atualizada com sucesso!')
      setTimeout(() => { setModo('login'); resetar() }, 2000)
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)
    try {
      await signIn(email, senha)
      router.push('/inicio')
      router.refresh()
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('Invalid login credentials')) setErro('Email ou senha incorretos.')
      else if (msg.includes('Email not confirmed')) setErro('Confirme seu email antes de entrar.')
      else setErro(`Erro: ${msg}`)
    } finally {
      setCarregando(false)
    }
  }

  // Tela de recuperação de senha
  if (modo === 'esqueci') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8"><Logo /></div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h1 className="text-white font-bold text-xl mb-1">Recuperar senha</h1>
            <p className="text-gray-500 text-sm mb-6">Enviaremos um link de recuperação para seu email.</p>
            <form onSubmit={handleEsqueceu} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required
                  className="w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                />
              </div>
              {erro && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{erro}</p></div>}
              {sucesso && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-sm">{sucesso}</p></div>}
              <button type="submit" disabled={carregando}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 font-bold text-sm py-3 rounded-xl transition-colors">
                {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
            <div className="mt-5 text-center">
              <button onClick={() => { setModo('login'); resetar() }}
                className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                Voltar para o login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tela de nova senha
  if (modo === 'nova_senha') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8"><Logo /></div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h1 className="text-white font-bold text-xl mb-1">Nova senha</h1>
            <p className="text-gray-500 text-sm mb-6">Escolha uma nova senha para sua conta.</p>
            <form onSubmit={handleNovaSenha} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Nova senha</label>
                <div className="relative">
                  <input
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres" required
                    className="w-full bg-gray-800 text-white text-sm px-4 py-3 pr-11 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                  />
                  <button type="button" onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                    {mostrarNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Confirme a nova senha</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmarNovaSenha} onChange={e => setConfirmarNovaSenha(e.target.value)}
                    placeholder="Repita a nova senha" required
                    className={`w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-xl border focus:outline-none placeholder:text-gray-600 ${
                      confirmarNovaSenha && novaSenha !== confirmarNovaSenha
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-gray-700 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {confirmarNovaSenha && novaSenha !== confirmarNovaSenha && (
                  <p className="text-red-400 text-xs mt-1.5">As senhas não coincidem.</p>
                )}
              </div>
              {erro && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{erro}</p></div>}
              {sucesso && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-sm">{sucesso}</p></div>}
              <button type="submit" disabled={carregando}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 font-bold text-sm py-3 rounded-xl transition-colors">
                {carregando ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Tela de login
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-white font-bold text-xl mb-1">Entrar na plataforma</h1>
          <p className="text-gray-500 text-sm mb-6">Acesse sua conta para ver as análises.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required
                className="w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-sm">Senha</label>
                <button type="button" onClick={() => { setModo('esqueci'); resetar() }}
                  className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'} value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required
                  className="w-full bg-gray-800 text-white text-sm px-4 py-3 pr-11 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{erro}</p></div>}
            {sucesso && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-sm">{sucesso}</p></div>}

            <button type="submit" disabled={carregando}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-gray-950 font-bold text-sm py-3 rounded-xl transition-colors mt-1">
              {carregando ? 'Aguarde...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Precisa de suporte?{' '}
          <a href="mailto:bruno@datascout.com.br" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            bruno@datascout.com.br
          </a>
        </p>

        <p className="text-center text-gray-700 text-xs mt-2">
          Plataforma de análise esportiva — acesso restrito
        </p>
      </div>
    </div>
  )
}
