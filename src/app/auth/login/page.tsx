"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Mail, Loader2, Shield, CheckCircle2 } from "lucide-react";

const ALLOWED_EMAILS = ["aptm9999@gmail.com", "henriquedspereira09@gmail.com"];

export default function PlatformLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalized = email.trim().toLowerCase();
    if (!ALLOWED_EMAILS.includes(normalized)) {
      setError("Este email não tem acesso à plataforma.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "Erro ao enviar o link. Tenta novamente.");
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
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#9b8ed6" }} />
            <p className="text-sm font-semibold mb-1" style={{ color: "#f0efe9" }}>Link enviado!</p>
            <p className="text-xs leading-relaxed" style={{ color: "#626250" }}>
              Verifica o teu email <span style={{ color: "#9b8ed6" }}>{email}</span> e clica no link para entrar.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-5 text-xs underline"
              style={{ color: "#484640" }}
            >
              Usar outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#484640" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="email@exemplo.com"
                  className="w-full rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0efe9" }}
                />
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
              {loading ? "A enviar…" : "Enviar Magic Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
