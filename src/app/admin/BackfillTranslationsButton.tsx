"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { backfillDishTranslations } from "@/actions/superadmin";

export function BackfillTranslationsButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<{ done: number; skipped: number; failed: number } | null>(null);

  async function handleClick() {
    setState("loading");
    try {
      const res = await backfillDishTranslations();
      setResult(res);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "done" && result) {
    return (
      <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(126,184,164,0.15)", color: "#7eb8a4", border: "1px solid rgba(126,184,164,0.2)" }}>
        Traduzidos: {result.done} · Já OK: {result.skipped} · Falhou: {result.failed}
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
      style={{ background: "rgba(255,255,255,0.06)", color: "#e8e8e0", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <Languages className="w-4 h-4" />
      {state === "loading" ? "A traduzir..." : "Auto-traduzir pratos em falta"}
    </button>
  );
}
