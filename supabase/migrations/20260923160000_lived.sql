-- Completing the cycle: when an experience is lived we stamp lived_at and can
-- keep a written reflection. (Photos come later.)
alter table public.experiences
  add column lived_at timestamptz,
  add column reflection text;
