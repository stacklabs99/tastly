import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedClient = SupabaseClient<any>;

let _browserClient: TypedClient | null = null;

// Uses @supabase/ssr — stores session in cookies so the middleware can read it
export function getSupabaseBrowserClient(): TypedClient {
  if (!_browserClient) {
    _browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _browserClient;
}

export function createSupabaseServiceClient(): TypedClient {
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL && !SUPABASE_URL.includes("your_supabase_url_here") &&
    SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("your_supabase_anon_key_here")
  );
}
