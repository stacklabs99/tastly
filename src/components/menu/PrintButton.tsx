"use client";

import { Printer } from "lucide-react";

export function PrintButton({ accent }: { accent: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95 hover:brightness-110"
      style={{ background: accent, color: "#fff" }}
    >
      <Printer className="w-4 h-4" />
      Imprimir / Guardar PDF
    </button>
  );
}
