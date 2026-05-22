"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Dish, Category, Restaurant, ManualPairings } from "@/types";

function db() {
  return createSupabaseServiceClient();
}

// Only allow https:// URLs — rejects javascript:, data:, http:, etc.
function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

// Verifies the authenticated user owns the restaurant with the given slug.
// Returns the restaurant's id. Throws if not authenticated or not owner.
async function assertOwner(slug: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data } = await db()
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .single();

  if (!data) throw new Error("Acesso negado");
  return data.id;
}

// ── Restaurant ────────────────────────────────────────────────────────────────

export async function fetchRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data } = await db().from("restaurants").select("*").eq("slug", slug).single();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description ?? undefined,
    logo_url: data.logo_url ?? undefined,
    cover_url: data.cover_url ?? undefined,
    address: data.address ?? undefined,
    phone: data.phone ?? undefined,
    cuisine_type: data.cuisine_type ?? undefined,
    primary_color: data.primary_color ?? undefined,
    review_url: data.review_url ?? undefined,
    owner_id: data.owner_id,
    is_active: data.is_active,
    plan: (data.plan ?? "starter") as import("@/types").Plan,
    trial_ends_at: data.trial_ends_at ?? new Date(Date.now() + 15 * 864e5).toISOString(),
    created_at: data.created_at,
  };
}

export async function updateRestaurantAction(id: string, updates: Partial<Restaurant>, slug: string) {
  const ownedId = await assertOwner(slug);
  if (ownedId !== id) throw new Error("Acesso negado");

  const { error } = await db().from("restaurants").update({
    name: updates.name,
    description: updates.description ?? null,
    logo_url: safeUrl(updates.logo_url),
    cover_url: safeUrl(updates.cover_url),
    address: updates.address ?? null,
    phone: updates.phone ?? null,
    cuisine_type: updates.cuisine_type ?? null,
    review_url: safeUrl(updates.review_url),
    primary_color: updates.primary_color ?? null,
    ...(updates.slug ? { slug: updates.slug } : {}),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/menu/${slug}`);
  revalidatePath(`/menu/${updates.slug ?? slug}/admin`);
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function fetchCategories(restaurantId: string): Promise<Category[]> {
  const { data } = await db().from("categories").select("*").eq("restaurant_id", restaurantId).order("position");
  if (!data) return [];
  return data.map((c) => ({
    id: c.id,
    restaurant_id: c.restaurant_id,
    name: c.name,
    description: c.description ?? undefined,
    position: c.position,
    created_at: c.created_at,
    translations: (c.translations ?? undefined) as Category["translations"],
  }));
}

export async function addCategoryAction(cat: Omit<Category, "id" | "created_at">, slug: string): Promise<Category> {
  const restaurantId = await assertOwner(slug);
  if (cat.restaurant_id !== restaurantId) throw new Error("Acesso negado");

  const { data, error } = await db().from("categories").insert({
    restaurant_id: restaurantId,
    name: cat.name,
    description: cat.description ?? null,
    position: cat.position,
  }).select().single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create category");
  revalidatePath(`/menu/${slug}`);
  return { id: data.id, restaurant_id: data.restaurant_id, name: data.name, description: data.description ?? undefined, position: data.position, created_at: data.created_at };
}

export async function updateCategoryAction(id: string, updates: Partial<Category>, slug: string) {
  const restaurantId = await assertOwner(slug);

  // Ensure the category belongs to the owned restaurant
  const { data: cat } = await db().from("categories").select("restaurant_id").eq("id", id).single();
  if (!cat || cat.restaurant_id !== restaurantId) throw new Error("Acesso negado");

  const { error } = await db().from("categories").update({
    name: updates.name,
    description: updates.description ?? null,
    position: updates.position,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/menu/${slug}`);
}

export async function deleteCategoryAction(id: string, slug: string) {
  const restaurantId = await assertOwner(slug);

  // Ensure the category belongs to the owned restaurant
  const { data: cat } = await db().from("categories").select("restaurant_id").eq("id", id).single();
  if (!cat || cat.restaurant_id !== restaurantId) throw new Error("Acesso negado");

  // Cascade: delete dishes in this category first
  await db().from("dishes").delete().eq("category_id", id);
  const { error } = await db().from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/menu/${slug}`);
}

// ── Dishes ────────────────────────────────────────────────────────────────────

export async function fetchDishes(restaurantId: string): Promise<Dish[]> {
  const { data } = await db().from("dishes").select("*").eq("restaurant_id", restaurantId).order("position");
  if (!data) return [];
  return data.map((d) => ({
    id: d.id,
    restaurant_id: d.restaurant_id,
    category_id: d.category_id,
    name: d.name,
    description: d.description,
    price: d.price,
    image_url: d.image_url ?? undefined,
    allergens: (d.allergens ?? []) as Dish["allergens"],
    calories: d.calories ?? undefined,
    proteins: d.proteins ?? undefined,
    carbs: d.carbs ?? undefined,
    fat: d.fat ?? undefined,
    is_available: d.is_available,
    is_featured: d.is_featured,
    tags: d.tags ?? [],
    position: d.position,
    manual_pairings: (d.manual_pairings ?? undefined) as ManualPairings | undefined,
    translations: (d.translations ?? undefined) as Dish["translations"],
    created_at: d.created_at,
    updated_at: d.updated_at,
  }));
}

export async function addDishAction(dish: Omit<Dish, "id" | "created_at" | "updated_at">, slug: string): Promise<Dish> {
  const restaurantId = await assertOwner(slug);
  if (dish.restaurant_id !== restaurantId) throw new Error("Acesso negado");

  const { data, error } = await db().from("dishes").insert({
    restaurant_id: restaurantId,
    category_id: dish.category_id,
    name: dish.name,
    description: dish.description,
    price: dish.price,
    image_url: safeUrl(dish.image_url),
    allergens: dish.allergens,
    calories: dish.calories ?? null,
    proteins: dish.proteins ?? null,
    carbs: dish.carbs ?? null,
    fat: dish.fat ?? null,
    is_available: dish.is_available,
    is_featured: dish.is_featured,
    tags: dish.tags,
    position: dish.position,
    manual_pairings: dish.manual_pairings ?? null,
    translations: dish.translations ?? null,
  }).select().single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create dish");
  revalidatePath(`/menu/${slug}`);
  return {
    id: data.id,
    restaurant_id: data.restaurant_id,
    category_id: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    image_url: data.image_url ?? undefined,
    allergens: (data.allergens ?? []) as Dish["allergens"],
    calories: data.calories ?? undefined,
    proteins: data.proteins ?? undefined,
    carbs: data.carbs ?? undefined,
    fat: data.fat ?? undefined,
    is_available: data.is_available,
    is_featured: data.is_featured,
    tags: data.tags ?? [],
    position: data.position,
    manual_pairings: (data.manual_pairings ?? undefined) as ManualPairings | undefined,
    translations: (data.translations ?? undefined) as Dish["translations"],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

async function assertDishOwnership(dishId: string, slug: string) {
  const restaurantId = await assertOwner(slug);
  const { data } = await db().from("dishes").select("restaurant_id").eq("id", dishId).single();
  if (!data || data.restaurant_id !== restaurantId) throw new Error("Acesso negado");
}

export async function updateDishAction(id: string, updates: Partial<Dish>, slug: string) {
  await assertDishOwnership(id, slug);
  const { error } = await db().from("dishes").update({
    category_id: updates.category_id,
    name: updates.name,
    description: updates.description,
    price: updates.price,
    image_url: safeUrl(updates.image_url),
    allergens: updates.allergens,
    calories: updates.calories ?? null,
    proteins: updates.proteins ?? null,
    carbs: updates.carbs ?? null,
    fat: updates.fat ?? null,
    is_available: updates.is_available,
    is_featured: updates.is_featured,
    tags: updates.tags,
    position: updates.position,
    manual_pairings: updates.manual_pairings ?? null,
    translations: updates.translations ?? null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/menu/${slug}`);
}

export async function deleteDishAction(id: string, slug: string) {
  await assertDishOwnership(id, slug);

  // Clean up storage image if hosted in our bucket (best-effort)
  const { data: dish } = await db().from("dishes").select("image_url").eq("id", id).single();
  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dish-images/`;
  if (dish?.image_url?.startsWith(storageBase)) {
    const path = dish.image_url.replace(storageBase, "");
    await db().storage.from("dish-images").remove([path]).catch(() => null);
  }

  const { error } = await db().from("dishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/menu/${slug}`);
}
