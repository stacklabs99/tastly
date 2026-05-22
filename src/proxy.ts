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
  const isPlatformAdmin = pathname.startsWith("/admin");

  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    if (isPlatformAdmin) {
      loginUrl.pathname = "/auth/login";
    } else {
      const slugMatch = pathname.match(/\/menu\/([^/]+)\/admin/);
      const slug = slugMatch?.[1] ?? "";
      loginUrl.pathname = `/menu/${slug}/admin/login`;
    }
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    if (pathname === "/auth/login") {
      redirectUrl.pathname = "/admin";
    } else {
      const slugMatch = pathname.match(/\/menu\/([^/]+)\/admin/);
      const slug = slugMatch?.[1] ?? "";
      redirectUrl.pathname = `/menu/${slug}/admin`;
    }
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/menu/:slug/admin/:path*", "/admin/:path*", "/admin", "/auth/login"],
};
