"use server";

import { createSupabaseServiceClient } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function db() {
  return createSupabaseServiceClient();
}

// Verifies the authenticated user owns the restaurant. Returns its id.
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

export type AnalyticsData = {
  days: number;
  menuViews: number;
  dishViews: number;
  aiRequests: number;
  viewsByDay: { date: string; count: number }[];
  topDishes: { id: string; name: string; views: number }[];
  peakHours: { hour: number; count: number }[];
  aiByDish: { id: string; name: string; count: number }[];
};

type EventRow = { type: string; dish_id: string | null; created_at: string };

export async function getAnalytics(slug: string, days = 30): Promise<AnalyticsData> {
  const restaurantId = await assertOwner(slug);
  const windowDays = days === 7 || days === 90 ? days : 30;
  const since = new Date(Date.now() - windowDays * 864e5).toISOString();

  const [{ data: events }, { data: dishes }] = await Promise.all([
    db()
      .from("analytics_events")
      .select("type, dish_id, created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", since),
    db().from("dishes").select("id, name").eq("restaurant_id", restaurantId),
  ]);

  const rows = (events ?? []) as EventRow[];
  const dishName = new Map((dishes ?? []).map((d) => [d.id as string, d.name as string]));

  let menuViews = 0, dishViews = 0, aiRequests = 0;
  const byDay = new Map<string, number>();
  const dishCounts = new Map<string, number>();
  const aiCounts = new Map<string, number>();
  const hours = new Array(24).fill(0) as number[];

  for (const e of rows) {
    const day = e.created_at.slice(0, 10);
    if (e.type === "menu_view") {
      menuViews++;
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      hours[new Date(e.created_at).getHours()]++;
    } else if (e.type === "dish_view") {
      dishViews++;
      if (e.dish_id) dishCounts.set(e.dish_id, (dishCounts.get(e.dish_id) ?? 0) + 1);
    } else if (e.type === "ai_pairing") {
      aiRequests++;
      if (e.dish_id) aiCounts.set(e.dish_id, (aiCounts.get(e.dish_id) ?? 0) + 1);
    }
  }

  // Build a continuous day series so the chart has no gaps
  const viewsByDay: { date: string; count: number }[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    viewsByDay.push({ date: d, count: byDay.get(d) ?? 0 });
  }

  const topDishes = [...dishCounts.entries()]
    .map(([id, views]) => ({ id, name: dishName.get(id) ?? "—", views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const aiByDish = [...aiCounts.entries()]
    .map(([id, count]) => ({ id, name: dishName.get(id) ?? "—", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const peakHours = hours.map((count, hour) => ({ hour, count }));

  return {
    days: windowDays,
    menuViews,
    dishViews,
    aiRequests,
    viewsByDay,
    topDishes,
    peakHours,
    aiByDish,
  };
}
