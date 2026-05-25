import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockCheckAiUsage = vi.fn();
const mockIncrementAiUsage = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/ai-usage", () => ({
  checkAiUsage: mockCheckAiUsage,
  incrementAiUsage: mockIncrementAiUsage,
  AI_MONTHLY_LIMIT: 200,
}));

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

const REST_ID = "00000000-0000-4000-8000-000000000099";

function post(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("https://tastly.stacklabs.pt/api/recommendations", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
  });
}

const validDish = {
  restaurant_id: REST_ID,
  name: "Bacalhau à Brás",
  description: "Bacalhau desfiado",
  tags: [],
  allergens: [],
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("POST /api/recommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIncrementAiUsage.mockResolvedValue(undefined);
  });

  it("returns 400 when restaurant_id is missing (closes the AI-limit bypass)", async () => {
    const { POST } = await import("../route");
    // dish without restaurant_id
    const res = await POST(post({ dish: { name: "X", description: "Y", tags: [], allergens: [] } }, "10.0.0.1"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/restaurante/i);
    // must NOT have called the AI when bypass is attempted
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid dish name", async () => {
    const { POST } = await import("../route");
    const res = await POST(post({ dish: { restaurant_id: REST_ID, name: "" } }, "10.0.0.2"));
    expect(res.status).toBe(400);
  });

  it("returns 429 when the restaurant is over its monthly AI limit", async () => {
    mockCheckAiUsage.mockResolvedValue(false);
    const { POST } = await import("../route");
    const res = await POST(post({ dish: validDish, dishType: "main", locale: "pt" }, "10.0.0.3"));
    expect(res.status).toBe(429);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns recommendations and increments usage on success", async () => {
    mockCheckAiUsage.mockResolvedValue(true);
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: '{"wines":[{"name":"Alvarinho","description":"Minho","why":"fresh"}],"starters":[],"mains":[],"desserts":[],"reasoning":"x"}' }],
    });
    const { POST } = await import("../route");
    const res = await POST(post({ dish: validDish, dishType: "main", locale: "pt" }, "10.0.0.4"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.wines).toHaveLength(1);
    expect(mockIncrementAiUsage).toHaveBeenCalledWith(REST_ID);
  });
});
