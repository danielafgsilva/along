"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Marks onboarding done and enters the app. Both "Get started" and "Skip" call
// this, so the intro never shows again. Uses the admin client for the write:
// profiles has no self-update RLS policy (on purpose — that would let a user
// change their own role), and this only ever flips the flag for the caller.
export async function completeOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  redirect("/");
}
