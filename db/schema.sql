-- Artist Meadow — database schema (run in Supabase SQL Editor)

-- ============ ARTISTS ============
create table if not exists artists (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  art_forms   text[] not null default '{}',
  city        text,
  country     text default 'India',
  story       text,
  hero_image  text,                          -- Cloudinary URL
  gallery     jsonb not null default '[]'::jsonb,   -- array of image URLs
  links       jsonb not null default '{}'::jsonb,   -- {instagram, website, pinterest, youtube}
  price_hint  text,
  keywords    text[] not null default '{}',
  status      text not null default 'pending',      -- pending | approved | rejected
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists artists_status_idx on artists(status);
create index if not exists artists_city_idx   on artists(city);

-- ============ INQUIRIES (client -> Shreya) ============
create table if not exists inquiries (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid references artists(id) on delete set null,
  artist_slug    text,
  client_name    text not null,
  client_contact text not null,
  event_details  text,
  created_at     timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============
alter table artists   enable row level security;
alter table inquiries enable row level security;

-- Public may read ONLY approved artists.
drop policy if exists "read approved artists" on artists;
create policy "read approved artists" on artists
  for select using (status = 'approved');

-- Anyone may submit an artist, but it can only land as 'pending'.
drop policy if exists "submit pending artist" on artists;
create policy "submit pending artist" on artists
  for insert with check (status = 'pending');

-- Anyone may create an inquiry. Nobody public may read inquiries
-- (admin uses the service_role key, which bypasses RLS).
drop policy if exists "create inquiry" on inquiries;
create policy "create inquiry" on inquiries
  for insert with check (true);

-- Table privileges for the public (anon) + logged-in roles.
grant select, insert on artists   to anon, authenticated;
grant insert          on inquiries to anon, authenticated;
