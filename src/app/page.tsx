import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { AddExperience } from "@/components/add-experience";
import { HomeExperiences } from "@/components/home-experiences";
import type { ExperienceStatus } from "@/types";

type RawRow = {
  id: string;
  title: string;
  status: ExperienceStatus;
  location: string | null;
  experience_life_areas: { life_areas: { slug: string; name: string } | null }[];
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // First entry after auth → run onboarding once.
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (profile && !profile.onboarding_completed) redirect("/onboarding");

  const isSuperAdmin = user?.app_metadata?.role === "super_admin";

  // All of this user's items (RLS-scoped); filtering happens client-side.
  const { data } = await supabase
    .from("experiences")
    .select(
      "id, title, status, location, experience_life_areas(life_areas(slug, name))",
    )
    .order("created_at", { ascending: true });

  const raw = (data ?? []) as unknown as RawRow[];
  const items = raw.map((e) => ({
    id: e.id,
    title: e.title,
    status: e.status,
    location: e.location,
    areas: e.experience_life_areas
      .map((r) => r.life_areas)
      .filter((a): a is { slug: string; name: string } => a !== null),
  }));

  const { data: areas } = await supabase
    .from("life_areas")
    .select("slug, name")
    .order("sort_order");

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-16">
      <header>
        <h1 className="font-serif text-4xl leading-tight tracking-tight">
          The life you want to live
        </h1>
      </header>

      <HomeExperiences items={items} areas={areas ?? []} />

      <footer className="mt-auto flex items-center justify-between pt-6 text-sm text-muted-foreground">
        {isSuperAdmin ? (
          <Link href="/admin/users" className="underline">
            Manage users
          </Link>
        ) : (
          <span />
        )}
        <form action={signOut}>
          <button type="submit" className="underline">
            Sign out
          </button>
        </form>
      </footer>

      <AddExperience />
    </main>
  );
}
