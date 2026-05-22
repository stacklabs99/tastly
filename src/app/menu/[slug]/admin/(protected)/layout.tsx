import { redirect, notFound } from "next/navigation";
import { AdminProvider } from "@/contexts/AdminContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { Toaster } from "@/components/ui/Toaster";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getRestaurantBySlug } from "@/lib/db";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ProtectedAdminLayout({ children, params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/menu/${slug}/admin/login`);

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();
  if (!restaurant.is_active) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: "#0f0f0d" }}>
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-serif text-xl font-bold mb-2" style={{ color: "#f5f5f0" }}>Acesso Suspenso</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#626250" }}>
            Este restaurante foi temporariamente suspenso pela plataforma Tastly. Contacta o suporte para mais informações.
          </p>
        </div>
      </div>
    );
  }
  if (restaurant.owner_id !== user.id) redirect(`/menu/${slug}/admin/login`);

  return (
    <AdminProvider slug={slug}>
      <div className="flex min-h-dvh" style={{ background: "#141412" }}>
        <AdminSidebar slug={slug} userEmail={user.email ?? ""} />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="md:hidden h-14" />
          <AdminErrorBanner />
          {children}
        </main>
      </div>
      <Toaster />
    </AdminProvider>
  );
}
