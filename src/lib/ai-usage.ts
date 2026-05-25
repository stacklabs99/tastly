import { createSupabaseServiceClient } from "@/lib/supabase";

// ~200 calls/month keeps spend well under $1/restaurant with Claude Haiku
export const AI_MONTHLY_LIMIT = 200;

function db() {
  return createSupabaseServiceClient();
}

/**
 * Returns true if the restaurant is under the monthly AI limit.
 * Resets the counter automatically when a new month begins.
 */
export async function checkAiUsage(restaurantId: string): Promise<boolean> {
  const { data } = await db()
    .from("restaurants")
    .select("ai_calls_this_month, ai_month_reset_at")
    .eq("id", restaurantId)
    .single();

  if (!data) return false;

  const resetAt = new Date(data.ai_month_reset_at);
  const now = new Date();
  const newMonth = now.getFullYear() > resetAt.getFullYear() ||
    now.getMonth() > resetAt.getMonth();

  if (newMonth) {
    await db()
      .from("restaurants")
      .update({ ai_calls_this_month: 0, ai_month_reset_at: now.toISOString() })
      .eq("id", restaurantId);
    return true;
  }

  return data.ai_calls_this_month < AI_MONTHLY_LIMIT;
}

export async function incrementAiUsage(restaurantId: string): Promise<void> {
  await db().rpc("increment_ai_calls", { restaurant_id: restaurantId });
}
