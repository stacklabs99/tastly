import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

const EVENT_TYPES = ["menu_view", "dish_view", "ai_pairing"] as const;
type EventType = (typeof EVENT_TYPES)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Light IP rate limit so analytics can't be trivially spammed (in-memory; best-effort).
const rl = new Map<string, { n: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.reset) { rl.set(ip, { n: 1, reset: now + 60_000 }); return true; }
  if (entry.n >= 120) return false;
  entry.n++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    // Silently accept to avoid leaking limits to clients; just don't record.
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { restaurant_id, type, dish_id } = body as {
    restaurant_id?: unknown;
    type?: unknown;
    dish_id?: unknown;
  };

  if (typeof restaurant_id !== "string" || !UUID_RE.test(restaurant_id)) {
    return NextResponse.json({ error: "Restaurante inválido" }, { status: 400 });
  }
  if (typeof type !== "string" || !EVENT_TYPES.includes(type as EventType)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }
  const dishId = typeof dish_id === "string" && UUID_RE.test(dish_id) ? dish_id : null;

  const db = createSupabaseServiceClient();
  await db.from("analytics_events").insert({
    restaurant_id,
    type,
    dish_id: dishId,
  });

  // Opportunistic retention: ~1% of writes prune events older than 90 days.
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 90 * 864e5).toISOString();
    await db.from("analytics_events").delete().lt("created_at", cutoff);
  }

  return new NextResponse(null, { status: 204 });
}
