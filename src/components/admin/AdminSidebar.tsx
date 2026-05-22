"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Store,
  QrCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";

type Props = { slug: string; userEmail: string };

export function AdminSidebar({ slug, userEmail }: Props) {
  const { restaurant, loading } = useAdmin();
  const restaurantName = restaurant.name;
  const path = usePathname();
  const base = `/menu/${slug}/admin`;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV = [
    { href: base, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `${base}/pratos`, label: "Pratos", icon: UtensilsCrossed },
    { href: `${base}/categorias`, label: "Categorias", icon: Layers },
    { href: `${base}/restaurante`, label: "Restaurante", icon: Store },
    { href: `${base}/qrcode`, label: "QR Code", icon: QrCode },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className="flex flex-col h-full flex-shrink-0 border-r transition-all duration-300"
      style={{
        background: "#0f0f0d",
        borderColor: "rgba(255,255,255,0.06)",
        width: mobile ? 240 : collapsed ? 64 : 232,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center border-b flex-shrink-0"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          padding: collapsed && !mobile ? "16px 0" : "16px 20px",
          justifyContent: collapsed && !mobile ? "center" : "space-between",
          minHeight: 64,
        }}
      >
        {(!collapsed || mobile) ? (
          <>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(230,168,30,0.12)", color: "#e6a81e" }}
                >
                  Admin
                </span>
              </div>
              {loading ? (
                <div className="h-3 w-28 skeleton rounded-full mt-0.5" />
              ) : (
                <p className="text-[11px] text-[#484640] mt-0.5 truncate max-w-[140px]">{restaurantName}</p>
              )}
            </div>
            {!mobile && (
              <button
                onClick={() => setCollapsed(true)}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                style={{ color: "#484640" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {mobile && (
              <button
                onClick={() => setMobileOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                style={{ color: "#626250" }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
            style={{ color: "#e6a81e" }}
            title="Expandir menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5" style={{ padding: collapsed && !mobile ? "12px 8px" : "12px" }}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? label : undefined}
              className="flex items-center rounded-xl text-sm font-medium transition-all duration-150 relative"
              style={{
                gap: collapsed && !mobile ? 0 : 10,
                padding: collapsed && !mobile ? "10px 0" : "9px 12px",
                justifyContent: collapsed && !mobile ? "center" : "flex-start",
                ...(isActive
                  ? { background: "rgba(230,168,30,0.12)", color: "#e6a81e" }
                  : { color: "#626250" }),
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "#e6a81e" }}
                />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || mobile) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="border-t flex-shrink-0 space-y-0.5"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          padding: collapsed && !mobile ? "12px 8px" : "12px",
        }}
      >
        <Link
          href={`/menu/${slug}`}
          target="_blank"
          title={collapsed && !mobile ? "Ver Menu" : undefined}
          className="flex items-center rounded-xl text-sm transition-all duration-150 group"
          style={{
            gap: collapsed && !mobile ? 0 : 10,
            padding: collapsed && !mobile ? "10px 0" : "9px 12px",
            justifyContent: collapsed && !mobile ? "center" : "flex-start",
            color: "#484640",
          }}
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:text-[#e6a81e] transition-colors" />
          {(!collapsed || mobile) && (
            <span className="group-hover:text-[#e8e8e0] transition-colors">Ver Menu</span>
          )}
        </Link>

        {/* User + sign out */}
        {(!collapsed || mobile) ? (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 mt-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: "rgba(230,168,30,0.15)", color: "#e6a81e" }}>
              {userEmail[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-[11px] text-[#484640] truncate flex-1 min-w-0">{userEmail}</span>
            <form action={signOutAction.bind(null, slug)}>
              <button
                type="submit"
                title="Sair"
                className="w-5 h-5 flex items-center justify-center rounded-md transition-colors hover:text-[#e67e4b]"
                style={{ color: "#3a3830" }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <form action={signOutAction.bind(null, slug)}>
            <button
              type="submit"
              title="Sair"
              className="w-full flex items-center justify-center rounded-xl transition-all hover:bg-white/5"
              style={{ padding: "10px 0", color: "#3a3830" }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ minHeight: "100dvh" }}>
        <div className="sticky top-0" style={{ minHeight: "100dvh" }}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: "#0f0f0d", border: "1px solid rgba(255,255,255,0.08)", color: "#e8e8e0" }}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            <SidebarContent mobile />
          </div>
          <div
            className="flex-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
