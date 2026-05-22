"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(`/menu/${slug}/admin`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Invalid login credentials")) {
        setError("Email ou palavra-passe incorretos.");
      } else {
        setError("Não foi possível iniciar sessão. Tenta novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: "#0f0f0d" }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-serif text-2xl font-bold" style={{ color: "#e6a81e" }}>
            Tastly
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "rgba(230,168,30,0.12)", color: "#e6a81e" }}
          >
            Admin
          </span>
        </div>
        <p className="text-[#484640] text-sm">Acesso restrito</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="email@exemplo.com"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe9" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(230,168,30,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#848470]">Palavra-passe</label>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(""); }}
                  className="text-[11px] transition-colors hover:text-[#e6a81e]"
                  style={{ color: "#484640" }}
                >
                  Esqueci a palavra-passe
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe9" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(230,168,30,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#484640" }}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
              {loading ? "A entrar…" : "Entrar"}
            </button>
          </form>
        ) : resetSent ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-2xl">📧</p>
            <p className="font-semibold text-sm" style={{ color: "#7eb8a4" }}>Email enviado!</p>
            <p className="text-xs leading-relaxed" style={{ color: "#626250" }}>
              Verifica a tua caixa de entrada e clica no link para definir uma nova palavra-passe.
            </p>
            <button
              onClick={() => { setMode("login"); setResetSent(false); }}
              className="mt-3 text-xs transition-colors hover:text-[#e6a81e]"
              style={{ color: "#484640" }}
            >
              ← Voltar ao login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <p className="text-xs mb-4" style={{ color: "#626250" }}>
                Indica o teu email e enviamos um link para definires uma nova palavra-passe.
              </p>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="email@exemplo.com"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe9" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(230,168,30,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
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
              {loading ? "A enviar…" : "Enviar link de recuperação"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="w-full text-xs py-2 transition-colors hover:text-[#e6a81e]"
              style={{ color: "#484640" }}
            >
              ← Voltar ao login
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-[11px] text-[#3a3830]">Menu digital por Tastly</p>
    </div>
  );
}
