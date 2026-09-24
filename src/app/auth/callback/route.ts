import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the PKCE `code` from an email link (password recovery or signup
// confirmation) for a session, then continues to `next`. Public path (see
// PUBLIC_PATHS in the proxy).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or exchange failed (e.g. expired link) — send them to request a
  // fresh one.
  return NextResponse.redirect(`${origin}/forgot-password?expired=1`);
}
