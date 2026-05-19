"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, Layers, Eye, Star, AlertCircle, Plus, TrendingUp, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { dishes, categories, loading } = useAdmin();
  const { slug } = useParams<{ slug: string }>();
  const base = `/menu/${slug}/admin`;

  const available = dishes.filter((d) => d.is_available).length;
  const unavailable = dishes.filter((d) => !d.is_available).length;
  const featured = dishes.filter((d) => d.is_featured).length;
  const totalValue = dishes.reduce((sum, d) => sum + d.price, 0);
  const avgPrice = dishes.length ? totalValue / dishes.length : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  const stats = [
    {
      label: "Total de Pratos",
      value: dishes.length,
      icon: UtensilsCrossed,
      color: "#e6a81e",
      bg: "rgba(230,168,30,0.1)",
      sub: `${categories.length} categorias`,
    },
    {
      label: "Disponíveis",
      value: available,
      icon: Eye,
      color: "#7eb8a4",
      bg: "rgba(126,184,164,0.1)",
      sub: dishes.length ? `${Math.round((available / dishes.length) * 100)}% do menu` : "—",
    },
    {
      label: "Esgotados",
      value: unavailable,
      icon: AlertCircle,
      color: "#e67e4b",
      bg: "rgba(230,126,75,0.1)",
      sub: unavailable === 0 ? "Tudo disponível ✓" : "Precisa atenção",
    },
    {
      label: "Em Destaque",
      value: featured,
      icon: Star,
      color: "#e6a81e",
      bg: "rgba(230,168,30,0.08)",
      sub: "No carrossel",
    },
    {
      label: "Preço Médio",
      value: `${avgPrice.toFixed(2)} €`,
      icon: TrendingUp,
      color: "#9b8ed6",
      bg: "rgba(155,142,214,0.1)",
      sub: `Max: ${Math.max(...dishes.map((d) => d.price), 0).toFixed(2)} €`,
    },
  ];

  const recentDishes = [...dishes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl">
        <div className="mb-8">
          <div className="h-4 w-24 skeleton rounded-full mb-2" />
          <div className="h-8 w-44 skeleton rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl h-28 skeleton" />
          ))}
        </div>
        <div className="rounded-2xl h-14 skeleton mb-8" />
        <div className="flex gap-3 mb-8">
          <div className="rounded-xl h-10 w-32 skeleton" />
          <div className="rounded-xl h-10 w-40 skeleton" />
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl h-14 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#626250] text-sm mb-1">{greeting} 👋</p>
        <h1 className="font-serif text-3xl font-bold text-[#f5f5f0]">Dashboard</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
              <p className="text-[11px] font-medium text-[#e8e8e0] mt-1">{label}</p>
              <p className="text-[10px] text-[#484640] mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Availability bar */}
      {dishes.length > 0 && (
        <div className="rounded-2xl p-4 mb-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Disponibilidade do Menu</span>
            <span className="text-xs text-[#626250]">{available}/{dishes.length} pratos disponíveis</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(available / dishes.length) * 100}%`,
                background: available === dishes.length ? "#7eb8a4" : available > dishes.length * 0.7 ? "#e6a81e" : "#e67e4b",
              }}
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`${base}/pratos/novo`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1a1916] bg-[#e6a81e] active:scale-95 transition-transform hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          Novo Prato
        </Link>
        <Link
          href={`${base}/categorias`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:border-white/20"
          style={{ background: "rgba(255,255,255,0.04)", color: "#d4d4c8", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Layers className="w-4 h-4" />
          Gerir Categorias
        </Link>
      </div>

      {/* Recent dishes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#626250]">Pratos Recentes</h2>
          <Link href={`${base}/pratos`} className="flex items-center gap-1 text-xs text-[#e6a81e] hover:underline">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-1.5">
          {recentDishes.map((dish) => {
            const cat = categories.find((c) => c.id === dish.category_id);
            return (
              <Link
                key={dish.id}
                href={`${base}/pratos/${dish.id}`}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group hover:border-white/10"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                {dish.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dish.image_url} alt={dish.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "#2a2926" }}>🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[#e8e8e0] text-sm font-medium truncate group-hover:text-white transition-colors">{dish.name}</p>
                  <p className="text-[#484640] text-xs">{cat?.name ?? "—"}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[#e6a81e] text-sm font-bold">{dish.price.toFixed(2)} €</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium hidden sm:inline"
                    style={dish.is_available
                      ? { background: "rgba(126,184,164,0.12)", color: "#7eb8a4" }
                      : { background: "rgba(230,126,75,0.12)", color: "#e67e4b" }}
                  >
                    {dish.is_available ? "Disponível" : "Esgotado"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
