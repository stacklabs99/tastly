"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Catches errors in the root layout itself (where the normal error.tsx can't render).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt">
      <body style={{ background: "#13120f", color: "#f5f5f0", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16 }}>
          <p style={{ fontSize: 48, opacity: 0.2, margin: 0 }}>⚠️</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, margin: "16px 0 8px" }}>
            Algo correu mal
          </h1>
          <p style={{ fontSize: 14, color: "#626250", marginBottom: 32 }}>
            Ocorreu um erro inesperado. Tenta novamente.
          </p>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", borderRadius: 999, fontSize: 14, fontWeight: 600, background: "#e6a81e", color: "#1a1916", border: "none", cursor: "pointer" }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
