"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ExternalLink, Eye, EyeOff, Trash2,
  UtensilsCrossed, Layers, User, Calendar, Phone, MapPin,
  Star, AlertCircle, Globe, Palette,
} from "lucide-react";
import type { RestaurantDetail } from "@/actions/superadmin";
import { setRestaurantActiveAction, deleteRestaurantAdminAction } from "@/actions/superadmin";
import { showToast } from "@/lib/toast";

type Props = { restaurant: RestaurantDetail };

export function RestaurantDetailClient({ restaurant: r }: Props) {
  const [isActive, setIsActive] = useState(r.is_active);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const accent = r.primary_color ?? "#e6a81e";

  const handleToggleActive = () => {
    startTransition(async () => {
      try {
        await setRestaurantActiveAction(r.id, !isActive);
        setIsActive((v) => !v);
        showToast(isActive ? `"${r.name}" suspenso` : `"${r.name}" reactivado`, isActive ? "info" : "success");
      } catch {
        showToast("Erro ao alterar estado", "error");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteRestaurantAdminAction(r.id);
        showToast(`"${r.name}" eliminado permanentemente`, "info");
        router.push("/admin/restaurantes");
      } catch {
        showToast("Erro ao eliminar restaurante", "error");
        setDeleteStep(0);
      }
    });
  };

  const availableDishes = r.dishes.filter((d) => d.is_available).length;
  const featuredDishes = r.dishes.filter((d) => d.is_featured).length;

  return (
    <div className="p-8 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/restaurantes"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#626250" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f5f0" }}>{r.name}</h1>
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={isActive
                ? { background: "rgba(126,184,164,0.12)", color: "#7eb8a4" }
                : { background: "rgba(230,126,75,0.12)", color: "#e67e4b" }}
            >
              {isActive ? "Activo" : "Suspenso"}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#484640" }}>/menu/{r.slug}</p>
        </div>
        <a
          href={`/menu/${r.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-110"
          style={{ background: "rgba(255,255,255,0.06)", color: "#d4d4c8" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver Menu
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left col ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Restaurant info */}
          <Section title="Informação">
            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Owner" value={r.owner_email} mono />
            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Slug" value={`/menu/${r.slug}`} mono />
            {r.cuisine_type && <InfoRow icon={<UtensilsCrossed className="w-3.5 h-3.5" />} label="Cozinha" value={r.cuisine_type} />}
            {r.address && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Morada" value={r.address} />}
            {r.phone && <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={r.phone} />}
            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Criado em" value={new Date(r.created_at).toLocaleString("pt-PT")} />
            {r.primary_color && (
              <div className="flex items-center gap-3 py-1.5">
                <Palette className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#626250" }} />
                <span className="text-xs w-20 flex-shrink-0" style={{ color: "#626250" }}>Cor acento</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border" style={{ background: r.primary_color, borderColor: "rgba(255,255,255,0.2)" }} />
                  <span className="text-xs font-mono" style={{ color: "#848470" }}>{r.primary_color}</span>
                </div>
              </div>
            )}
          </Section>

          {/* Dishes list */}
          <Section title={`Pratos (${r.dish_count})`}>
            {r.dishes.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "#484640" }}>Sem pratos</p>
            )}
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {r.dishes.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", opacity: d.is_available ? 1 : 0.5 }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm" style={{ color: "#e8e8e0" }}>{d.name}</span>
                    <span className="text-xs ml-2" style={{ color: "#484640" }}>{d.category_name}</span>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: accent }}>{d.price.toFixed(2)} €</span>
                  {d.is_featured && <Star className="w-3 h-3 flex-shrink-0" style={{ color: accent }} fill={accent} />}
                  {!d.is_available && <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: "#e67e4b" }} />}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Right col ── */}
        <div className="space-y-4">

          {/* Stats */}
          <Section title="Estatísticas">
            <StatRow label="Total de pratos" value={r.dish_count} color="#e6a81e" />
            <StatRow label="Disponíveis" value={availableDishes} color="#7eb8a4" />
            <StatRow label="Esgotados" value={r.dish_count - availableDishes} color="#e67e4b" />
            <StatRow label="Em destaque" value={featuredDishes} color="#9b8ed6" />
            <StatRow label="Categorias" value={r.category_count} color="#5ba3d9" />
          </Section>

          {/* Access control */}
          <Section title="Controlo de Acesso">
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#484640" }}>
              {isActive
                ? "O restaurante está activo. Os clientes podem aceder ao menu e o owner ao painel de gestão."
                : "Acesso suspenso. O menu está inacessível ao público e o owner não consegue entrar no admin."}
            </p>
            <button
              disabled={pending}
              onClick={handleToggleActive}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              style={isActive
                ? { background: "rgba(230,126,75,0.12)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }
                : { background: "rgba(126,184,164,0.12)", color: "#7eb8a4", border: "1px solid rgba(126,184,164,0.2)" }}
            >
              {isActive
                ? <><EyeOff className="w-4 h-4" /> Suspender acesso</>
                : <><Eye className="w-4 h-4" /> Reactivar acesso</>}
            </button>
          </Section>

          {/* Danger zone */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(230,126,75,0.04)", border: "1px solid rgba(230,126,75,0.12)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#e67e4b" }}>
              Zona de Perigo
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#6e4a3a" }}>
              Elimina permanentemente o restaurante, todos os pratos e categorias. Acção irreversível.
            </p>

            {deleteStep === 0 && (
              <button
                onClick={() => setDeleteStep(1)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(230,126,75,0.08)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.15)" }}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar restaurante
              </button>
            )}

            {deleteStep === 1 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-center" style={{ color: "#e67e4b" }}>
                  Tens a certeza? ({r.dish_count} pratos serão eliminados)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(230,126,75,0.15)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.25)" }}
                  >
                    Sim, eliminar
                  </button>
                  <button
                    onClick={() => setDeleteStep(0)}
                    className="px-4 py-2 rounded-xl text-xs transition-colors"
                    style={{ color: "#626250" }}
                  >
                    Não
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-center" style={{ color: "#e67e4b" }}>
                  Última confirmação — sem possibilidade de recuperação
                </p>
                <button
                  disabled={pending}
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: "#e67e4b", color: "white" }}
                >
                  <Trash2 className="w-4 h-4" />
                  {pending ? "A eliminar..." : "Eliminar DEFINITIVAMENTE"}
                </button>
                <button onClick={() => setDeleteStep(0)} className="w-full text-xs py-1 text-center" style={{ color: "#484640" }}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#484640" }}>{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <span className="mt-0.5 flex-shrink-0" style={{ color: "#626250" }}>{icon}</span>
      <span className="text-xs w-20 flex-shrink-0 pt-0.5" style={{ color: "#626250" }}>{label}</span>
      <span className={`text-xs break-all ${mono ? "font-mono" : ""}`} style={{ color: "#e8e8e0" }}>{value}</span>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <span className="text-xs" style={{ color: "#626250" }}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
