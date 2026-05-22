"use client";

import { useState, useEffect, useTransition } from "react";
import { Loader2, Check, X, ChevronRight } from "lucide-react";
import { checkSlugAvailable, createRestaurantAction } from "@/actions/onboarding";
import type { Plan } from "@/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

const PLANS: { id: Plan; name: string; price: number | null; desc: string; features: string[]; color: string; popular: boolean }[] = [
  {
    id: "starter",
    name: "Starter",
    price: 39,
    desc: "Para começar",
    features: ["1 restaurante", "Pratos ilimitados", "IA de maridagem", "4 idiomas", "QR code"],
    color: "#96967f",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 69,
    desc: "Para crescer",
    features: ["Até 3 restaurantes", "Tudo do Starter", "Maridagens manuais", "Suporte prioritário"],
    color: "#e6a81e",
    popular: true,
  },
  {
    id: "custom",
    name: "Custom",
    price: null,
    desc: "Grupos e cadeias",
    features: ["Restaurantes ilimitados", "Tudo do Pro", "Gestor dedicado", "Onboarding personalizado"],
    color: "#9b8ed6",
    popular: false,
  },
];

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [cuisineType, setCuisineType] = useState("");
  const [plan, setPlan] = useState<Plan>("pro");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Auto-generate slug from name
  useEffect(() => {
    if (slugManual) return;
    const generated = slugify(name);
    setSlug(generated);
  }, [name, slugManual]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    const t = setTimeout(async () => {
      const available = await checkSlugAvailable(slug);
      setSlugStatus(available ? "available" : "taken");
    }, 500);
    return () => clearTimeout(t);
  }, [slug]);

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(slugify(val));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("O nome do restaurante é obrigatório."); return; }
    if (!slug) { setError("O URL é obrigatório."); return; }
    if (slugStatus === "taken") { setError("Este URL já está em uso."); return; }
    if (slugStatus === "checking") { setError("Aguarda a verificação do URL."); return; }

    startTransition(async () => {
      try {
        await createRestaurantAction({ name, slug, cuisine_type: cuisineType, plan });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao criar restaurante.");
      }
    });
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0efe9",
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-start px-4 py-12" style={{ background: "#0f0f0d" }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="font-serif text-2xl font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
          <h1 className="text-xl font-semibold mt-3 mb-1" style={{ color: "#f0efe9" }}>Configura o teu restaurante</h1>
          <p className="text-sm" style={{ color: "#626250" }}>15 dias grátis · Sem cartão de crédito necessário</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Restaurant details */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "#96967f" }}>Detalhes do restaurante</h2>

            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Nome do restaurante *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Tasca do Zé"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">URL do menu *</label>
              <div className="flex items-center gap-0">
                <span
                  className="px-3.5 py-2.5 text-xs rounded-l-xl border-r-0 flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#484640", borderRight: "none" }}
                >
                  tastly.pt/menu/
                </span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    required
                    placeholder="tasca-do-ze"
                    className="w-full rounded-r-xl px-3.5 py-2.5 pr-9 text-sm outline-none"
                    style={{ ...inputStyle, borderLeft: "none", borderRadius: "0 12px 12px 0" }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {slugStatus === "checking" && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#484640" }} />}
                    {slugStatus === "available" && <Check className="w-3.5 h-3.5" style={{ color: "#7eb8a4" }} />}
                    {slugStatus === "taken" && <X className="w-3.5 h-3.5" style={{ color: "#e67e4b" }} />}
                  </span>
                </div>
              </div>
              {slugStatus === "taken" && (
                <p className="text-xs mt-1.5" style={{ color: "#e67e4b" }}>Este URL já está em uso. Escolhe outro.</p>
              )}
              {slugStatus === "available" && (
                <p className="text-xs mt-1.5" style={{ color: "#7eb8a4" }}>Disponível!</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#848470] mb-1.5">Tipo de cozinha <span style={{ color: "#484640" }}>(opcional)</span></label>
              <input
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                placeholder="Ex: Portuguesa, Italiana, Japonesa…"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Plan selection */}
          <div>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#96967f" }}>Escolhe o teu plano</h2>
            <div className="grid grid-cols-1 gap-3">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className="w-full text-left rounded-2xl p-4 transition-all"
                  style={{
                    background: plan === p.id ? `color-mix(in srgb, ${p.color} 8%, transparent)` : "rgba(255,255,255,0.02)",
                    border: plan === p.id ? `1.5px solid ${p.color}` : "1.5px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold" style={{ color: p.color }}>{p.name}</span>
                        {p.popular && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)`, color: p.color }}>
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {p.features.map((f) => (
                          <span key={f} className="text-xs" style={{ color: "#626250" }}>· {f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {p.price ? (
                        <>
                          <span className="text-base font-bold" style={{ color: "#f0efe9" }}>{p.price}€</span>
                          <span className="text-xs block" style={{ color: "#484640" }}>/mês</span>
                        </>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: p.color }}>Contacto</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs mt-3 text-center" style={{ color: "#3a3830" }}>
              15 dias grátis em qualquer plano. Sem compromisso.
            </p>
          </div>

          {error && (
            <p className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(230,126,75,0.1)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || slugStatus === "taken" || slugStatus === "checking"}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {isPending ? "A criar restaurante…" : "Criar Restaurante e Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
