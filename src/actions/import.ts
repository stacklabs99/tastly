"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function db() {
  return createSupabaseServiceClient();
}

async function assertOwner(slug: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAIL ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = superAdmins.includes((user.email ?? "").toLowerCase());

  let query = db().from("restaurants").select("id").eq("slug", slug);
  if (!isSuperAdmin) query = query.eq("owner_id", user.id);
  const { data } = await query.single();
  if (!data) throw new Error("Acesso negado");
  return data.id;
}

export type ImportCategory = {
  name: string;
  dishes: { name: string; description?: string; price: number }[];
};

// Bulk-creates reviewed categories + dishes from the AI import flow.
// Appends after any existing categories. No auto-translation (too many tokens) —
// the owner can backfill translations afterwards.
export async function bulkCreateMenu(
  slug: string,
  categories: ImportCategory[],
): Promise<{ categories: number; dishes: number }> {
  const restaurantId = await assertOwner(slug);

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error("Nada para importar");
  }

  // Bound totals defensively
  const safeCategories = categories.slice(0, 50);

  // Append after existing categories
  const { data: existing } = await db()
    .from("categories")
    .select("position")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: false })
    .limit(1);
  let catPos = (existing?.[0]?.position ?? 0) + 1;

  let createdCategories = 0;
  let createdDishes = 0;
  let totalDishes = 0;

  for (const cat of safeCategories) {
    const name = typeof cat.name === "string" ? cat.name.trim().slice(0, 100) : "";
    if (!name || !Array.isArray(cat.dishes) || cat.dishes.length === 0) continue;

    const { data: newCat, error: catErr } = await db()
      .from("categories")
      .insert({ restaurant_id: restaurantId, name, position: catPos })
      .select("id")
      .single();
    if (catErr || !newCat) continue;
    createdCategories++;
    catPos++;

    const rows = cat.dishes
      .slice(0, 200)
      .map((d, i) => ({
        name: typeof d.name === "string" ? d.name.trim().slice(0, 100) : "",
        description: typeof d.description === "string" ? d.description.trim().slice(0, 600) : "",
        price: typeof d.price === "number" && isFinite(d.price) ? Math.max(0, Math.min(9999, d.price)) : 0,
        position: i + 1,
      }))
      .filter((d) => d.name && totalDishes++ < 500)
      .map((d) => ({
        restaurant_id: restaurantId,
        category_id: newCat.id,
        name: d.name,
        description: d.description,
        price: d.price,
        position: d.position,
        allergens: [] as string[],
        is_available: true,
        is_featured: false,
        tags: [] as string[],
      }));

    if (rows.length > 0) {
      const { error: dishErr, count } = await db()
        .from("dishes")
        .insert(rows, { count: "exact" });
      if (!dishErr) createdDishes += count ?? rows.length;
    }
  }

  revalidatePath(`/menu/${slug}`);
  revalidatePath(`/menu/${slug}/admin/pratos`);

  return { categories: createdCategories, dishes: createdDishes };
}
