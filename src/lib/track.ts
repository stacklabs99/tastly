type TrackType = "menu_view" | "dish_view" | "ai_pairing";

// Fire-and-forget analytics. Never blocks the UI and never throws — a failed
// beacon must not affect the menu experience.
export function track(type: TrackType, restaurantId: string, dishId?: string): void {
  if (typeof window === "undefined" || !restaurantId) return;

  const payload = JSON.stringify({ restaurant_id: restaurantId, type, dish_id: dishId ?? null });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }

  // Fallback for environments without sendBeacon
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
