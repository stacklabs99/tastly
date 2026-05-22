import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendNewRegistrationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // New user confirming email → notify super admins
    if (next === "/onboarding" && data.user?.email) {
      await sendNewRegistrationEmail(data.user.email);
    }
  }

  const slug = searchParams.get("slug");
  const base = next.startsWith("/") ? next : "/admin";
  const redirectTo = slug ? `${base}?slug=${encodeURIComponent(slug)}` : base;
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
