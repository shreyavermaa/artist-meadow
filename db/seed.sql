-- Seed Artist Meadow with Shreya as the first, approved, featured artist.
insert into artists
  (slug, name, art_forms, city, country, story, hero_image, gallery, links, price_hint, keywords, status, featured)
values (
  'shreya',
  'Shreya',
  array['Calligraphy','Engraving','Wedding Signage'],
  'Indore', 'India',
  'I write love letters in ink — place cards, wedding vows, the little details people keep forever. A steady hand, and a soft spot for gold on ivory.',
  null,
  '[]'::jsonb,
  '{"instagram":"galleryofshreya","website":"https://galleryofshreya.com"}'::jsonb,
  'On request',
  array['calligraphy','engraving','wedding signage','hand lettering','indore','custom'],
  'approved',
  true
)
on conflict (slug) do nothing;
