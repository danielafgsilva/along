-- Canonical Life Areas taxonomy.
insert into public.life_areas (slug, name, sort_order) values
  ('explore', 'Explore', 1),
  ('together', 'Together', 2),
  ('self', 'Self', 3),
  ('grow', 'Grow', 4),
  ('health', 'Health', 5),
  ('work', 'Work', 6),
  ('create', 'Create', 7)
on conflict (slug) do update
  set name = excluded.name, sort_order = excluded.sort_order;

-- Remap links from the old placeholder areas to the canonical set...
insert into public.experience_life_areas (experience_id, life_area_id)
select ela.experience_id, new_area.id
from public.experience_life_areas ela
join public.life_areas old_area on old_area.id = ela.life_area_id
join public.life_areas new_area on new_area.slug = case old_area.slug
  when 'travel' then 'explore'
  when 'creative' then 'create'
  when 'music' then 'create'
  when 'life' then 'self'
end
where old_area.slug in ('travel', 'creative', 'music', 'life')
on conflict do nothing;

-- ...then drop the old areas (cascades any remaining links).
delete from public.life_areas where slug in ('travel', 'creative', 'music', 'life');
