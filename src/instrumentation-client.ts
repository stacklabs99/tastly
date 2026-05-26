import * as Sentry from "@sentry/nextjs";

// Browser-side error monitoring. No-op unless a DSN is configured.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: true,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

// Lets Sentry trace client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
