import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}));

const mockStripeCustomersCreate = vi.fn();
const mockStripeSessionsCreate = vi.fn();
const mockStripeBillingPortalCreate = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    customers: { create: mockStripeCustomersCreate },
    checkout: { sessions: { create: mockStripeSessionsCreate } },
    billingPortal: { sessions: { create: mockStripeBillingPortalCreate } },
  }),
  STRIPE_PRICES: { monthly: "price_monthly_test", yearly: "price_yearly_test" },
}));

let _chain: ReturnType<typeof buildChain>;
vi.mock("@/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn(() => ({ from: vi.fn(() => _chain) })),
}));

type MockChain = {
  select: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: (resolve: (v: unknown) => void) => void;
};

function buildChain(): MockChain {
  const c: MockChain = {
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: (resolve) => resolve({ data: null, error: null }),
  };
  (["select", "update", "eq"] as const).forEach((k) => c[k].mockReturnValue(c));
  return c;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const USER_ID    = "00000000-0000-4000-8000-000000000001";
const REST_ID    = "00000000-0000-4000-8000-000000000002";
const SLUG       = "casa-do-mar";
const SITE_URL   = "https://tastly.stacklabs.pt";

process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;

// ── createCheckoutSession ──────────────────────────────────────────────────────

describe("createCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _chain = buildChain();
  });

  it("throws 'Não autenticado' when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { createCheckoutSession } = await import("@/actions/billing");
    await expect(createCheckoutSession(REST_ID, SLUG, "monthly")).rejects.toThrow("Não autenticado");
  });

  it("throws 'Acesso negado' when restaurant not owned by user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID, email: "a@b.pt" } } });
    _chain.single.mockResolvedValueOnce({ data: null, error: null });
    const { createCheckoutSession } = await import("@/actions/billing");
    await expect(createCheckoutSession(REST_ID, SLUG, "monthly")).rejects.toThrow("Acesso negado");
  });

  it("throws 'Intervalo inválido' for unknown billing interval", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID, email: "a@b.pt" } } });
    const { createCheckoutSession } = await import("@/actions/billing");
    // @ts-expect-error — testing invalid input
    await expect(createCheckoutSession(REST_ID, SLUG, "weekly")).rejects.toThrow("Intervalo inválido");
  });

  it("creates a new Stripe customer when none exists and returns session URL", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID, email: "owner@rest.pt" } } });
    _chain.single.mockResolvedValueOnce({
      data: { id: REST_ID, name: "Casa do Mar", stripe_customer_id: null },
      error: null,
    });
    mockStripeCustomersCreate.mockResolvedValue({ id: "cus_new123" });
    mockStripeSessionsCreate.mockResolvedValue({ url: `${SITE_URL}/checkout` });

    const { createCheckoutSession } = await import("@/actions/billing");
    const url = await createCheckoutSession(REST_ID, SLUG, "monthly");

    expect(mockStripeCustomersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: "owner@rest.pt", metadata: { restaurant_id: REST_ID } })
    );
    expect(mockStripeSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_new123",
        mode: "subscription",
        line_items: [{ price: "price_monthly_test", quantity: 1 }],
      })
    );
    expect(url).toBe(`${SITE_URL}/checkout`);
  });

  it("reuses existing Stripe customer and uses yearly price", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID, email: "owner@rest.pt" } } });
    _chain.single.mockResolvedValueOnce({
      data: { id: REST_ID, name: "Casa do Mar", stripe_customer_id: "cus_existing" },
      error: null,
    });
    mockStripeSessionsCreate.mockResolvedValue({ url: `${SITE_URL}/checkout-yearly` });

    const { createCheckoutSession } = await import("@/actions/billing");
    await createCheckoutSession(REST_ID, SLUG, "yearly");

    expect(mockStripeCustomersCreate).not.toHaveBeenCalled();
    expect(mockStripeSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_existing",
        line_items: [{ price: "price_yearly_test", quantity: 1 }],
      })
    );
  });

  it("includes correct success and cancel URLs", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID, email: "owner@rest.pt" } } });
    _chain.single.mockResolvedValueOnce({
      data: { id: REST_ID, name: "Casa do Mar", stripe_customer_id: "cus_existing" },
      error: null,
    });
    mockStripeSessionsCreate.mockResolvedValue({ url: "https://stripe.com/pay" });

    const { createCheckoutSession } = await import("@/actions/billing");
    await createCheckoutSession(REST_ID, SLUG, "monthly");

    expect(mockStripeSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: `${SITE_URL}/menu/${SLUG}/admin?payment=success`,
        cancel_url: `${SITE_URL}/menu/${SLUG}/admin?payment=cancelled`,
      })
    );
  });
});

// ── createBillingPortalSession ─────────────────────────────────────────────────

describe("createBillingPortalSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _chain = buildChain();
  });

  it("throws 'Não autenticado' when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { createBillingPortalSession } = await import("@/actions/billing");
    await expect(createBillingPortalSession(REST_ID, SLUG)).rejects.toThrow("Não autenticado");
  });

  it("throws 'Sem subscrição activa' when no stripe_customer_id", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    _chain.single.mockResolvedValueOnce({ data: { stripe_customer_id: null }, error: null });
    const { createBillingPortalSession } = await import("@/actions/billing");
    await expect(createBillingPortalSession(REST_ID, SLUG)).rejects.toThrow("Sem subscrição activa");
  });

  it("creates billing portal session and returns URL", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    _chain.single.mockResolvedValueOnce({
      data: { stripe_customer_id: "cus_abc" },
      error: null,
    });
    mockStripeBillingPortalCreate.mockResolvedValue({ url: `${SITE_URL}/portal` });

    const { createBillingPortalSession } = await import("@/actions/billing");
    const url = await createBillingPortalSession(REST_ID, SLUG);

    expect(mockStripeBillingPortalCreate).toHaveBeenCalledWith({
      customer: "cus_abc",
      return_url: `${SITE_URL}/menu/${SLUG}/admin`,
    });
    expect(url).toBe(`${SITE_URL}/portal`);
  });
});
