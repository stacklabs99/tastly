"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, CreditCard, Zap, Calendar, Star, AlertCircle } from "lucide-react";
import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing";

type Props = {
  restaurantId: string;
  slug: string;
  plan: "starter" | "pro" | "custom";
  trialDaysLeft: number | null;
  hasSubscription: boolean;
};

export function BillingClient({ restaurantId, slug, plan, trialDaysLeft, hasSubscription }: Props) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const paymentStatus = params.get("payment");

  const isPro = plan === "pro" || plan === "custom";
  const trialExpired = trialDaysLeft !== null && trialDaysLeft <= 0;

  async function handleCheckout() {
    setLoading(true);
    try {
      const url = await createCheckoutSession(restaurantId, slug, interval);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const url = await createBillingPortalSession(restaurantId, slug);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm mb-1" style={{ color: "#626250" }}>Conta</p>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>Plano</h1>
      </div>

      {/* Payment feedback */}
      {paymentStatus === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(126,184,164,0.1)", border: "1px solid rgba(126,184,164,0.2)" }}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#7eb8a4" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#7eb8a4" }}>Pagamento confirmado!</p>
            <p className="text-xs mt-0.5" style={{ color: "#626250" }}>O teu plano Pro está activo. Obrigado!</p>
          </div>
        </div>
      )}

      {paymentStatus === "cancelled" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(230,126,75,0.08)", border: "1px solid rgba(230,126,75,0.15)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#e67e4b" }} />
          <p className="text-sm" style={{ color: "#e67e4b" }}>Pagamento cancelado. Podes tentar novamente quando quiseres.</p>
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#484640" }}>Plano Actual</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isPro ? "rgba(230,168,30,0.12)" : "rgba(255,255,255,0.05)" }}>
            {isPro ? <Star className="w-5 h-5" style={{ color: "#e6a81e" }} /> : <Zap className="w-5 h-5" style={{ color: "#626250" }} />}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "#f5f5f0" }}>
              {plan === "custom" ? "Custom" : isPro ? "Pro" : "Starter (Trial)"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#626250" }}>
              {isPro
                ? "Acesso completo a todas as funcionalidades"
                : trialDaysLeft !== null && trialDaysLeft > 0
                  ? `${trialDaysLeft} dia${trialDaysLeft !== 1 ? "s" : ""} de trial restantes`
                  : "Trial expirado"}
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade section — only for non-pro */}
      {!isPro && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#484640" }}>Upgrade para Pro</p>

          {/* Interval toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6 w-fit" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["monthly", "yearly"] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                className="px-5 py-2.5 text-sm font-medium transition-all"
                style={interval === i
                  ? { background: "rgba(230,168,30,0.15)", color: "#e6a81e" }
                  : { background: "rgba(255,255,255,0.03)", color: "#626250" }}
              >
                {i === "monthly" ? "Mensal" : "Anual"}
                {i === "yearly" && (
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(126,184,164,0.15)", color: "#7eb8a4" }}>
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Price display */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold" style={{ color: "#f5f5f0" }}>
                {interval === "monthly" ? "€29" : "€290"}
              </span>
              <span className="text-sm" style={{ color: "#626250" }}>
                {interval === "monthly" ? "/mês" : "/ano"}
              </span>
              {interval === "yearly" && (
                <span className="text-xs" style={{ color: "#626250" }}>≈ €24,17/mês</span>
              )}
            </div>
            {interval === "yearly" && (
              <p className="text-xs mt-1" style={{ color: "#7eb8a4" }}>Poupas €58 por ano (2 meses grátis)</p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-2 mb-6">
            {[
              "Menu digital ilimitado",
              "Traduções automáticas EN/ES/FR",
              "IA de maridagem para cada prato",
              "QR Code personalizado",
              "Dashboard com estatísticas",
              "Suporte prioritário",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#d4d4c8" }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#7eb8a4" }} />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "A redirecionar..." : `Subscrever ${interval === "monthly" ? "por €29/mês" : "por €290/ano"}`}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: "#484640" }}>
            Pagamento seguro via Stripe · Cancela quando quiseres
          </p>
        </div>
      )}

      {/* Manage subscription — for pro users */}
      {isPro && hasSubscription && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#484640" }}>Gerir Subscrição</p>
          <p className="text-sm mb-4" style={{ color: "#626250" }}>
            Altera o método de pagamento, descarrega facturas ou cancela a subscrição.
          </p>
          <button
            onClick={handlePortal}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)", color: "#e8e8e0", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Calendar className="w-4 h-4" />
            {loading ? "A redirecionar..." : "Portal de faturação"}
          </button>
        </div>
      )}
    </div>
  );
}
