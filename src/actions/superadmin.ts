"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase";

function db() {
  return createSupabaseServiceClient();
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
  const supabase = db();
  // Cascade: dishes and categories have restaurant_id FK — delete them first
  await supabase.from("dishes").delete().eq("restaurant_id", id);
  await supabase.from("categories").delete().eq("restaurant_id", id);
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/restaurantes");
}

// ── Platform stats ────────────────────────────────────────────────────────────

export async function getPlatformStats() {
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
