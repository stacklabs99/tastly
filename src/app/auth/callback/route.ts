import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const { searchParams: sp } = new URL(request.url);
  const slug = sp.get("slug");
  const base = next.startsWith("/") ? next : "/admin";
  const redirectTo = slug ? `${base}?slug=${encodeURIComponent(slug)}` : base;
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
