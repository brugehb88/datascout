"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const processSuccess = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      // Pequeno delay para o webhook processar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        // Pega credenciais salvas no sessionStorage
        const email = sessionStorage.getItem("pending_login_email");
        const password = sessionStorage.getItem("pending_login_password");

        if (email && password) {
          // Faz login no browser para criar sessão
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          // Limpa credenciais do sessionStorage
          sessionStorage.removeItem("pending_login_email");
          sessionStorage.removeItem("pending_login_password");

          if (signInError) {
            console.error("Auto-login error:", signInError);
            setStatus("error");
            return;
          }

          setStatus("success");

          // Aguarda 1.5s e redireciona para o subdomínio app
          setTimeout(() => {
            window.location.href = "https://app.datascout.com.br/";
          }, 1500);
        } else {
          // Sem credenciais salvas, manda pra login
          setStatus("error");
        }
      } catch (err) {
        console.error("Error:", err);
        setStatus("error");
      }
    };

    processSuccess();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="fixed inset-0 bg-gradient-to-br from-[#00C853]/5 via-transparent to-transparent" />

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-12">
          <span className="bg-[#00C853] text-black px-3 py-1 font-black text-xl tracking-tight">
            DATA
          </span>
          <span className="text-white font-black text-xl tracking-tight">
            SCOUT
          </span>
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-[#00C853] animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-3">
              Confirmando seu pagamento...
            </h1>
            <p className="text-white/60">
              Aguarde alguns segundos enquanto preparamos sua conta.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#00C853]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center">
                  <CheckCircle2
                    className="w-10 h-10 text-black"
                    strokeWidth={3}
                  />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Bem-vindo ao
              <br />
              <span className="text-[#00C853]">DataScout!</span>
            </h1>

            <p className="text-lg text-white/70 mb-8">
              Seu trial de 7 dias começou. Levando você ao dashboard...
            </p>

            <Loader2 className="w-8 h-8 text-[#00C853] animate-spin mx-auto" />
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-3xl font-black mb-3">
              Pagamento confirmado!
            </h1>
            <p className="text-white/70 mb-8">
              Sua assinatura foi criada com sucesso. Faça login para acessar.
            </p>
            <a
              href="https://app.datascout.com.br/login"
              className="inline-block bg-[#00C853] hover:bg-[#00E676] text-black font-black px-8 py-4 rounded transition"
            >
              Fazer login →
            </a>
          </>
        )}
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
