# Artist Meadow

A curated meadow of artists (calligraphy, mehndi, engraving, muralists, live portraits,
floral & more) for weddings, events and custom work. Searchable by region and art form.
A Gallery of Shreya project.

## Stack
- **Astro** (hybrid SSR) on **Cloudflare Pages** — dynamic pages render live from the DB.
- **Supabase** (Postgres) — artists, inquiries; the living directory + admin.
- **Cloudinary** — artist images.
- **Sveltia CMS** — edit site copy/pages (git-based, no-code).

## Develop
```bash
npm install
npm run dev      # http://localhost:4321
```
Copy `.env.example` to `.env` and fill in keys before the data features work.

## Structure
- `src/pages` — routes (index, browse, artist/[slug], join, about, admin)
- `src/components` — Garden, FallingLeaves, Header, Footer, GardenDefs …
- `src/styles/global.css` — the deep-wine botanical design system
- `src/data/site.json` — editable homepage/site copy (CMS-backed)
- `db/` — Supabase schema + seed
- `docs/plan.md` — the build plan

## Design
Deep-wine botanical garden: full-wine homepage, ivory+wine working pages, layered
scattered leaf canopy, drifting leaves, forget-me-not blooms, arched frames, glass panels.
