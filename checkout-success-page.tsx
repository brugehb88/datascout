"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Você pode fazer uma chamada para confirmar o session_id se quiser
    // Por enquanto, apenas mostra a tela de sucesso
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00C853] animate-spin mx-auto mb-4" />
          <div className="text-white/60">Confirmando seu pagamento...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#00C853]/5 via-transparent to-transparent" />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <span className="bg-[#00C853] text-black px-3 py-1 font-black text-xl tracking-tight">
            DATA
          </span>
          <span className="text-white font-black text-xl tracking-tight">
            SCOUT
          </span>
        </div>

        {/* Ícone de sucesso */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-[#00C853]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Bem-vindo ao
          <br />
          <span className="text-[#00C853]">DataScout!</span>
        </h1>

        <p className="text-lg text-white/70 mb-8 leading-relaxed">
          Seu pagamento foi confirmado e seu trial de 7 dias começou agora.
        </p>

        {/* Próximos passos */}
        <div className="bg-zinc-950 border border-white/10 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#00C853]" />
            Próximos passos
          </h3>

          <ol className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-3">
              <span className="bg-[#00C853]/20 text-[#00C853] w-6 h-6 rounded-full flex items-center justify-center font-black flex-shrink-0">
                1
              </span>
              <span>
                <strong>Verifique seu e-mail</strong> — Enviamos um link de
                acesso. Pode levar até 2 minutos para chegar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-[#00C853]/20 text-[#00C853] w-6 h-6 rounded-full flex items-center justify-center font-black flex-shrink-0">
                2
              </span>
              <span>
                <strong>Clique no link</strong> para criar sua senha e acessar
                a plataforma.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-[#00C853]/20 text-[#00C853] w-6 h-6 rounded-full flex items-center justify-center font-black flex-shrink-0">
                3
              </span>
              <span>
                <strong>Comece a analisar partidas</strong> e tomar decisões
                fundamentadas em dados reais.
              </span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#00C853] hover:bg-[#00E676] text-black font-black px-8 py-4 rounded transition-all hover:scale-105"
          >
            Acessar Plataforma
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="text-sm text-white/40">
            Não recebeu o e-mail? Verifique a caixa de spam ou{" "}
            <a
              href="mailto:contato@datascout.com.br"
              className="text-[#00C853] hover:underline"
            >
              entre em contato
            </a>
            .
          </div>
        </div>

        {/* Confirmação de cobrança */}
        <div className="mt-12 pt-8 border-t border-white/5 text-xs text-white/40 leading-relaxed">
          <p>
            🎉 Seu trial gratuito de 7 dias começou. Após esse período, sua
            assinatura será cobrada automaticamente. Você pode cancelar a
            qualquer momento direto na sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#00C853] animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
