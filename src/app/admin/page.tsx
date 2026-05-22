import { getPlatformStats } from "@/actions/superadmin";
import { Store, UtensilsCrossed, CheckCircle, XCircle, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const stats = await getPlatformStats();

  const cards = [
    {
      label: "Restaurantes",
      value: stats.totalRestaurants,
      icon: Store,
      color: "#e6a81e",
      bg: "rgba(230,168,30,0.1)",
      sub: `${stats.newThisMonth} novos este mês`,
    },
    {
      label: "Activos",
      value: stats.activeRestaurants,
      icon: CheckCircle,
      color: "#7eb8a4",
      bg: "rgba(126,184,164,0.1)",
      sub: stats.totalRestaurants
        ? `${Math.round((stats.activeRestaurants / stats.totalRestaurants) * 100)}% do total`
        : "—",
    },
    {
      label: "Suspensos",
      value: stats.inactiveRestaurants,
      icon: XCircle,
      color: stats.inactiveRestaurants > 0 ? "#e67e4b" : "#484640",
      bg: stats.inactiveRestaurants > 0 ? "rgba(230,126,75,0.1)" : "rgba(255,255,255,0.04)",
      sub: stats.inactiveRestaurants === 0 ? "Tudo em ordem ✓" : "Ação necessária",
    },
    {
      label: "Total de Pratos",
      value: stats.totalDishes,
      icon: UtensilsCrossed,
      color: "#9b8ed6",
      bg: "rgba(155,142,214,0.1)",
      sub: stats.totalRestaurants
        ? `${Math.round(stats.totalDishes / Math.max(stats.totalRestaurants, 1))} em média`
        : "—",
    },
    {
      label: "Utilizadores",
      value: stats.totalUsers,
      icon: Users,
      color: "#5ba3d9",
      bg: "rgba(91,163,217,0.1)",
      sub: "Contas registadas",
    },
    {
      label: "Novos (mês)",
      value: stats.newThisMonth,
      icon: TrendingUp,
      color: "#e6a81e",
      bg: "rgba(230,168,30,0.08)",
      sub: "Restaurantes criados",
    },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm mb-1" style={{ color: "#626250" }}>Plataforma</p>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div
            key={label}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
              <p className="text-[11px] font-medium mt-1" style={{ color: "#e8e8e0" }}>{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#484640" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#484640" }}>
          Ações Rápidas
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/restaurantes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
            style={{ background: "#e6a81e", color: "#1a1916" }}
          >
            <Store className="w-4 h-4" />
            Gerir Restaurantes
          </Link>
        </div>
      </div>
    </div>
  );
}
