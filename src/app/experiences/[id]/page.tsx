import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExperienceDetail } from "@/components/experience-detail";
import type { ExperienceStatus } from "@/types";

type DetailExperience = {
  id: string;
  title: string;
  status: ExperienceStatus;
  description: string | null;
  notes: string | null;
  location: string | null;
  occurred_on: string | null;
  reflection: string | null;
  lived_at: string | null;
  experience_life_areas: { life_area_id: string }[];
};

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS returns the row only if it belongs to the signed-in user.
  const { data } = await supabase
    .from("experiences")
    .select(
      "id, title, status, description, notes, location, occurred_on, reflection, lived_at, experience_life_areas(life_area_id)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const experience = data as unknown as DetailExperience;

  const { data: areas } = await supabase
    .from("life_areas")
    .select("id, name")
    .order("sort_order");

  return (
    <ExperienceDetail
      experience={{
        id: experience.id,
        title: experience.title,
        status: experience.status,
        description: experience.description,
        notes: experience.notes,
        location: experience.location,
        occurred_on: experience.occurred_on,
        reflection: experience.reflection,
        lived_at: experience.lived_at,
      }}
      allAreas={areas ?? []}
      selectedIds={experience.experience_life_areas.map((r) => r.life_area_id)}
    />
  );
}
