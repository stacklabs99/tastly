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

  const restaurantId = (): string | null => {
    const obj = event.data.object as unknown as Record<string, unknown>;
    return (
      (obj.metadata as Record<string, string> | null)?.restaurant_id ?? null
    );
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rid = session.metadata?.restaurant_id;
      if (rid) await setRestaurantPlan(rid, "pro", true);
      break;
    }

    case "invoice.payment_succeeded": {
      const rid = restaurantId();
      if (rid) await setRestaurantPlan(rid, "pro", true);
      break;
    }

    case "invoice.payment_failed": {
      const rid = restaurantId();
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
      const sub = event.data.object as Stripe.Subscription;
      const rid = (sub.metadata as Record<string, string>)?.restaurant_id;
      if (rid) await setRestaurantPlan(rid, "starter", false);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
