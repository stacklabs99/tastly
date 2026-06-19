import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { sendPaymentFailedEmail } from "@/lib/email";
import type Stripe from "stripe";

function db() {
  return createSupabaseServiceClient();
}

async function setRestaurantPlan(restaurantId: string, plan: "starter" | "pro", isActive: boolean) {
  await db()
    .from("restaurants")
    .update({ plan, is_active: isActive })
    .eq("id", restaurantId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Resolves the restaurant id for any event object. Checked in order:
  // 1. the object's own metadata (checkout sessions, subscriptions);
  // 2. invoices carry the subscription metadata snapshot under
  //    parent.subscription_details — invoice.metadata is NOT inherited from
  //    the subscription, so without this step invoice events never match;
  // 3. fallback to the Stripe customer id stored on the restaurant at checkout.
  const restaurantId = async (): Promise<string | null> => {
    const obj = event.data.object as unknown as Record<string, unknown>;

    const direct = (obj.metadata as Record<string, string> | null)?.restaurant_id;
    if (direct) return direct;

    const parent = obj.parent as
      | { subscription_details?: { metadata?: Record<string, string> | null } | null }
      | null
      | undefined;
    const fromParent = parent?.subscription_details?.metadata?.restaurant_id;
    if (fromParent) return fromParent;

    const customer = obj.customer;
    const customerId =
      typeof customer === "string" ? customer : (customer as { id?: string } | null)?.id;
    if (!customerId) return null;
    const { data } = await db()
      .from("restaurants")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
    return data?.id ?? null;
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rid = session.metadata?.restaurant_id;
      if (rid) await setRestaurantPlan(rid, "pro", true);
      break;
    }

    case "invoice.payment_succeeded": {
      const rid = await restaurantId();
      if (rid) await setRestaurantPlan(rid, "pro", true);
      break;
    }

    case "invoice.payment_failed": {
      const rid = await restaurantId();
      if (rid) {
        await db()
          .from("restaurants")
          .update({ is_active: false })
          .eq("id", rid);

        // Notify the restaurant owner
        const { data: rest } = await db()
          .from("restaurants")
          .select("owner_id, slug")
          .eq("id", rid)
          .single();
        if (rest) {
          const { data: profile } = await createSupabaseServiceClient()
            .auth.admin.getUserById(rest.owner_id);
          if (profile.user?.email) {
            await sendPaymentFailedEmail(profile.user.email, rest.slug);
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const rid = await restaurantId();
      if (rid) await setRestaurantPlan(rid, "starter", false);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
