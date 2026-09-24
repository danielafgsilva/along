// Domain types shared across the app. Mirrors the `public.profiles` table
// (see supabase/migrations). When the DB schema grows, `supabase gen types`
// output can live alongside this file.

export type Role = "super_admin" | "user";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null; // ISO date, YYYY-MM-DD
  role: Role;
  onboarding_completed: boolean;
  created_at: string; // ISO timestamp
};

export type ExperienceStatus = "want" | "planned" | "lived";

export type Experience = {
  id: string;
  user_id: string;
  title: string;
  status: ExperienceStatus;
  description: string | null;
  notes: string | null;
  location: string | null;
  occurred_on: string | null; // ISO date, YYYY-MM-DD
  reflection: string | null;
  lived_at: string | null; // ISO timestamp
  created_at: string;
  updated_at: string;
};

export type LifeArea = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
};
