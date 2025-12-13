import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using service role for cron/admin tasks.
 * Requires SUPABASE_SERVICE_KEY in env.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  }

  return createClient(url, serviceKey);
}
