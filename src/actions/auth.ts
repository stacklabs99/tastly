"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function signOutAction(slug: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/menu/${slug}/admin/login`);
}
