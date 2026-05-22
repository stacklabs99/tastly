import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signup");

  // If user already has a restaurant, send them to their admin
  const service = createSupabaseServiceClient();
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
