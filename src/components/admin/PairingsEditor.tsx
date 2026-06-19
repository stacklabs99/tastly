"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Wine, Salad, UtensilsCrossed, Cake, Link2, Search, PenLine } from "lucide-react";
import Image from "next/image";
import type { ManualPairings, RecommendationItem, Dish, Category } from "@/types";

type PairingKey = keyof ManualPairings;

const TABS: { key: PairingKey; label: string; icon: React.ReactNode; color: string; catKeywords: string[] }[] = [
  { key: "wines",    label: "Vinhos",     icon: <Wine className="w-4 h-4" />,           color: "#e6a81e", catKeywords: ["vinho", "wine"] },
  { key: "starters", label: "Entradas",   icon: <Salad className="w-4 h-4" />,          color: "#7eb8a4", catKeywords: ["entrada", "starter", "aperitivo"] },
  { key: "mains",    label: "Pratos",     icon: <UtensilsCrossed className="w-4 h-4" />, color: "#9b8ed6", catKeywords: ["principal", "main", "prato"] },
  { key: "desserts", label: "Sobremesas", icon: <Cake className="w-4 h-4" />,            color: "#c89b7b", catKeywords: ["sobremesa", "dessert"] },
];

const empty = (): RecommendationItem => ({ name: "", description: "", why: "" });

type Props = {
  value: ManualPairings;
  onChange: (v: ManualPairings) => void;
  dishes?: Dish[];
  categories?: Category[];
};

export function PairingsEditor({ value, onChange, dishes = [], categories = [] }: Props) {
  const [activeTab, setActiveTab] = useState<PairingKey>("wines");
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const items = value[activeTab];

  const catById = Object.fromEntries(categories.map((c) => [c.id, c.name.toLowerCase()]));

  const suggestedDishes = dishes.filter((d) => {
    const catName = catById[d.category_id] ?? "";
    return tab.catKeywords.some((k) => catName.includes(k));
  });
  const pickerDishes = (suggestedDishes.length > 0 ? suggestedDishes : dishes)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  const update = (idx: number, field: keyof RecommendationItem, val: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [field]: val } : it));
    onChange({ ...value, [activeTab]: next });
  };

  const addFromDish = (dish: Dish) => {
    const catName = categories.find((c) => c.id === dish.category_id)?.name ?? "";
    const item: RecommendationItem = {
      name: dish.name,
      description: [catName, dish.price ? `${dish.price.toFixed(2)} €` : ""].filter(Boolean).join(" · "),
      why: "",
      dish_id: dish.id,
    };
    onChange({ ...value, [activeTab]: [...items, item] });
    setShowPicker(false);
    setSearch("");
  };

  const addManual = () => {
    onChange({ ...value, [activeTab]: [...items, empty()] });
    setShowPicker(false);
    setSearch("");
  };

  const remove = (idx: number) =>
    onChange({ ...value, [activeTab]: items.filter((_, i) => i !== idx) });

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm outline-none transition-all";
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#e8e8e0" };

  const totalItems = Object.values(value).reduce((s, arr) => s + arr.length, 0);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        {TABS.map((t) => {
          const count = value[t.key].length;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
              style={isActive ? { background: "rgba(255,255,255,0.07)", color: t.color } : { color: "#484640" }}
            >
              <span style={{ color: isActive ? t.color : "#484640" }}>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {count > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: isActive ? t.color : "rgba(255,255,255,0.08)", color: isActive ? "#1a1916" : "#626250" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div
            className="text-center py-8 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
          >
            <p className="text-sm" style={{ color: "#484640" }}>Sem {tab.label.toLowerCase()} adicionados</p>
            <p className="text-xs mt-0.5" style={{ color: "#3a3830" }}>Clica em &ldquo;Adicionar&rdquo; para começar</p>
          </div>
        )}

        {items.map((item, idx) => {
          const linkedDish = item.dish_id ? dishes.find((d) => d.id === item.dish_id) : null;
          return (
            <div
              key={idx}
              className="rounded-xl p-3.5 space-y-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${tab.color}40` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tab.color, opacity: 0.7 }}>
                    #{idx + 1}
                  </span>
                  {linkedDish && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "rgba(126,184,164,0.1)", color: "#7eb8a4" }}>
                      <Link2 className="w-2.5 h-2.5" />
                      Do menu
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:text-[#e67e4b]"
                  style={{ color: "#3a3830" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input value={item.name} onChange={(e) => update(idx, "name", e.target.value)}
                placeholder="Nome (ex: Esporão Reserva Branco)" className={inputCls} style={inputStyle} />
              <input value={item.description} onChange={(e) => update(idx, "description", e.target.value)}
                placeholder="Detalhe (ex: Alentejo, 2022)" className={inputCls} style={inputStyle} />
              <input value={item.why} onChange={(e) => update(idx, "why", e.target.value)}
                placeholder="Porquê? (ex: A acidez fresca potencia os sabores...)" className={inputCls} style={inputStyle} />
            </div>
          );
        })}
      </div>

      {/* Add button + picker */}
      <div className="relative mt-3 overflow-visible" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: `${tab.color}14`, color: tab.color, border: `1px dashed ${tab.color}40` }}
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar {tab.label.slice(0, -1)}
        </button>

        {showPicker && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => { setShowPicker(false); setSearch(""); }} />

            {/* Picker panel — opens downward */}
            <div
              className="absolute top-full mt-2 left-0 right-0 z-20 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#1e1d1a", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Header */}
              <div className="px-4 pt-3 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: tab.color }}>
                  Selecionar do menu
                </p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#626250" }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Pesquisar ${tab.label.toLowerCase()}…`}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#e8e8e0" }}
                  />
                </div>
              </div>

              {/* Dish list */}
              <div className="max-h-52 overflow-y-auto">
                {pickerDishes.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-xs" style={{ color: "#484640" }}>
                      {dishes.length === 0 ? "Sem pratos no menu ainda" : "Nenhum resultado"}
                    </p>
                  </div>
                ) : (
                  pickerDishes.map((dish) => {
                    const catName = categories.find((c) => c.id === dish.category_id)?.name ?? "";
                    const alreadyAdded = items.some((i) => i.dish_id === dish.id);
                    return (
                      <button
                        key={dish.id}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => addFromDish(dish)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
                          {dish.image_url ? (
                            <Image src={dish.image_url} alt="" fill className="object-cover" sizes="36px" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-base">🍽️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#e8e8e0" }}>{dish.name}</p>
                          <p className="text-xs truncate" style={{ color: "#626250" }}>{catName} · {dish.price.toFixed(2)} €</p>
                        </div>
                        {alreadyAdded && (
                          <span className="text-[10px] flex-shrink-0" style={{ color: "#484640" }}>adicionado</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Manual entry */}
              <div className="p-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button
                  type="button"
                  onClick={addManual}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ color: "#626250" }}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Entrada manual (fora do menu)
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {totalItems > 0 && (
        <p className="text-[11px] mt-3 text-center" style={{ color: "#3a3830" }}>
          {totalItems} sugestão{totalItems !== 1 ? "s" : ""} configurada{totalItems !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
