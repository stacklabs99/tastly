import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
      delete: vi.fn(() => ({ lt: mockDelete })),
    })),
  })),
}));

const REST_ID = "00000000-0000-4000-8000-000000000123";
const DISH_ID = "00000000-0000-4000-8000-000000000456";

function post(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("https://tastly.stacklabs.pt/api/track", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
  });
}

describe("POST /api/track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("records a valid menu_view (204, inserts row)", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ restaurant_id: REST_ID, type: "menu_view" }, "10.1.0.1"));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ restaurant_id: REST_ID, type: "menu_view", dish_id: null })
    );
  });

  it("records a dish_view with dish_id", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ restaurant_id: REST_ID, type: "dish_view", dish_id: DISH_ID }, "10.1.0.2"));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dish_view", dish_id: DISH_ID })
    );
  });

  it("rejects an unknown event type (400, no insert)", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ restaurant_id: REST_ID, type: "hack" }, "10.1.0.3"));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("rejects a missing/invalid restaurant_id (400, no insert)", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ type: "menu_view" }, "10.1.0.4"));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("rejects a non-uuid restaurant_id", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ restaurant_id: "not-a-uuid", type: "menu_view" }, "10.1.0.5"));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("ignores an invalid dish_id (stores null instead)", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ restaurant_id: REST_ID, type: "dish_view", dish_id: "bad" }, "10.1.0.6"));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dish_view", dish_id: null })
    );
  });

  it("returns 400 on invalid JSON", async () => {
    const { POST } = await import("../route");
    const req = new NextRequest("https://tastly.stacklabs.pt/api/track", {
      method: "POST",
      body: "{not json",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.1.0.7" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
