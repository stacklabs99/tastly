import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));

const mockSingle = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    from: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chain: any = {};
      for (const m of ["select", "eq"]) chain[m] = vi.fn(() => chain);
      chain.single = mockSingle;
      return chain;
    },
  })),
}));

const mockCheckAiUsage = vi.fn();
vi.mock("@/lib/ai-usage", () => ({
  checkAiUsage: mockCheckAiUsage,
  incrementAiUsage: vi.fn().mockResolvedValue(undefined),
  AI_MONTHLY_LIMIT: 200,
}));

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class { messages = { create: mockCreate }; },
}));

function req(parts: { file?: File; slug?: string }) {
  const fd = new FormData();
  if (parts.file) fd.append("file", parts.file);
  if (parts.slug !== undefined) fd.append("slug", parts.slug);
  return new NextRequest("https://tastly.stacklabs.pt/api/import-menu", { method: "POST", body: fd });
}

const pngFile = () => new File(["x"], "menu.png", { type: "image/png" });

describe("POST /api/import-menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAiUsage.mockResolvedValue(true);
  });

  it("returns 400 when slug is missing", async () => {
    const { POST } = await import("../route");
    const res = await POST(req({ file: pngFile() }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { POST } = await import("../route");
    const res = await POST(req({ file: pngFile(), slug: "casa-do-mar" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when the user does not own the restaurant", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.pt" } } });
    mockSingle.mockResolvedValue({ data: null }); // ownership lookup fails
    const { POST } = await import("../route");
    const res = await POST(req({ file: pngFile(), slug: "casa-do-mar" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 for an unsupported file type", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.pt" } } });
    mockSingle.mockResolvedValue({ data: { id: "rest-1" } });
    const { POST } = await import("../route");
    const res = await POST(req({ file: new File(["x"], "x.txt", { type: "text/plain" }), slug: "casa-do-mar" }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 429 when over the AI monthly limit", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.pt" } } });
    mockSingle.mockResolvedValue({ data: { id: "rest-1" } });
    mockCheckAiUsage.mockResolvedValue(false);
    const { POST } = await import("../route");
    const res = await POST(req({ file: pngFile(), slug: "casa-do-mar" }));
    expect(res.status).toBe(429);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("extracts and sanitises categories on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.pt" } } });
    mockSingle.mockResolvedValue({ data: { id: "rest-1" } });
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: '{"categories":[{"name":"Entradas","dishes":[{"name":"Croquetes","description":"","price":8.5},{"name":"","price":3}]}]}' }],
    });
    const { POST } = await import("../route");
    const res = await POST(req({ file: pngFile(), slug: "casa-do-mar" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.categories).toHaveLength(1);
    // dish with empty name is filtered out
    expect(body.categories[0].dishes).toHaveLength(1);
    expect(body.categories[0].dishes[0].name).toBe("Croquetes");
  });
});
