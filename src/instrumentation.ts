import * as Sentry from "@sentry/nextjs";

// Server-side error monitoring. No-op unless NEXT_PUBLIC_SENTRY_DSN is set,
// so the build and local dev work without any Sentry account configured.
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.server.config");
  }
}

// Captures errors thrown in Server Components, route handlers and server actions.
export const onRequestError = Sentry.captureRequestError;
