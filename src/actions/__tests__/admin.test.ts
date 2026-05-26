import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Static mocks (declared before vi.mock hoisting) ───────────────────────────

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockAutoTranslateDish = vi.fn();
const mockNeedsTranslation = vi.fn();
vi.mock("@/lib/ai-translate", () => ({
  autoTranslateDish: mockAutoTranslateDish,
  needsTranslation: mockNeedsTranslation,
}));

const mockCheckAiUsage = vi.fn().mockResolvedValue(true);
const mockIncrementAiUsage = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/ai-usage", () => ({
  checkAiUsage: mockCheckAiUsage,
  incrementAiUsage: mockIncrementAiUsage,
  AI_MONTHLY_LIMIT: 200,
}));

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));

// Service client is re-created fresh per test via a factory
let _currentChain: ReturnType<typeof buildChain>;
vi.mock("@/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn(() => ({ from: vi.fn(() => _currentChain) })),
}));

// ── Chain factory ─────────────────────────────────────────────────────────────

type MockChain = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: (resolve: (v: unknown) => void) => void;
};

function buildChain(): MockChain {
  // The chain is thenable so `await chain.update(...).eq(...)` resolves to
  // { data: null, error: null } without needing a separate awaitable at the end.
  const c: MockChain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: (resolve) => resolve({ data: null, error: null }),
  };

  // Every fn except single & then returns the chain itself (fluent API)
  (["select", "insert", "update", "delete", "eq", "order"] as const).forEach((k) => {
    c[k].mockReturnValue(c);
  });

  return c;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OWNER_ID      = "00000000-0000-4000-8000-000000000001";
const RESTAURANT_ID = "00000000-0000-4000-8000-000000000002";
const CATEGORY_ID   = "00000000-0000-4000-8000-000000000003";

const baseDish = {
  restaurant_id: RESTAURANT_ID,
  category_id: CATEGORY_ID,
  name: "Bacalhau à Brás",
  description: "Bacalhau desfiado com ovos e batata palha.",
  price: 18,
  allergens: [] as [],
  is_available: true,
  is_featured: false,
  is_special: false,
  tags: [] as string[],
  position: 1,
};

const fakeDishRow = {
  ...baseDish,
  id: "00000000-0000-4000-8000-000000000004",
  image_url: null,
  calories: null,
  proteins: null,
  carbs: null,
  fat: null,
  manual_pairings: null,
  translations: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

// ── addDishAction ─────────────────────────────────────────────────────────────

describe("addDishAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _currentChain = buildChain();
  });

  it("calls autoTranslateDish when translations are needed", async () => {
    // assertOwner
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER_ID } } });
    _currentChain.single
      .mockResolvedValueOnce({ data: { id: RESTAURANT_ID }, error: null }) // assertOwner
      .mockResolvedValueOnce({ data: fakeDishRow, error: null }); // insert
    mockNeedsTranslation.mockReturnValue(true);
    mockAutoTranslateDish.mockResolvedValue({
      en: { name: "Bacalhau à Brás", description: "Shredded salt cod." },
      es: { name: "Bacalhau à Brás", description: "Bacalao desmigado." },
      fr: { name: "Bacalhau à Brás", description: "Morue effilochée." },
    });

    const { addDishAction } = await import("@/actions/admin");
    await addDishAction(baseDish, "casa-do-mar");

    expect(mockAutoTranslateDish).toHaveBeenCalledWith(
      "Bacalhau à Brás",
      "Bacalhau desfiado com ovos e batata palha."
    );
  });

  it("skips autoTranslateDish when translations are already complete", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER_ID } } });
    _currentChain.single
      .mockResolvedValueOnce({ data: { id: RESTAURANT_ID }, error: null })
      .mockResolvedValueOnce({ data: fakeDishRow, error: null });
    mockNeedsTranslation.mockReturnValue(false);

    const { addDishAction } = await import("@/actions/admin");
    await addDishAction({
      ...baseDish,
      translations: {
        en: { name: "EN" }, es: { name: "ES" }, fr: { name: "FR" },
      },
    }, "casa-do-mar");

    expect(mockAutoTranslateDish).not.toHaveBeenCalled();
  });

  it("saves the dish even if autoTranslateDish returns null", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER_ID } } });
    _currentChain.single
      .mockResolvedValueOnce({ data: { id: RESTAURANT_ID }, error: null })
      .mockResolvedValueOnce({ data: fakeDishRow, error: null });
    mockNeedsTranslation.mockReturnValue(true);
    mockAutoTranslateDish.mockResolvedValue(null);

    const { addDishAction } = await import("@/actions/admin");
    await expect(addDishAction(baseDish, "casa-do-mar")).resolves.toBeDefined();
  });

  it("throws 'Acesso negado' when restaurant does not belong to the user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER_ID } } });
    _currentChain.single.mockResolvedValueOnce({ data: null, error: null });

    const { addDishAction } = await import("@/actions/admin");
    await expect(
      addDishAction({ ...baseDish, restaurant_id: "other-rest" }, "wrong-slug")
    ).rejects.toThrow("Acesso negado");
  });

  it("throws 'Não autenticado' when user is not logged in", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { addDishAction } = await import("@/actions/admin");
    await expect(addDishAction(baseDish, "casa-do-mar")).rejects.toThrow("Não autenticado");
  });
});

// ── updateDishAction ──────────────────────────────────────────────────────────

describe("updateDishAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _currentChain = buildChain();
  });

  function setupOwnership() {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER_ID } } });
    (_currentChain.single as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: { id: RESTAURANT_ID }, error: null })             // assertOwner
      .mockResolvedValueOnce({ data: { restaurant_id: RESTAURANT_ID }, error: null })  // assertDishOwnership
      .mockResolvedValueOnce({ data: { restaurant_id: RESTAURANT_ID }, error: null }); // checkAiUsage lookup
    // update().eq() is awaitable via chain.then → { data: null, error: null }
  }

  it("calls autoTranslateDish when name and description are updated", async () => {
    setupOwnership();
    mockAutoTranslateDish.mockResolvedValue({
      en: { name: "Updated EN", description: "Desc EN." },
      es: { name: "Updated ES", description: "Desc ES." },
      fr: { name: "Updated FR", description: "Desc FR." },
    });

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction(
      "dish-1",
      { name: "Novo Nome", description: "Nova descrição." },
      "casa-do-mar"
    );

    expect(mockAutoTranslateDish).toHaveBeenCalledWith("Novo Nome", "Nova descrição.");
  });

  it("retranslates even when translations already exist (keeps them in sync)", async () => {
    setupOwnership();
    mockAutoTranslateDish.mockResolvedValue({
      en: { name: "Fresh EN", description: "Fresh desc." },
      es: { name: "Fresh ES", description: "Fresh desc." },
      fr: { name: "Fresh FR", description: "Fresh desc." },
    });

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction(
      "dish-1",
      {
        name: "Nome Atualizado",
        description: "Descrição atualizada.",
        translations: {
          en: { name: "Old EN" }, es: { name: "Old ES" }, fr: { name: "Old FR" },
        },
      },
      "casa-do-mar"
    );

    expect(mockAutoTranslateDish).toHaveBeenCalledOnce();
  });

  it("does NOT call autoTranslateDish when only price is updated", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { price: 20 }, "casa-do-mar");

    expect(mockAutoTranslateDish).not.toHaveBeenCalled();
  });

  it("does NOT call autoTranslateDish when only name is provided (no description)", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { name: "Só o Nome" }, "casa-do-mar");

    expect(mockAutoTranslateDish).not.toHaveBeenCalled();
  });

  // ── Regression: partial updates must not wipe untouched columns ───────────────

  it("toggling is_featured does NOT touch image_url, translations or manual_pairings", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { is_featured: true }, "casa-do-mar");

    const fields = (_currentChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(fields).toHaveProperty("is_featured", true);
    expect(fields).not.toHaveProperty("image_url");
    expect(fields).not.toHaveProperty("translations");
    expect(fields).not.toHaveProperty("manual_pairings");
    expect(fields).not.toHaveProperty("name");
  });

  it("toggling is_available only writes is_available and updated_at", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { is_available: false }, "casa-do-mar");

    const fields = (_currentChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(Object.keys(fields).sort()).toEqual(["is_available", "updated_at"]);
  });

  it("toggling is_special only writes is_special and updated_at (no data loss)", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { is_special: true }, "casa-do-mar");

    const fields = (_currentChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(Object.keys(fields).sort()).toEqual(["is_special", "updated_at"]);
    expect(fields).not.toHaveProperty("translations");
    expect(fields).not.toHaveProperty("image_url");
  });

  it("updating only price preserves translations (does not set them to null)", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { price: 25 }, "casa-do-mar");

    const fields = (_currentChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(fields).toHaveProperty("price", 25);
    expect(fields).not.toHaveProperty("translations");
    expect(fields).not.toHaveProperty("image_url");
  });

  it("clearing image_url explicitly still works (passes null through)", async () => {
    setupOwnership();

    const { updateDishAction } = await import("@/actions/admin");
    await updateDishAction("dish-1", { image_url: undefined }, "casa-do-mar");

    // image_url was provided as a key in updates → safeUrl(undefined) → null
    const fields = (_currentChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(fields).toHaveProperty("image_url", null);
  });
});
