"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { AlertCircle } from "lucide-react";

export function AdminErrorBanner() {
  const { loadError } = useAdmin();
  if (!loadError) return null;

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 text-sm"
      style={{ background: "rgba(230,126,75,0.1)", borderBottom: "1px solid rgba(230,126,75,0.2)" }}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#e67e4b" }} />
      <p style={{ color: "#e67e4b" }}>
        Não foi possível carregar os dados. Verifica a tua ligação e{" "}
        <button
          onClick={() => window.location.reload()}
          className="underline font-semibold"
        >
          recarrega a página
        </button>
        .
      </p>
    </div>
  );
}
