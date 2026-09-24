import { NextResponse } from "next/server";

// Simple Supabase connectivity check — hits the Auth health endpoint from the
// Next server. No tables or session required. Visit /api/health to verify the
// URL + anon key reach the project. Returns { ok, status }.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase environment variables." },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
      cache: "no-store",
    });
    return NextResponse.json(
      { ok: res.ok, status: res.status, supabaseUrl: url },
      { status: res.ok ? 200 : 502 },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 502 },
    );
  }
}
