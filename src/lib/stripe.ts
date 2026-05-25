import Stripe from "stripe";

// Lazy — the Stripe constructor throws on a missing key. Building it at module
// load would crash the build and any route that imports this file when the key
// is absent. Construct on first use instead.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

export const STRIPE_PRICES = {
  get monthly() { return process.env.STRIPE_PRICE_MONTHLY!; },
  get yearly() { return process.env.STRIPE_PRICE_YEARLY!; },
} as const;

export type BillingInterval = "monthly" | "yearly";
