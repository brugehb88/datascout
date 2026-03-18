'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'
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

function Divisor() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-gray-800" />
      <span className="text-gray-600 text-xs">ou</span>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

function BotaoGoogle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
      </svg>
      Acessar com Google
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [modo, setModo] = useState<'login' | 'cadastro' | 'esqueci' | 'nova_senha'>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModo('nova_senha')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  function resetar() {
    setErro('')
    setSucesso('')
    setNome('')
    setSenha('')
    setConfirmarSenha('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
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
    } catch (err: any) {
      setErro('Não foi possível enviar o email. Verifique o endereço e tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleNovaSenha(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (novaSenha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
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

    if (modo === 'cadastro') {
      if (!nome.trim()) { setErro('Informe seu nome.'); return }
      if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
      if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }
    }

    setCarregando(true)
    try {
      if (modo === 'login') {
        await signIn(email, senha)
        router.push('/')
        router.refresh()
      } else {
        await signUp(email, senha)
        setSucesso('Conta criada! Verifique seu email para confirmar o cadastro.')
      }
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('Invalid login credentials')) setErro('Email ou senha incorretos.')
      else if (msg.includes('User already registered')) setErro('Este email já está cadastrado.')
      else if (msg.includes('Email not confirmed')) setErro('Confirme seu email antes de entrar.')
      else setErro(`Erro: ${msg}`)
    } finally {
      setCarregando(false)
    }
  }

  // Tela de recuperação — envio do email
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

  // Tela de nova senha — após clicar no link do email
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
                    type={mostrarSenha ? 'text' : 'password'}
                    value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 8 caracteres" required
                    className="w-full bg-gray-800 text-white text-sm px-4 py-3 pr-11 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                  />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Confirme a nova senha</label>
                <div className="relative">
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarNovaSenha} onChange={e => setConfirmarNovaSenha(e.target.value)}
                    placeholder="Repita a nova senha" required
                    className={`w-full bg-gray-800 text-white text-sm px-4 py-3 pr-11 rounded-xl border focus:outline-none placeholder:text-gray-600 ${
                      confirmarNovaSenha && novaSenha !== confirmarNovaSenha
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-gray-700 focus:border-emerald-500'
                    }`}
                  />
                  <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                    {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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

  // Tela principal — login e cadastro
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-white font-bold text-xl mb-1">
            {modo === 'login' ? 'Entrar na plataforma' : 'Criar conta'}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {modo === 'login' ? 'Acesse sua conta para ver as análises.' : 'Crie sua conta para acessar a plataforma.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {modo === 'cadastro' && (
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Nome</label>
                <input
                  type="text" value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome completo" required
                  className="w-full bg-gray-800 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                />
              </div>
            )}

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
                {modo === 'login' && (
                  <button type="button" onClick={() => { setModo('esqueci'); resetar() }}
                    className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'} value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres" required
                  className="w-full bg-gray-800 text-white text-sm px-4 py-3 pr-11 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {modo === 'cadastro' && (
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Confirme a senha</label>
                <div className="relative">
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'} value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Repita sua senha" required
                    className={`w-full bg-gray-800 text-white text-sm px-4 py-3 pr-11 rounded-xl border focus:outline-none placeholder:text-gray-600 transition-colors ${
                      confirmarSenha && senha !== confirmarSenha
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-gray-700 focus:border-emerald-500'
                    }`}
                  />
                  <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                    {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmarSenha && senha !== confirmarSenha && (
                  <p className="text-red-400 text-xs mt-1.5">As senhas não coincidem.</p>
                )}
              </div>
            )}

            {erro && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{erro}</p></div>}
            {sucesso && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-sm">{sucesso}</p></div>}

            <button type="submit" disabled={carregando}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-gray-950 font-bold text-sm py-3 rounded-xl transition-colors mt-1">
              {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <Divisor />
          <BotaoGoogle onClick={handleGoogle} />

          <div className="mt-5 text-center">
            <span className="text-gray-500 text-sm">
              {modo === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            </span>
            <button onClick={() => { setModo(modo === 'login' ? 'cadastro' : 'login'); resetar() }}
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
              {modo === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Plataforma de análise esportiva — acesso restrito
        </p>
      </div>
    </div>
  )
}