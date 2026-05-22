import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Toaster } from "@/components/ui/Toaster";
import { LayoutDashboard, Store, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { signOutPlatformAction } from "@/actions/auth";

type Props = { children: React.ReactNode };

export const metadata = { title: "Tastly Platform — Super Admin" };

export default async function SuperAdminLayout({ children }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allowedEmails.includes((user.email ?? "").toLowerCase())) {
    redirect("/");
  }

  return (
    <div className="flex min-h-dvh" style={{ background: "#0d0d0b" }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0 border-r sticky top-0 h-dvh"
        style={{ background: "#0a0a08", borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-serif text-lg font-bold" style={{ color: "#e6a81e" }}>Tastly</span>
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: "rgba(155,142,214,0.15)", color: "#9b8ed6" }}
            >
              Platform
            </span>
          </div>
          <p className="text-[10px]" style={{ color: "#484640" }}>{user.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink href="/admin" icon={<LayoutDashboard className="w-4 h-4" />} exact>
            Dashboard
          </NavLink>
          <NavLink href="/admin/restaurantes" icon={<Store className="w-4 h-4" />}>
            Restaurantes
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1"
            style={{ background: "rgba(155,142,214,0.08)", border: "1px solid rgba(155,142,214,0.12)" }}
          >
            <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9b8ed6" }} />
            <span className="text-[11px] font-semibold" style={{ color: "#9b8ed6" }}>Super Admin</span>
          </div>
          <form action={signOutPlatformAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ color: "#484640" }}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>

      <Toaster />
    </div>
  );
}

function NavLink({
  href,
  icon,
  exact,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-white/5"
      style={{ color: "#626250" }}
    >
      {icon}
      {children}
    </Link>
  );
}
