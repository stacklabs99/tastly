"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Sparkles, X, Check, Loader2, ArrowLeft, FileText } from "lucide-react";
import { bulkCreateMenu, type ImportCategory } from "@/actions/import";
import { showToast } from "@/lib/toast";

type Step = "upload" | "review" | "saving";

const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#e8e8e0" };

export default function ImportarPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const base = `/menu/${slug}/admin`;

  const [step, setStep] = useState<Step>("upload");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [cats, setCats] = useState<ImportCategory[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const totalDishes = cats.reduce((n, c) => n + c.dishes.length, 0);

  async function handleFile(file: File) {
    setError("");
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      const res = await fetch("/api/import-menu", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao ler o menu");
      if (!data.categories?.length) throw new Error("Não foi possível identificar pratos no ficheiro.");
      setCats(data.categories);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao ler o menu");
    } finally {
      setParsing(false);
    }
  }

  function updateDish(ci: number, di: number, field: "name" | "description" | "price", value: string) {
    setCats((prev) => prev.map((c, i) => i !== ci ? c : {
      ...c,
      dishes: c.dishes.map((d, j) => j !== di ? d : {
        ...d,
        [field]: field === "price" ? (parseFloat(value) || 0) : value,
      }),
    }));
  }

  function removeDish(ci: number, di: number) {
    setCats((prev) => prev.map((c, i) => i !== ci ? c : { ...c, dishes: c.dishes.filter((_, j) => j !== di) }).filter((c) => c.dishes.length > 0));
  }

  function updateCatName(ci: number, value: string) {
    setCats((prev) => prev.map((c, i) => i !== ci ? c : { ...c, name: value }));
  }

  function removeCat(ci: number) {
    setCats((prev) => prev.filter((_, i) => i !== ci));
  }

  async function confirmImport() {
    setStep("saving");
    try {
      const result = await bulkCreateMenu(slug, cats);
      showToast(`Importados ${result.dishes} pratos em ${result.categories} categorias`, "success");
      // Full reload so the admin context picks up the new data
      window.location.href = `${base}/pratos`;
    } catch {
      showToast("Erro ao importar o menu", "error");
      setStep("review");
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <button onClick={() => router.push(`${base}/pratos`)} className="flex items-center gap-1.5 text-xs mb-5 transition-colors hover:text-[#e8e8e0]" style={{ color: "#626250" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos pratos
      </button>

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5" style={{ color: "#e6a81e" }} />
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>Importar menu com IA</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: "#626250" }}>
        Carrega uma foto ou PDF do teu menu — a IA extrai os pratos, preços e categorias para reveres antes de criar.
      </p>

      {/* ── Upload ── */}
      {step === "upload" && (
        <div>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={parsing}
            className="w-full rounded-2xl p-10 flex flex-col items-center gap-3 transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "rgba(230,168,30,0.05)", border: "2px dashed rgba(230,168,30,0.3)" }}
          >
            {parsing ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#e6a81e" }} />
                <p className="text-sm font-medium" style={{ color: "#e6a81e" }}>A ler o menu com IA…</p>
                <p className="text-xs" style={{ color: "#626250" }}>Pode demorar até 30 segundos</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8" style={{ color: "#e6a81e" }} />
                <p className="text-sm font-semibold" style={{ color: "#f0efe9" }}>Carregar foto ou PDF do menu</p>
                <p className="text-xs" style={{ color: "#626250" }}>JPEG, PNG, WebP ou PDF · máx. 10 MB</p>
              </>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          {error && (
            <p className="text-sm mt-4 px-4 py-3 rounded-xl" style={{ background: "rgba(230,126,75,0.08)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }}>
              {error}
            </p>
          )}
          <div className="mt-6 flex items-start gap-2 text-xs" style={{ color: "#484640" }}>
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Dica: uma foto nítida e direita, ou o PDF original do menu, dão os melhores resultados. Vais poder rever e corrigir tudo antes de guardar.</p>
          </div>
        </div>
      )}

      {/* ── Review ── */}
      {(step === "review" || step === "saving") && (
        <div>
          <div className="flex items-center justify-between mb-4 sticky top-0 py-2 z-10" style={{ background: "#141412" }}>
            <p className="text-sm" style={{ color: "#a8a692" }}>
              <strong style={{ color: "#f0efe9" }}>{cats.length}</strong> categorias · <strong style={{ color: "#f0efe9" }}>{totalDishes}</strong> pratos
            </p>
            <button
              onClick={confirmImport}
              disabled={step === "saving" || totalDishes === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "#e6a81e", color: "#1a1916" }}
            >
              {step === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /> A importar…</> : <><Check className="w-4 h-4" /> Confirmar e criar</>}
            </button>
          </div>

          <div className="space-y-4">
            {cats.map((cat, ci) => (
              <div key={ci} className="rounded-2xl p-4" style={card}>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={cat.name}
                    onChange={(e) => updateCatName(ci, e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold outline-none"
                    style={inputStyle}
                  />
                  <button onClick={() => removeCat(ci)} title="Remover categoria" className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:text-[#e67e4b]" style={{ color: "#484640" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {cat.dishes.map((dish, di) => (
                    <div key={di} className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          value={dish.name}
                          onChange={(e) => updateDish(ci, di, "name", e.target.value)}
                          className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                          style={inputStyle}
                          placeholder="Nome do prato"
                        />
                        <input
                          value={dish.description ?? ""}
                          onChange={(e) => updateDish(ci, di, "description", e.target.value)}
                          className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          style={inputStyle}
                          placeholder="Descrição (opcional)"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <input
                          type="number"
                          step="0.5"
                          value={dish.price || ""}
                          onChange={(e) => updateDish(ci, di, "price", e.target.value)}
                          className="w-20 rounded-lg px-2 py-1.5 text-sm text-right outline-none"
                          style={inputStyle}
                          placeholder="0"
                        />
                        <span className="text-xs" style={{ color: "#626250" }}>€</span>
                        <button onClick={() => removeDish(ci, di)} title="Remover prato" className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:text-[#e67e4b]" style={{ color: "#3a3830" }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs mt-5 leading-relaxed" style={{ color: "#484640" }}>
            Revê os nomes e preços. As categorias importadas são adicionadas às existentes. Podes editar tudo depois nos Pratos. As traduções não são geradas automaticamente na importação — gera-as depois conforme precisares.
          </p>
        </div>
      )}
    </div>
  );
}
