"use server";

import { createSupabaseServiceClient } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import type { Plan } from "@/types";

function db() {
  return createSupabaseServiceClient();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const safe = slugify(slug);
  if (!safe) return false;
  const { data } = await db()
    .from("restaurants")
    .select("id")
    .eq("slug", safe)
    .single();
  return !data;
}

export async function createRestaurantAction(input: {
  name: string;
  slug: string;
  cuisine_type?: string;
  plan: Plan;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signup");

  const slug = slugify(input.slug);
  if (!slug) throw new Error("Slug inválido");
  if (!input.name.trim()) throw new Error("Nome obrigatório");

  // Check slug not taken
  const { data: existing } = await db()
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .single();
  if (existing) throw new Error("Este URL já está em uso. Escolhe outro.");

  // Check user doesn't already have a restaurant (enforce plan limits later)
  const { data: owned } = await db()
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id);

  const count = owned?.length ?? 0;
  if (count >= 1) throw new Error("Durante o trial só é permitido 1 restaurante.");

  const trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

  // Always start on the trial (starter). Paid plans are only granted by the
  // Stripe webhook after a successful payment — never self-assigned at onboarding.
  const { data, error } = await db()
    .from("restaurants")
    .insert({
      name: input.name.trim(),
      slug,
      cuisine_type: input.cuisine_type?.trim() || null,
      owner_id: user.id,
      is_active: true,
      plan: "starter",
      trial_ends_at: trialEndsAt,
    })
    .select("slug")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Erro ao criar restaurante");

  redirect(`/menu/${data.slug}/admin`);
}
