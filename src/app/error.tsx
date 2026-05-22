"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "#13120f" }}
    >
      <p className="text-5xl mb-4" style={{ opacity: 0.2 }}>⚠️</p>
      <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "#f5f5f0" }}>
        Algo correu mal
      </h1>
      <p className="text-sm mb-8" style={{ color: "#626250" }}>
        Ocorreu um erro inesperado. Tenta novamente.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
        style={{ background: "#e6a81e", color: "#1a1916" }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
