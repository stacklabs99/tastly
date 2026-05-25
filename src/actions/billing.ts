"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";

function db() {
  return createSupabaseServiceClient();
}

export async function createCheckoutSession(restaurantId: string, slug: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: restaurant } = await db()
    .from("restaurants")
    .select("id, name, stripe_customer_id")
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) throw new Error("Acesso negado");

  let customerId = restaurant.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: restaurant.name,
      metadata: { restaurant_id: restaurantId },
    });
    customerId = customer.id;
    await db().from("restaurants").update({ stripe_customer_id: customerId }).eq("id", restaurantId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/menu/${slug}/admin?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/menu/${slug}/admin?payment=cancelled`,
    metadata: { restaurant_id: restaurantId },
    subscription_data: { metadata: { restaurant_id: restaurantId } },
  });

  return session.url!;
}

export async function createBillingPortalSession(restaurantId: string, slug: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: restaurant } = await db()
    .from("restaurants")
    .select("stripe_customer_id")
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .single();

  if (!restaurant?.stripe_customer_id) throw new Error("Sem subscrição activa");

  const session = await stripe.billingPortal.sessions.create({
    customer: restaurant.stripe_customer_id as string,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/menu/${slug}/admin`,
  });

  return session.url;
}
