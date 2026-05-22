"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";

export default function PlatformLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("Invalid login credentials")
        ? "Email ou palavra-passe incorretos."
        : "Erro ao iniciar sessão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "#0a0a08" }}>
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-serif text-2xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "rgba(155,142,214,0.15)", color: "#9b8ed6" }}
          >
            Platform
          </span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <Shield className="w-3 h-3" style={{ color: "#484640" }} />
          <p className="text-[#484640] text-xs">Acesso restrito à plataforma</p>
        </div>
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
              placeholder="email@exemplo.com"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe9" }}
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
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe9" }}
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
            style={{ background: "#9b8ed6", color: "#1a1916" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "A entrar…" : "Entrar na Plataforma"}
          </button>
        </form>
      </div>
    </div>
  );
}
