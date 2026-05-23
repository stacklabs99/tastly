import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./lib/supabase";

export async function proxy(request: NextRequest) {
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

  // Validates JWT server-side — never trust getSession() alone
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.endsWith("/login") || pathname === "/auth/login";
  const isSignupPage = pathname === "/auth/signup";
  const isOnboarding = pathname === "/onboarding";
  const isPlatformAdmin = pathname.startsWith("/admin");

  // Unauthenticated: redirect to appropriate login
  if (!user && !isLoginPage && !isSignupPage) {
    const loginUrl = request.nextUrl.clone();
    if (isPlatformAdmin) {
      loginUrl.pathname = "/auth/login";
    } else if (isOnboarding) {
      loginUrl.pathname = "/auth/signup";
    } else {
      const slugMatch = pathname.match(/\/menu\/([^/]+)\/admin/);
      const slug = slugMatch?.[1] ?? "";
      loginUrl.pathname = `/menu/${slug}/admin/login`;
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated on platform login → go to admin
  if (user && pathname === "/auth/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated on signup → go to onboarding (layout will redirect if already has restaurant)
  if (user && isSignupPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/menu/:slug/admin/:path*", "/admin/:path*", "/admin", "/auth/login", "/auth/signup", "/onboarding"],
};
