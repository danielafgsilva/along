import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateUserForm } from "@/components/create-user-form";
import type { Profile } from "@/types";

type ProfileRow = Pick<Profile, "id" | "email" | "full_name" | "role">;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.app_metadata?.role !== "super_admin") redirect("/");

  // RLS lets a super_admin read every profile.
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .order("created_at", { ascending: true });
  const profiles = (data ?? []) as ProfileRow[];

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pb-[env(safe-area-inset-bottom)] pt-16">
      <header className="flex flex-col gap-1.5">
        <Link href="/" className="text-sm text-muted-foreground">
          ← Back
        </Link>
        <h1 className="font-serif text-3xl tracking-tight">Users</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">
          Add a user
        </h2>
        <CreateUserForm />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">
          {profiles.length} user{profiles.length === 1 ? "" : "s"}
        </h2>
        <ul className="flex flex-col divide-y divide-border">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-base">
                  {p.full_name ?? p.email}
                </span>
                {p.full_name ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {p.email}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {p.role}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
