"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAdmin } from "@/contexts/AdminContext";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Check } from "lucide-react";

const PRESET_COLORS = [
  { label: "Dourado", value: "#e6a81e" },
  { label: "Verde", value: "#7eb8a4" },
  { label: "Laranja", value: "#e67e4b" },
  { label: "Roxo", value: "#9b8ed6" },
  { label: "Rosa", value: "#e48fb5" },
  { label: "Azul", value: "#5ba3d9" },
  { label: "Vermelho", value: "#d95b5b" },
  { label: "Branco", value: "#e8e8e0" },
];

export default function RestaurantePage() {
  const { restaurant, updateRestaurant, loading } = useAdmin();
  const [form, setForm] = useState({ ...restaurant });
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_url ?? "");
  const [logoError, setLogoError] = useState(false);

  // Re-sync the form once the restaurant finishes loading (context starts empty).
  // Keyed on id so it only runs when real data arrives, not on every edit.
  useEffect(() => {
    setForm({ ...restaurant });
    setCoverUrl(restaurant.cover_url ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id]);

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant({ ...form, cover_url: coverUrl || undefined });
  };

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm text-[#e8e8e0] outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" };
  const sectionCls = "rounded-2xl p-5 space-y-4";
  const sectionStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold uppercase tracking-widest text-[#626250] mb-2">{children}</label>
  );

  const accent = form.primary_color ?? "#e6a81e";

  if (loading) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="h-40 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-40 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-[#f5f5f0]">Restaurante</h1>
        <p className="text-[#626250] text-sm mt-1">Informações e configurações do restaurante</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-2xl">

        {/* Identidade */}
        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Identidade</h2>
          <div>
            <Label>Nome</Label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} style={inputStyle} placeholder="Nome do restaurante" />
          </div>
          <div>
            <Label>Descrição</Label>
            <textarea rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls + " resize-none"} style={inputStyle} placeholder="Breve descrição" />
          </div>
          <div>
            <Label>Tipo de Cozinha</Label>
            <input value={form.cuisine_type ?? ""} onChange={(e) => set("cuisine_type", e.target.value)} className={inputCls} style={inputStyle} placeholder="ex: Mediterrânica, Portuguesa..." />
          </div>
        </div>

        {/* Cor principal */}
        <div className={sectionCls} style={sectionStyle}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Cor de Destaque</h2>
            <div
              className="w-6 h-6 rounded-full border-2"
              style={{ background: accent, borderColor: "rgba(255,255,255,0.2)" }}
            />
          </div>
          <p className="text-xs text-[#484640]">
            Define a cor de acento do menu — preços, tabs activos, badges e botões.
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("primary_color", value)}
                title={label}
                className="relative w-9 h-9 rounded-full transition-transform active:scale-90 hover:scale-105"
                style={{ background: value, border: `2px solid ${accent === value ? "white" : "rgba(255,255,255,0.15)"}` }}
              >
                {accent === value && (
                  <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-[#626250]">Cor personalizada:</label>
            <input
              type="color"
              value={accent}
              onChange={(e) => set("primary_color", e.target.value)}
              className="w-10 h-8 rounded-lg cursor-pointer"
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <span className="text-xs font-mono text-[#626250]">{accent}</span>
          </div>
        </div>

        {/* Imagens */}
        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Imagens</h2>
          <div>
            <Label>Foto de Capa</Label>
            <ImageUpload value={coverUrl} onChange={setCoverUrl} />
          </div>
          <div>
            <Label>Logótipo (URL)</Label>
            <input
              type="url"
              value={form.logo_url ?? ""}
              onChange={(e) => { set("logo_url", e.target.value); setLogoError(false); }}
              className={inputCls}
              style={inputStyle}
              placeholder="https://..."
            />
            {form.logo_url && !logoError && (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Image
                    src={form.logo_url}
                    alt="Logo"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    onError={() => setLogoError(true)}
                    unoptimized
                  />
                </div>
                <span className="text-xs text-[#484640]">Pré-visualização do logótipo</span>
              </div>
            )}
          </div>
        </div>

        {/* Contacto */}
        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Contacto & Localização</h2>
          <div>
            <Label>Morada</Label>
            <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inputCls} style={inputStyle} placeholder="Rua, Número, Cidade" />
          </div>
          <div>
            <Label>Telefone</Label>
            <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputCls} style={inputStyle} placeholder="+351 21 000 0000" />
          </div>
          <div>
            <Label>Link Google Reviews</Label>
            <input
              type="url"
              value={form.review_url ?? ""}
              onChange={(e) => set("review_url", e.target.value)}
              className={inputCls}
              style={inputStyle}
              placeholder="https://g.page/r/..."
            />
            <p className="text-[11px] mt-1" style={{ color: "#3a3830" }}>
              Aparece no final do menu como botão e QR code de avaliação.
            </p>
          </div>
        </div>

        {/* URL do Menu */}
        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">URL do Menu</h2>
          <div>
            <Label>Slug</Label>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="px-3 py-2.5 text-sm text-[#484640] flex-shrink-0" style={{ background: "rgba(255,255,255,0.02)" }}>/menu/</span>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 px-3 py-2.5 text-sm text-[#e8e8e0] outline-none"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
            <p className="text-xs text-[#484640] mt-1">Link público: <span className="text-[#626250]">/menu/{form.slug}</span></p>
          </div>
        </div>

        {/* Save */}
        <div className="pb-8">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1a1916] transition-all active:scale-95 hover:brightness-110"
            style={{ background: "#e6a81e" }}
          >
            Guardar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
