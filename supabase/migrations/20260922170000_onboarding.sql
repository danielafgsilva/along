-- First-run onboarding flag. Defaults to false so every existing and new
-- profile sees the intro once; set true when they finish or skip it.
alter table public.profiles
  add column onboarding_completed boolean not null default false;
