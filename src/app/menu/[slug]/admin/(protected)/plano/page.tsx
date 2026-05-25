import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function PlanoPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/menu/${slug}/admin/login`);

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = superAdmins.includes((user.email ?? "").toLowerCase());

  const db = createSupabaseServiceClient();
  let query = db
    .from("restaurants")
    .select("id, plan, trial_ends_at, stripe_customer_id")
    .eq("slug", slug);

  if (!isSuperAdmin) query = query.eq("owner_id", user.id);

  const { data: restaurant } = await query.single();

  if (!restaurant) redirect(`/menu/${slug}/admin`);

  const trialEndsAt = restaurant.trial_ends_at ? new Date(restaurant.trial_ends_at) : null;
  const trialDaysLeft = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / 864e5)
    : null;

  return (
    <BillingClient
      restaurantId={restaurant.id}
      slug={slug}
      plan={restaurant.plan as "starter" | "pro" | "custom"}
      trialDaysLeft={trialDaysLeft}
      hasSubscription={!!restaurant.stripe_customer_id}
    />
  );
}
