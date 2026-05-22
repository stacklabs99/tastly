"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink, Eye, EyeOff, ChevronRight, Search,
  UtensilsCrossed, Layers, User, Calendar
} from "lucide-react";
import type { RestaurantRow } from "@/actions/superadmin";
import { setRestaurantActiveAction } from "@/actions/superadmin";
import { showToast } from "@/lib/toast";

type Props = { restaurants: RestaurantRow[] };

export function RestaurantTableClient({ restaurants }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = restaurants.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.slug.includes(q) ||
      r.owner_email.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && r.is_active) ||
      (filterStatus === "suspended" && !r.is_active);
    return matchSearch && matchStatus;
  });

  const toggleActive = (r: RestaurantRow) => {
    startTransition(async () => {
      try {
        await setRestaurantActiveAction(r.id, !r.is_active);
        showToast(
          r.is_active ? `"${r.name}" suspenso` : `"${r.name}" reactivado`,
          r.is_active ? "info" : "success"
        );
        router.refresh();
      } catch {
        showToast("Erro ao alterar estado", "error");
      }
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div
          className="flex items-center gap-2 px-3 rounded-xl flex-1 min-w-[200px] max-w-xs"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search className="w-3.5 h-3.5 text-[#484640]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, slug ou email..."
            className="flex-1 bg-transparent py-2.5 text-sm text-[#e8e8e0] outline-none placeholder:text-[#484640]"
          />
        </div>

        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["all", "active", "suspended"] as const).map((s) => {
            const labels = { all: "Todos", active: "Activos", suspended: "Suspensos" };
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-4 py-2.5 text-xs font-medium transition-all"
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

      {/* Table */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "#484640" }}>
            <div className="text-3xl mb-3">🏪</div>
            <p className="text-sm">Nenhum restaurante encontrado</p>
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${r.is_active ? "rgba(255,255,255,0.07)" : "rgba(230,126,75,0.15)"}`,
              opacity: r.is_active ? 1 : 0.75,
            }}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Cover thumbnail */}
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden"
                style={{ background: r.primary_color ? `${r.primary_color}22` : "rgba(255,255,255,0.05)" }}
              >
                {r.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.cover_url} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "#f0efe9" }}>{r.name}</span>
                  {r.primary_color && (
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: r.primary_color }}
                      title={r.primary_color}
                    />
                  )}
                  {!r.is_active && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(230,126,75,0.12)", color: "#e67e4b" }}
                    >
                      Suspenso
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <span className="text-xs" style={{ color: "#626250" }}>
                    /menu/<span style={{ color: "#848470" }}>{r.slug}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#484640" }}>
                    <User className="w-3 h-3" />
                    {r.owner_email}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#484640" }}>
                    <UtensilsCrossed className="w-3 h-3" />
                    {r.dish_count} pratos
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#484640" }}>
                    <Layers className="w-3 h-3" />
                    {r.category_count} categ.
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#484640" }}>
                    <Calendar className="w-3 h-3" />
                    {new Date(r.created_at).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`/menu/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver menu"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: "#626250" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  title={r.is_active ? "Suspender acesso" : "Reactivar acesso"}
                  disabled={pending}
                  onClick={() => toggleActive(r)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-40"
                  style={r.is_active
                    ? { color: "#7eb8a4" }
                    : { color: "#e67e4b" }}
                >
                  {r.is_active
                    ? <Eye className="w-3.5 h-3.5" />
                    : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <Link
                  href={`/admin/restaurantes/${r.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#d4d4c8" }}
                >
                  Detalhes
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
