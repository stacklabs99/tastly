import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { AdminProvider } from "@/contexts/AdminContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { Toaster } from "@/components/ui/Toaster";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getRestaurantBySlug } from "@/lib/db";
import { sendTrialExpiringEmail } from "@/lib/email";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ProtectedAdminLayout({ children, params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/menu/${slug}/admin/login`);

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = superAdmins.includes((user.email ?? "").toLowerCase());

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (!restaurant.is_active && !isSuperAdmin) {
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
  if (!isSuperAdmin && restaurant.owner_id !== user.id) redirect(`/menu/${slug}`);

  // Trial enforcement and warning emails
  const isPaidPlan = restaurant.plan === "pro" || restaurant.plan === "custom";
  if (!isSuperAdmin && !isPaidPlan) {
    const trialEndsAt = restaurant.trial_ends_at ? new Date(restaurant.trial_ends_at) : null;
    const now = Date.now();
    const trialExpired = trialEndsAt ? trialEndsAt.getTime() < now : false;
    const isPlanoPage = pathname.endsWith("/plano");

    if (trialExpired && !isPlanoPage) {
      redirect(`/menu/${slug}/admin/plano`);
    }

    // Send warning email once when trial is within 3 days
    if (!trialExpired && trialEndsAt && user.email) {
      const daysLeft = Math.ceil((trialEndsAt.getTime() - now) / 864e5);
      const warningSent = restaurant.trial_warning_sent_at
        ? new Date(restaurant.trial_warning_sent_at)
        : null;
      const alreadySentThisWindow = warningSent
        ? warningSent.getTime() > trialEndsAt.getTime() - 4 * 864e5
        : false;

      if (daysLeft <= 3 && !alreadySentThisWindow) {
        // Fire-and-forget — don't block page render
        const db = createSupabaseServiceClient();
        db.from("restaurants")
          .update({ trial_warning_sent_at: new Date().toISOString() })
          .eq("id", restaurant.id)
          .then(() => sendTrialExpiringEmail(user.email!, slug, daysLeft));
      }
    }
  }

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
