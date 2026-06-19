import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent: mockConstructEvent } }),
}));

const mockSendPaymentFailedEmail = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email", () => ({
  sendPaymentFailedEmail: mockSendPaymentFailedEmail,
}));

let _chain: ReturnType<typeof buildChain>;
const mockGetUserById = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    from: vi.fn(() => _chain),
    auth: { admin: { getUserById: mockGetUserById } },
  })),
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

// ── Helpers ────────────────────────────────────────────────────────────────────

const REST_ID = "00000000-0000-4000-8000-000000000002";

function makeRequest(body: string, sig?: string) {
  return new NextRequest("https://tastly.stacklabs.pt/api/stripe/webhook", {
    method: "POST",
    body,
    headers: sig ? { "stripe-signature": sig } : {},
  });
}

function makeEvent(type: string, metadata: Record<string, string> = {}) {
  return {
    type,
    data: {
      object: { metadata, id: "sub_123" },
    },
  };
}

// ── Security ──────────────────────────────────────────────────────────────────

describe("POST /api/stripe/webhook — security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _chain = buildChain();
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing signature/i);
  });

  it("returns 400 when stripe signature is invalid", async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error("Bad signature"); });
    const { POST } = await import("../route");
    const res = await POST(makeRequest("{}", "bad-sig"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid signature/i);
  });

  it("returns 200 when signature is valid", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("unknown.event"));
    const { POST } = await import("../route");
    const res = await POST(makeRequest("{}", "valid-sig"));
    expect(res.status).toBe(200);
  });
});

// ── Event handlers ────────────────────────────────────────────────────────────

describe("POST /api/stripe/webhook — events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _chain = buildChain();
  });

  it("checkout.session.completed sets plan=pro and is_active=true", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { metadata: { restaurant_id: REST_ID } } },
    });

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(_chain.update).toHaveBeenCalledWith({ plan: "pro", is_active: true });
    expect(_chain.eq).toHaveBeenCalledWith("id", REST_ID);
  });

  it("invoice.payment_succeeded sets plan=pro and is_active=true", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("invoice.payment_succeeded", { restaurant_id: REST_ID }));

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(_chain.update).toHaveBeenCalledWith({ plan: "pro", is_active: true });
  });

  it("invoice.payment_failed sets is_active=false and sends email", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("invoice.payment_failed", { restaurant_id: REST_ID }));
    _chain.single.mockResolvedValueOnce({
      data: { owner_id: "user-1", slug: "casa-do-mar" },
      error: null,
    });
    mockGetUserById.mockResolvedValue({
      data: { user: { email: "owner@rest.pt" } },
    });

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(_chain.update).toHaveBeenCalledWith({ is_active: false });
    expect(mockSendPaymentFailedEmail).toHaveBeenCalledWith("owner@rest.pt", "casa-do-mar");
  });

  it("invoice.payment_failed skips email if owner not found", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("invoice.payment_failed", { restaurant_id: REST_ID }));
    _chain.single.mockResolvedValueOnce({ data: null, error: null });

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(mockSendPaymentFailedEmail).not.toHaveBeenCalled();
  });

  it("customer.subscription.deleted sets plan=starter and is_active=false", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("customer.subscription.deleted", { restaurant_id: REST_ID }));

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(_chain.update).toHaveBeenCalledWith({ plan: "starter", is_active: false });
  });

  it("invoice events resolve restaurant_id from parent.subscription_details metadata", async () => {
    mockConstructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: {
        object: {
          metadata: null,
          parent: { subscription_details: { metadata: { restaurant_id: REST_ID } } },
        },
      },
    });

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(_chain.update).toHaveBeenCalledWith({ plan: "pro", is_active: true });
    expect(_chain.eq).toHaveBeenCalledWith("id", REST_ID);
  });

  it("invoice events fall back to stripe_customer_id lookup when metadata is absent", async () => {
    mockConstructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: { metadata: null, customer: "cus_123" } },
    });
    _chain.single.mockResolvedValueOnce({ data: { id: REST_ID }, error: null });

    const { POST } = await import("../route");
    await POST(makeRequest("{}", "sig"));

    expect(_chain.eq).toHaveBeenCalledWith("stripe_customer_id", "cus_123");
    expect(_chain.update).toHaveBeenCalledWith({ plan: "pro", is_active: true });
    expect(_chain.eq).toHaveBeenCalledWith("id", REST_ID);
  });

  it("events without restaurant_id in metadata are ignored gracefully", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("checkout.session.completed", {}));

    const { POST } = await import("../route");
    const res = await POST(makeRequest("{}", "sig"));

    expect(res.status).toBe(200);
    expect(_chain.update).not.toHaveBeenCalled();
  });

  it("unknown event types return 200 without DB writes", async () => {
    mockConstructEvent.mockReturnValue(makeEvent("payment_intent.created"));

    const { POST } = await import("../route");
    const res = await POST(makeRequest("{}", "sig"));

    expect(res.status).toBe(200);
    expect(_chain.update).not.toHaveBeenCalled();
  });
});
