"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("A palavra-passe deve ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { setError("As palavras-passe não coincidem."); return; }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.push("/onboarding");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already registered")) {
        setError("Este email já tem conta. Faz login.");
      } else {
        setError(msg || "Erro ao criar conta. Tenta novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0efe9",
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "#0f0f0d" }}>
      <div className="mb-8 text-center">
        <Link href="/">
          <span className="font-serif text-2xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
        </Link>
        <p className="text-[#484640] text-sm mt-1">Cria a tua conta gratuitamente</p>
      </div>

      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#848470] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="email@restaurante.com"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#848470] mb-1.5">Palavra-passe</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none"
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#484640" }} tabIndex={-1}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#848470] mb-1.5">Confirmar palavra-passe</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repetir palavra-passe"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(230,126,75,0.1)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "A criar conta…" : "Criar Conta Grátis"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: "#484640" }}>
          Já tens conta?{" "}
          <Link href="/auth/login" className="underline hover:text-[#e6a81e] transition-colors">
            Inicia sessão
          </Link>
        </p>
      </div>

      <p className="mt-6 text-[11px] text-center max-w-xs" style={{ color: "#3a3830" }}>
        Ao criares conta, aceitas os nossos termos de serviço. 15 dias grátis, sem cartão necessário.
      </p>
    </div>
  );
}
