-- Profiles: one row per auth user, holding the app role.
-- The role is also stored in auth.users.app_metadata (set by the admin API and
-- the seed script) so it appears in the JWT; RLS reads it from the JWT and
-- never has to query this table (avoids recursive policies).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  date_of_birth date,
  role text not null default 'user' check (role in ('super_admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read: a user sees their own profile; a super_admin sees everyone.
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
  );

-- Update: only a super_admin (e.g. to change a role). No self-service yet.
create policy "profiles_update_super_admin"
  on public.profiles for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin');

-- Inserts and deletes go through the trigger below and the admin API (service
-- role), both of which bypass RLS. No client-facing insert/delete policy — on
-- purpose, so users can never be created from the browser.

-- Auto-create a profile whenever an auth user is created.
-- full_name / date_of_birth come from user_metadata (set at register time);
-- role comes from app_metadata (set by the seed / admin create-user flow), else
-- 'user'. Self-registration never sets app_metadata, so it can't grant a role.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, date_of_birth, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    coalesce(new.raw_app_meta_data ->> 'role', 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
