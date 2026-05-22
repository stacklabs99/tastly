"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { subscribeToast, type ToastEvent } from "@/lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3500);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl pointer-events-auto animate-toast-in"
          style={{
            background: t.type === "error" ? "#2a1a14" : t.type === "success" ? "#142319" : "#1a1a2a",
            border: `1px solid ${t.type === "error" ? "rgba(230,126,75,0.3)" : t.type === "success" ? "rgba(126,184,164,0.3)" : "rgba(126,126,230,0.3)"}`,
            backdropFilter: "blur(12px)",
            minWidth: 240,
            maxWidth: 360,
          }}
        >
          {t.type === "success" && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#7eb8a4" }} />}
          {t.type === "error" && <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#e67e4b" }} />}
          {t.type === "info" && <Info className="w-4 h-4 flex-shrink-0" style={{ color: "#8a8ed6" }} />}
          <p className="text-sm flex-1" style={{ color: "#e8e8e0" }}>{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: "#e8e8e0" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
