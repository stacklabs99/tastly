"use client";

import { useState } from "react";
import Image from "next/image";
import { useAdmin } from "@/contexts/AdminContext";

export default function RestaurantePage() {
  const { restaurant, updateRestaurant } = useAdmin();
  const [form, setForm] = useState({ ...restaurant });
  const [saved, setSaved] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (key === "cover_url") setCoverError(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm text-[#e8e8e0] outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" };
  const sectionCls = "rounded-2xl p-5 space-y-4";
  const sectionStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold uppercase tracking-widest text-[#626250] mb-2">{children}</label>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-[#f5f5f0]">Restaurante</h1>
        <p className="text-[#626250] text-sm mt-1">Informações e configurações do restaurante</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-2xl">

        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Identidade</h2>
          <div><Label>Nome</Label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} style={inputStyle} placeholder="Nome do restaurante" />
          </div>
          <div><Label>Descrição</Label>
            <textarea rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className={inputCls + " resize-none"} style={inputStyle} placeholder="Breve descrição" />
          </div>
          <div><Label>Tipo de Cozinha</Label>
            <input value={form.cuisine_type ?? ""} onChange={(e) => set("cuisine_type", e.target.value)} className={inputCls} style={inputStyle} placeholder="ex: Mediterrânica, Portuguesa..." />
          </div>
        </div>

        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Contacto & Localização</h2>
          <div><Label>Morada</Label>
            <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inputCls} style={inputStyle} placeholder="Rua, Número, Cidade" />
          </div>
          <div><Label>Telefone</Label>
            <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputCls} style={inputStyle} placeholder="+351 21 000 0000" />
          </div>
        </div>

        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Imagens</h2>
          <div><Label>Foto de Capa</Label>
            <input type="url" value={form.cover_url ?? ""} onChange={(e) => set("cover_url", e.target.value)} className={inputCls} style={inputStyle} placeholder="https://..." />
            {form.cover_url && !coverError && (
              <div className="relative mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: "21/6", background: "#2a2926" }}>
                <Image src={form.cover_url} alt="Cover" fill className="object-cover" onError={() => setCoverError(true)} unoptimized />
              </div>
            )}
            {coverError && <p className="text-xs text-[#e67e4b] mt-1">URL inválido</p>}
          </div>
          <div><Label>Logótipo (URL)</Label>
            <input type="url" value={form.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} className={inputCls} style={inputStyle} placeholder="https://..." />
          </div>
        </div>

        <div className={sectionCls} style={sectionStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">URL do Menu</h2>
          <div><Label>Slug</Label>
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

        <div className="pb-8">
          <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1a1916] transition-all active:scale-95" style={{ background: saved ? "#7eb8a4" : "#e6a81e" }}>
            {saved ? "✓ Guardado!" : "Guardar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
