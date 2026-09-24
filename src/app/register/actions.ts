"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = { error?: string; notice?: string };

// True if `dob` (YYYY-MM-DD) is a valid date at least 13 years before today.
function isAtLeast13(dob: string): boolean {
  const d = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 13);
  cutoff.setHours(0, 0, 0, 0);
  return d.getTime() <= cutoff.getTime();
}

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const dob = String(formData.get("date_of_birth") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!fullName) return { error: "Enter your name." };
  if (!dob) return { error: "Enter your date of birth." };
  if (!isAtLeast13(dob)) {
    return { error: "You must be at least 13 years old to register." };
  }
  if (!email) return { error: "Enter your email." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) return { error: "Passwords do not match." };

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Where the confirmation email link returns, if confirmation is enabled.
      emailRedirectTo: `${origin}/auth/callback`,
      // Goes into user_metadata; the profiles trigger copies it across. Role is
      // NOT settable here — self-registration always yields a normal 'user'.
      data: { full_name: fullName, date_of_birth: dob },
    },
  });

  if (error) return { error: error.message };

  // Email confirmation disabled → signUp returns a session and the auth cookies
  // are already set, so we're logged in. Otherwise, ask them to confirm.
  if (data.session) redirect("/");
  return {
    notice: "Account created. Check your email to confirm, then sign in.",
  };
}
