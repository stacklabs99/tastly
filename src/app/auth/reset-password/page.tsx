"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar a palavra-passe.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all";
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0efe9",
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: "#0f0f0d" }}
    >
      <div className="mb-8 text-center">
        <span className="font-serif text-2xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
        <p className="text-[#484640] text-sm mt-1">Nova palavra-passe</p>
      </div>

      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✓</div>
            <p className="font-semibold text-sm" style={{ color: "#7eb8a4" }}>Palavra-passe atualizada!</p>
            <p className="text-xs mt-1" style={{ color: "#484640" }}>A redirecionar…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Nova palavra-passe</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className={inputCls}
                  style={inputStyle}
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

            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Confirmar palavra-passe</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repetir palavra-passe"
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(230,168,30,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {error && (
              <p
                className="text-xs rounded-xl px-3 py-2.5"
                style={{ background: "rgba(230,126,75,0.1)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }}
              >
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
              {loading ? "A guardar…" : "Guardar nova palavra-passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
