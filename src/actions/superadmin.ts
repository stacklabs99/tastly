"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendAccountApprovedEmail } from "@/lib/email";

function db() {
  return createSupabaseServiceClient();
}

// Verifies the caller is an allowed super admin. Throws otherwise.
async function assertSuperAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Não autenticado");

  const allowed = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(user.email.toLowerCase())) {
    throw new Error("Acesso negado");
  }
}

export type RestaurantRow = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  cover_url?: string;
  cuisine_type?: string;
  primary_color?: string;
  is_active: boolean;
  owner_id: string;
  owner_email: string;
  created_at: string;
  dish_count: number;
  category_count: number;
};

export type DishRow = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  is_featured: boolean;
  category_name: string;
};

export type RestaurantDetail = RestaurantRow & {
  dishes: DishRow[];
  address?: string;
  phone?: string;
  review_url?: string;
};

// ── List all restaurants with stats ──────────────────────────────────────────

export async function listAllRestaurants(): Promise<RestaurantRow[]> {
  await assertSuperAdmin();
  const supabase = db();

  const [{ data: restaurants }, { data: dishes }, { data: categories }, { data: usersData }] =
    await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("dishes").select("restaurant_id"),
      supabase.from("categories").select("restaurant_id"),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  const emailMap = new Map(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? "—"])
  );

  const dishCounts = new Map<string, number>();
  (dishes ?? []).forEach((d) => {
    dishCounts.set(d.restaurant_id, (dishCounts.get(d.restaurant_id) ?? 0) + 1);
  });

  const catCounts = new Map<string, number>();
  (categories ?? []).forEach((c) => {
    catCounts.set(c.restaurant_id, (catCounts.get(c.restaurant_id) ?? 0) + 1);
  });

  return (restaurants ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? undefined,
    cover_url: r.cover_url ?? undefined,
    cuisine_type: r.cuisine_type ?? undefined,
    primary_color: r.primary_color ?? undefined,
    is_active: r.is_active,
    owner_id: r.owner_id,
    owner_email: emailMap.get(r.owner_id) ?? "—",
    created_at: r.created_at,
    dish_count: dishCounts.get(r.id) ?? 0,
    category_count: catCounts.get(r.id) ?? 0,
  }));
}

// ── Restaurant detail ─────────────────────────────────────────────────────────

export async function getRestaurantDetailAdmin(id: string): Promise<RestaurantDetail | null> {
  await assertSuperAdmin();
  const supabase = db();

  const [{ data: r }, { data: rawDishes }, { data: cats }, { data: usersData }] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).single(),
      supabase.from("dishes").select("*").eq("restaurant_id", id).order("position"),
      supabase.from("categories").select("*").eq("restaurant_id", id),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  if (!r) return null;

  const emailMap = new Map(
    (usersData?.users ?? []).map((u) => [u.id, u.email ?? "—"])
  );

  const catNameMap = new Map((cats ?? []).map((c) => [c.id, c.name as string]));

  const dishes: DishRow[] = (rawDishes ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    price: Number(d.price),
    is_available: d.is_available,
    is_featured: d.is_featured,
    category_name: catNameMap.get(d.category_id) ?? "—",
  }));

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? undefined,
    cover_url: r.cover_url ?? undefined,
    cuisine_type: r.cuisine_type ?? undefined,
    primary_color: r.primary_color ?? undefined,
    address: r.address ?? undefined,
    phone: r.phone ?? undefined,
    review_url: r.review_url ?? undefined,
    is_active: r.is_active,
    owner_id: r.owner_id,
    owner_email: emailMap.get(r.owner_id) ?? "—",
    created_at: r.created_at,
    dish_count: dishes.length,
    category_count: cats?.length ?? 0,
    dishes,
  };
}

// ── Toggle active ─────────────────────────────────────────────────────────────

export async function setRestaurantActiveAction(id: string, isActive: boolean) {
  await assertSuperAdmin();
  const { error } = await db()
    .from("restaurants")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/restaurantes");
  revalidatePath(`/admin/restaurantes/${id}`);
}

// ── Delete restaurant ─────────────────────────────────────────────────────────

export async function deleteRestaurantAdminAction(id: string) {
  await assertSuperAdmin();
  const supabase = db();

  // Collect all Supabase storage URLs before deleting rows
  const [{ data: dishes }, { data: restaurant }] = await Promise.all([
    supabase.from("dishes").select("image_url").eq("restaurant_id", id),
    supabase.from("restaurants").select("cover_url, logo_url").eq("id", id).single(),
  ]);

  // Extract storage paths (only files hosted in our dish-images bucket)
  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dish-images/`;
  const storagePaths: string[] = [];

  (dishes ?? []).forEach(({ image_url }) => {
    if (image_url?.startsWith(storageBase)) {
      storagePaths.push(image_url.replace(storageBase, ""));
    }
  });
  [restaurant?.cover_url, restaurant?.logo_url].forEach((url) => {
    if (url?.startsWith(storageBase)) {
      storagePaths.push(url.replace(storageBase, ""));
    }
  });

  // Delete storage files (best-effort — don't block on failure)
  if (storagePaths.length > 0) {
    await supabase.storage.from("dish-images").remove(storagePaths).catch(() => null);
  }

  // Cascade: delete dishes → categories → restaurant
  await supabase.from("dishes").delete().eq("restaurant_id", id);
  await supabase.from("categories").delete().eq("restaurant_id", id);
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/restaurantes");
}

// ── User approvals ───────────────────────────────────────────────────────────

export type PendingUser = {
  id: string;
  email: string;
  created_at: string;
};

export async function listPendingUsers(): Promise<PendingUser[]> {
  await assertSuperAdmin();
  const supabase = db();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .eq("approved", false)
    .order("created_at", { ascending: true });
  return (data ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    created_at: p.created_at,
  }));
}

export async function approveUserAction(userId: string) {
  await assertSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: { user: admin } } = await supabase.auth.getUser();

  // Fetch the profile to get the user's email before updating
  const { data: profile } = await db()
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .eq("approved", false)
    .single();

  if (!profile) throw new Error("Utilizador não encontrado ou já aprovado.");

  const { error } = await db()
    .from("profiles")
    .update({ approved: true, approved_at: new Date().toISOString(), approved_by: admin?.email ?? "" })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // Notify the user their account is approved
  await sendAccountApprovedEmail(profile.email);

  revalidatePath("/admin/utilizadores");
}

export async function rejectUserAction(userId: string) {
  await assertSuperAdmin();

  // Confirmar que o utilizador é realmente pending antes de eliminar
  const { data: profile } = await db()
    .from("profiles")
    .select("id, approved")
    .eq("id", userId)
    .eq("approved", false)
    .single();

  if (!profile) throw new Error("Utilizador não encontrado ou já aprovado.");

  const { error } = await db().auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/utilizadores");
}

// ── Platform stats ────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  await assertSuperAdmin();
  const supabase = db();
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalRests },
    { count: activeRests },
    { count: totalDishes },
    { count: newThisMonth },
    { data: usersData },
  ] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("restaurants").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("dishes").select("*", { count: "exact", head: true }),
    supabase.from("restaurants").select("*", { count: "exact", head: true }).gte("created_at", firstOfMonth),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  return {
    totalRestaurants: totalRests ?? 0,
    activeRestaurants: activeRests ?? 0,
    inactiveRestaurants: (totalRests ?? 0) - (activeRests ?? 0),
    totalDishes: totalDishes ?? 0,
    newThisMonth: newThisMonth ?? 0,
    totalUsers: usersData?.users.length ?? 0,
  };
}
