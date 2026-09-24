"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExperienceStatus } from "@/types";

type ExperiencePatch = {
  title?: string;
  status?: ExperienceStatus;
  description?: string | null;
  notes?: string | null;
  location?: string | null;
  occurred_on?: string | null;
  reflection?: string | null;
};

const EDITABLE_FIELDS = [
  "title",
  "status",
  "description",
  "notes",
  "location",
  "occurred_on",
  "reflection",
] as const;

function revalidateExperience(id: string) {
  revalidatePath("/");
  revalidatePath(`/experiences/${id}`);
}

// Partial update of one experience. RLS restricts the write to the owner; we
// also whitelist columns so only these fields can ever be set from the client.
export async function updateExperience(
  id: string,
  patch: ExperiencePatch,
): Promise<{ error?: string }> {
  const clean: ExperiencePatch = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in patch) clean[key] = patch[key] as never;
  }

  if ("title" in clean) {
    const t = (clean.title ?? "").trim();
    if (!t) return { error: "Title can't be empty." };
    clean.title = t;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("experiences")
    .update(clean)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateExperience(id);
  return {};
}

// Completes the cycle: mark an experience lived, stamp lived_at, and keep an
// optional written reflection.
export async function markLived(
  id: string,
  reflection: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("experiences")
    .update({
      status: "lived",
      lived_at: new Date().toISOString(),
      reflection: reflection.trim() || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateExperience(id);
  return {};
}

// Replace the experience's life areas with the given set. RLS ties both the
// delete and insert to ownership of the parent experience.
export async function setLifeAreas(
  id: string,
  areaIds: string[],
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error: delErr } = await supabase
    .from("experience_life_areas")
    .delete()
    .eq("experience_id", id);
  if (delErr) return { error: delErr.message };

  if (areaIds.length > 0) {
    const { error: insErr } = await supabase
      .from("experience_life_areas")
      .insert(areaIds.map((life_area_id) => ({ experience_id: id, life_area_id })));
    if (insErr) return { error: insErr.message };
  }

  revalidateExperience(id);
  return {};
}

export async function deleteExperience(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("experiences").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}

// Adds an experience with just a title. Status defaults to 'want' in the DB, so
// the new item lands in Want. RLS enforces user_id = auth.uid() on insert.
export async function addExperience(
  title: string,
): Promise<{ error?: string }> {
  const trimmed = title.trim();
  if (!trimmed) return { error: "Enter a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const { error } = await supabase
    .from("experiences")
    .insert({ user_id: user.id, title: trimmed });

  if (error) return { error: error.message };

  revalidatePath("/");
  return {};
}
