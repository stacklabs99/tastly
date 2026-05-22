"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

export function PendingApproval() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  async function handleCheck() {
    setChecking(true);
    router.refresh();
    await new Promise((r) => setTimeout(r, 1200));
    setChecking(false);
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "#0f0f0d" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center space-y-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "rgba(230,168,30,0.1)", border: "1px solid rgba(230,168,30,0.2)" }}
        >
          <Clock className="w-7 h-7" style={{ color: "#e6a81e" }} />
        </div>

        <div>
          <h1 className="text-base font-semibold mb-2" style={{ color: "#f0efe9" }}>
            Conta a aguardar aprovação
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>
            A tua conta foi criada com sucesso. A nossa equipa irá analisar o pedido e activar o acesso em breve.
          </p>
        </div>

        <div
          className="rounded-xl px-4 py-3 text-xs text-left space-y-1.5"
          style={{ background: "rgba(230,168,30,0.06)", border: "1px solid rgba(230,168,30,0.12)" }}
        >
          <p className="font-semibold" style={{ color: "#e6a81e" }}>O que acontece a seguir?</p>
          <p style={{ color: "#96967f" }}>1. Receberás um email quando a conta for activada.</p>
          <p style={{ color: "#96967f" }}>2. Depois poderás configurar o teu restaurante.</p>
          <p style={{ color: "#96967f" }}>3. O trial de 15 dias começa na activação.</p>
        </div>

        <button
          onClick={handleCheck}
          disabled={checking}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8e0" }}
        >
          {checking
            ? <><Loader2 className="w-4 h-4 animate-spin" /> A verificar…</>
            : <><RefreshCw className="w-4 h-4" /> Verificar estado</>}
        </button>

        <p className="text-xs" style={{ color: "#3a3830" }}>
          Questões?{" "}
          <Link href="mailto:stacklabs99@gmail.com" className="underline hover:text-[#e6a81e] transition-colors">
            Contacta-nos
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <span className="font-serif text-xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
      </div>
    </div>
  );
}
