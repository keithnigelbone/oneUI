import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Lazy-initialized Supabase client. Returns null if env vars are not set,
 * so the rest of the app never crashes due to a missing configuration.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  _client = createClient(url, key);
  return _client;
}
