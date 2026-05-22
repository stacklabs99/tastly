import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { PendingApproval } from "@/components/onboarding/PendingApproval";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signup");

  const service = createSupabaseServiceClient();

  // Super admins skip the approval check (they manage the platform, not restaurants)
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = superAdmins.includes((user.email ?? "").toLowerCase());

  if (!isSuperAdmin) {
    const { data: profile } = await service
      .from("profiles")
      .select("approved")
      .eq("id", user.id)
      .single();

    if (!profile?.approved) {
      return <PendingApproval />;
    }
  }

  // If user already has a restaurant, go straight to their admin
  const { data: restaurants } = await service
    .from("restaurants")
    .select("slug")
    .eq("owner_id", user.id)
    .limit(1);

  if (restaurants && restaurants.length > 0) {
    redirect(`/menu/${restaurants[0].slug}/admin`);
  }

  return <>{children}</>;
}
