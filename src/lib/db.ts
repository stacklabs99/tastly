import { createSupabaseServiceClient } from "./supabase";
import type { Dish, Category, Restaurant, ManualPairings } from "@/types";

function db() {
  return createSupabaseServiceClient();
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
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
    owner_id: data.owner_id,
    is_active: data.is_active,
    created_at: data.created_at,
  };
}

export async function getCategoriesForRestaurant(restaurantId: string): Promise<Category[]> {
  const { data } = await db().from("categories").select("*").eq("restaurant_id", restaurantId).order("position");
  if (!data) return [];
  return data.map((c) => ({
    id: c.id,
    restaurant_id: c.restaurant_id,
    name: c.name,
    description: c.description ?? undefined,
    position: c.position,
    created_at: c.created_at,
  }));
}

export async function getDishesForRestaurant(restaurantId: string): Promise<Dish[]> {
  const { data } = await db().from("dishes").select("*").eq("restaurant_id", restaurantId).order("category_id").order("position");
  if (!data) return [];
  return data.map((d) => ({
    id: d.id,
    restaurant_id: d.restaurant_id,
    category_id: d.category_id,
    name: d.name,
    description: d.description,
    price: Number(d.price),
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
    created_at: d.created_at,
    updated_at: d.updated_at,
  }));
}
