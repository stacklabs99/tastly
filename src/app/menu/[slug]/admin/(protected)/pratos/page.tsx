"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/contexts/AdminContext";
import { useParams } from "next/navigation";
import { Plus, Search, Pencil, Eye, EyeOff, Star, Sparkles, Sun } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

export default function PratosPage() {
  const { dishes, categories, updateDish } = useAdmin();
  const { slug } = useParams<{ slug: string }>();
  const base = `/menu/${slug}/admin`;

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = dishes.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || d.category_id === filterCat;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "available" && d.is_available) ||
      (filterStatus === "unavailable" && !d.is_available) ||
      (filterStatus === "featured" && d.is_featured);
    return matchSearch && matchCat && matchStatus;
  });

  const grouped = categories
    .filter((c) => filterCat === "all" || c.id === filterCat)
    .map((cat) => ({ cat, items: filtered.filter((d) => d.category_id === cat.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="p-8">
      <PageHeader
        title="Pratos"
        subtitle={`${dishes.length} pratos · ${categories.length} categorias`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`${base}/importar`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:brightness-110"
              style={{ background: "rgba(230,168,30,0.1)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.25)" }}
            >
              <Sparkles className="w-4 h-4" />
              Importar (IA)
            </Link>
            <Link
              href={`${base}/pratos/novo`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1a1916] bg-[#e6a81e] active:scale-95 transition-all hover:brightness-110"
            >
              <Plus className="w-4 h-4" />
              Novo Prato
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div
          className="flex items-center gap-2 rounded-xl px-3 flex-1 min-w-[180px] max-w-xs"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search className="w-3.5 h-3.5 text-[#484640] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar pratos..."
            className="flex-1 bg-transparent py-2.5 text-sm text-[#e8e8e0] outline-none placeholder:text-[#484640]"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm text-[#e8e8e0] outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <option value="all" style={{ background: "#1a1916" }}>Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} style={{ background: "#1a1916" }}>{c.name}</option>
          ))}
        </select>

        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["all", "available", "unavailable", "featured"] as const).map((s) => {
            const labels = { all: "Todos", available: "Disponível", unavailable: "Esgotado", featured: "Destaque" };
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-2.5 text-xs font-medium transition-all"
                style={active
                  ? { background: "rgba(230,168,30,0.15)", color: "#e6a81e" }
                  : { background: "rgba(255,255,255,0.03)", color: "#626250" }}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-10">
        {grouped.map(({ cat, items }) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">{cat.name}</h2>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
              <span className="text-xs text-[#484640]">{items.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((dish) => (
                <div
                  key={dish.id}
                  className="rounded-2xl overflow-hidden group transition-all duration-200 hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {/* Image */}
                  <div className="relative" style={{ aspectRatio: "16/9" }}>
                    {dish.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: "#2a2926" }}>🍽️</div>
                    )}
                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {!dish.is_available && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(230,126,75,0.9)", color: "#fff" }}>
                          Esgotado
                        </span>
                      )}
                      {dish.is_featured && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(230,168,30,0.9)", color: "#1a1916" }}>
                          <Star className="w-2.5 h-2.5 fill-current" /> Destaque
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[#e8e8e0] text-sm font-semibold leading-tight">{dish.name}</p>
                      <span className="text-[#e6a81e] text-sm font-bold flex-shrink-0">{dish.price.toFixed(2)} €</span>
                    </div>
                    {dish.description && (
                      <p className="text-[#484640] text-xs line-clamp-2 mb-2">{dish.description}</p>
                    )}
                    {dish.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2">
                        {dish.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-medium text-[#7a7a62]" style={{ background: "rgba(255,255,255,0.05)" }}>{t}</span>
                        ))}
                        {dish.tags.length > 3 && (
                          <span className="text-[9px] text-[#484640]">+{dish.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex gap-1">
                        <button
                          title={dish.is_featured ? "Remover destaque" : "Destacar"}
                          onClick={() => updateDish(dish.id, { is_featured: !dish.is_featured })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={dish.is_featured
                            ? { background: "rgba(230,168,30,0.15)", color: "#e6a81e" }
                            : { background: "rgba(255,255,255,0.04)", color: "#484640" }}
                        >
                          <Star className="w-3.5 h-3.5" fill={dish.is_featured ? "#e6a81e" : "none"} />
                        </button>
                        <button
                          title={dish.is_special ? "Remover dos pratos do dia" : "Marcar prato do dia"}
                          onClick={() => updateDish(dish.id, { is_special: !dish.is_special })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={dish.is_special
                            ? { background: "rgba(126,184,164,0.15)", color: "#7eb8a4" }
                            : { background: "rgba(255,255,255,0.04)", color: "#484640" }}
                        >
                          <Sun className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title={dish.is_available ? "Marcar esgotado" : "Marcar disponível"}
                          onClick={() => updateDish(dish.id, { is_available: !dish.is_available })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={dish.is_available
                            ? { background: "rgba(126,184,164,0.12)", color: "#7eb8a4" }
                            : { background: "rgba(230,126,75,0.12)", color: "#e67e4b" }}
                        >
                          {dish.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <Link
                        href={`${base}/pratos/${dish.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-125"
                        style={{ background: "rgba(255,255,255,0.06)", color: "#d4d4c8" }}
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🍽️</div>
            <p className="text-[#484640] mb-3">Nenhum prato encontrado</p>
            <Link href={`${base}/pratos/novo`} className="text-sm text-[#e6a81e] hover:underline">
              + Criar o primeiro prato
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
