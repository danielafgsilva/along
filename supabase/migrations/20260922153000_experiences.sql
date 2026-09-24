-- Core content model: experiences (want | planned | lived), the life-area
-- taxonomy, and their many-to-many link. Experiences are private per owner.

-- Generic trigger helper to keep updated_at fresh.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- === life_areas ===
-- Global, curated taxonomy (the prototype's categories).
create table public.life_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.life_areas enable row level security;

-- Any signed-in user can read the taxonomy.
create policy "life_areas_select"
  on public.life_areas for select
  to authenticated
  using (true);

-- Only a super_admin can manage it (for a future categories admin UI).
create policy "life_areas_write_super_admin"
  on public.life_areas for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin');

insert into public.life_areas (slug, name, sort_order) values
  ('travel', 'Travel', 1),
  ('creative', 'Creative', 2),
  ('health', 'Health', 3),
  ('music', 'Music', 4),
  ('life', 'Life', 5)
on conflict (slug) do nothing;

-- === experiences ===
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'want' check (status in ('want', 'planned', 'lived')),
  notes text,
  location text,
  occurred_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Drives the Home sections (Want / Planned / Lived) for a user.
create index experiences_user_status_idx
  on public.experiences (user_id, status);

create trigger experiences_set_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

alter table public.experiences enable row level security;

-- Strictly private to the owner — no super_admin override.
create policy "experiences_select_own"
  on public.experiences for select
  to authenticated
  using (user_id = auth.uid());

create policy "experiences_insert_own"
  on public.experiences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "experiences_update_own"
  on public.experiences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "experiences_delete_own"
  on public.experiences for delete
  to authenticated
  using (user_id = auth.uid());

-- === experience_life_areas (N:N) ===
create table public.experience_life_areas (
  experience_id uuid not null references public.experiences (id) on delete cascade,
  life_area_id uuid not null references public.life_areas (id) on delete cascade,
  primary key (experience_id, life_area_id)
);

create index experience_life_areas_life_area_idx
  on public.experience_life_areas (life_area_id);

alter table public.experience_life_areas enable row level security;

-- Access is inherited from ownership of the parent experience.
create policy "experience_life_areas_select_own"
  on public.experience_life_areas for select
  to authenticated
  using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.user_id = auth.uid()
    )
  );

create policy "experience_life_areas_insert_own"
  on public.experience_life_areas for insert
  to authenticated
  with check (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.user_id = auth.uid()
    )
  );

create policy "experience_life_areas_delete_own"
  on public.experience_life_areas for delete
  to authenticated
  using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.user_id = auth.uid()
    )
  );
