import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));

// Queue-driven chain mock: `single()` and the thenable resolve from ordered queues.
let singleQueue: unknown[] = [];
let thenQueue: unknown[] = [];
let lastInsert: unknown = null;

function makeChain() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  for (const m of ["from", "select", "eq", "order", "limit", "update", "delete"]) {
    chain[m] = vi.fn(() => chain);
  }
  chain.insert = vi.fn((rows: unknown) => { lastInsert = rows; return chain; });
  chain.single = vi.fn(() => Promise.resolve(singleQueue.shift() ?? { data: null, error: null }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chain.then = (resolve: any) => resolve(thenQueue.shift() ?? { data: [], error: null, count: 0 });
  return chain;
}

vi.mock("@/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn(() => ({ from: () => makeChain() })),
}));

const OWNER = "00000000-0000-4000-8000-000000000001";
const REST = "00000000-0000-4000-8000-000000000002";
const CAT = "00000000-0000-4000-8000-000000000003";

describe("bulkCreateMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleQueue = [];
    thenQueue = [];
    lastInsert = null;
  });

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { bulkCreateMenu } = await import("@/actions/import");
    await expect(bulkCreateMenu("casa-do-mar", [{ name: "X", dishes: [{ name: "Y", price: 1 }] }]))
      .rejects.toThrow("Não autenticado");
  });

  it("throws 'Acesso negado' when the user does not own the restaurant", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER, email: "a@b.pt" } } });
    singleQueue = [{ data: null, error: null }]; // owner lookup fails
    const { bulkCreateMenu } = await import("@/actions/import");
    await expect(bulkCreateMenu("casa-do-mar", [{ name: "X", dishes: [{ name: "Y", price: 1 }] }]))
      .rejects.toThrow("Acesso negado");
  });

  it("throws 'Nada para importar' for empty input", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER, email: "a@b.pt" } } });
    singleQueue = [{ data: { id: REST }, error: null }];
    const { bulkCreateMenu } = await import("@/actions/import");
    await expect(bulkCreateMenu("casa-do-mar", [])).rejects.toThrow("Nada para importar");
  });

  it("creates categories and dishes, clamping invalid prices", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER, email: "a@b.pt" } } });
    singleQueue = [
      { data: { id: REST }, error: null },   // assertOwner
      { data: { id: CAT }, error: null },    // category insert
    ];
    thenQueue = [
      { data: [], error: null },             // existing positions (none)
      { error: null, count: 2 },             // dishes insert
    ];

    const { bulkCreateMenu } = await import("@/actions/import");
    const result = await bulkCreateMenu("casa-do-mar", [
      {
        name: "Entradas",
        dishes: [
          { name: "Croquetes", description: "de bacalhau", price: 8.5 },
          { name: "Sopa", price: 99999 }, // out of range → clamped to 9999
        ],
      },
    ]);

    expect(result).toEqual({ categories: 1, dishes: 2 });
    // Verify price clamping happened on the inserted rows
    const rows = lastInsert as { name: string; price: number }[];
    expect(rows.find((r) => r.name === "Sopa")?.price).toBe(9999);
    expect(rows.find((r) => r.name === "Croquetes")?.price).toBe(8.5);
  });

  it("skips categories with no valid dishes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER, email: "a@b.pt" } } });
    singleQueue = [{ data: { id: REST }, error: null }];
    thenQueue = [{ data: [], error: null }]; // existing positions
    const { bulkCreateMenu } = await import("@/actions/import");
    const result = await bulkCreateMenu("casa-do-mar", [
      { name: "Vazia", dishes: [{ name: "", price: 5 }] }, // dish has no name → filtered
    ]);
    expect(result).toEqual({ categories: 0, dishes: 0 });
  });
});
