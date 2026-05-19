import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./lib/supabase";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() validates the JWT server-side — never trust getSession() alone
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.endsWith("/login");

  if (!user && !isLoginPage) {
    const slugMatch = pathname.match(/\/menu\/([^/]+)\/admin/);
    const slug = slugMatch?.[1] ?? "";
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/menu/${slug}/admin/login`;
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → don't show the login page
  if (user && isLoginPage) {
    const slugMatch = pathname.match(/\/menu\/([^/]+)\/admin/);
    const slug = slugMatch?.[1] ?? "";
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = `/menu/${slug}/admin`;
    return NextResponse.redirect(adminUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/menu/:slug/admin/:path*"],
};
