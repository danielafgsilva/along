import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY Supabase client using the secret key. It bypasses RLS and can use
// the auth.admin API (create users, etc.), so it must NEVER be imported into a
// Client Component — only Server Actions, Route Handlers, and scripts.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
