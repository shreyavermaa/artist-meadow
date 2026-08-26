# Artist Meadow — Implementation Plan

**Goal:** Build a curated, beautiful directory of Indian (→ global) artists that
people search by region + art form, with artist submissions, Shreya-approval, and
inquire-through-Shreya — in the locked deep-wine botanical-garden look.

**Architecture:** Astro in **hybrid SSR mode** on Cloudflare (via `@astrojs/cloudflare`).
Dynamic routes — Browse, Search, each Artist page, Admin, and the form endpoints —
are **server-rendered on demand from Supabase** at Cloudflare's edge, so a newly
approved artist appears instantly with **no rebuild**, while still shipping full
server-rendered HTML for SEO. Static prerender only where content is truly fixed
(e.g. About). Search = real Supabase queries (Postgres filtering / full-text), so it
scales beyond a handful of artists. Images on Cloudinary.

**Tech Stack:** Astro (hybrid SSR) + `@astrojs/cloudflare`, TypeScript, plain CSS
(design tokens; the botanical CSS/SVG ports directly from the approved mockups),
Supabase JS client, Cloudinary, Cloudflare Pages (Functions runtime).

**Spec:** `E:/my_app/rangmela/docs/superpowers/specs/2026-08-26-rangmela-design.md`
(Rangmela = the working name; the product is now **Artist Meadow**, artistmeadow.com.)

## Global Constraints

- **Free** stack only. No paid services.
- **Name:** Artist Meadow. **Domain:** artistmeadow.com (bought later; not needed until deploy).
- **Look (locked):** homepage = full wine/bordeaux, continuous; working pages = ivory + wine
  mix. Deep wine `#3E1524`→`#160610`, cream `#F4EDE0`, blush `#EBB1C0`, gold `#CBB27E`,
  sage `#A9C39D`. Cormorant Garamond (serif) + Parisienne (script) + Jost (UI). Arched
  image frames, frosted-glass panels, layered leaf canopy (faint blurred behind + crisp
  sage in front, **scattered not mirrored**), gentle falling-leaf animation, hand-drawn
  5-petal forget-me-not blooms (pink/yellow/periwinkle), thin gold hairlines. Reference
  mockups: `E:/my_app/rangmela/.superpowers/brainstorm/**/homepage-scatter-v16.html` and
  `artist-page-v1.html`.
- **No artist phone/WhatsApp/email on public pages** — contact only via Inquire.
- **Curation:** submissions land `status='pending'`; only `status='approved'` render publicly.

---

## Phase 0 — Project setup
- Git repo at `E:/my_app/artistmeadow`, first commit.
- Astro + TypeScript scaffold; folders: `src/pages`, `src/components`, `src/layouts`,
  `src/lib`, `src/styles`, `public`.
- `src/styles/tokens.css` — color/type tokens + fonts (Google Fonts).
- `src/components/Garden.astro` — the reusable canopy (scattered layered leaves + blooms)
  and `FallingLeaves.astro` — the drifting-leaf animation. Ported from mockups.
- `astro.config.mjs`, `.gitignore`, `.env.example` (Supabase + Cloudinary keys), `README.md`.
- **Deliverable:** `npm run dev` serves a blank themed page with the garden canopy.

## Phase 1 — Homepage (the showpiece)
- `src/components/Header.astro`, `Footer.astro` (glass nav, script wordmark).
- `src/pages/index.astro` — full-wine homepage: hero + search + category chips +
  featured artists (Shreya as the sample) + Join band, all under the canopy + falling leaves.
- **Deliverable:** homepage matches the approved mockup.

## Phase 2 — Data layer (Supabase)
- `db/schema.sql` — tables:
  - `artists` (id, slug, name, art_forms text[], city, country, story, hero_image,
    gallery jsonb, links jsonb, price_hint, keywords text[], status, created_at)
  - `inquiries` (id, artist_id, client_name, client_contact, event_details, created_at)
  - `categories` (slug, label), `regions` (city, country) — or derive from artists.
  - RLS: public can `select` where `status='approved'`; public can `insert` into
    `artists` (pending) and `inquiries`; admin (service role) can update/select all.
- `src/lib/supabase.ts` — typed client + `getApprovedArtists()`, `getArtistBySlug()`.
- `db/seed.sql` — Shreya as the first approved artist.
- **Deliverable:** homepage featured section reads real data from Supabase.

## Phase 3 — Browse / Search
- `src/pages/browse.astro` — grid of approved artists; category + region filter chips;
  free-text search island (`src/components/SearchBox` filtering by name/art_forms/city/
  story/keywords). Static list at build + client-side filter.
- **Deliverable:** working browse + search over seeded data.

## Phase 4 — Artist page
- `src/pages/artist/[slug].astro` — `getStaticPaths()` from approved artists; the arched
  hero, story, gallery, link buttons, Inquire button (opens inquiry form). JSON-LD Person.
- **Deliverable:** Shreya's live artist page, badge-free, no phone number.

## Phase 5 — Join (submission)
- `src/pages/join.astro` + submission form island → Cloudinary upload → Supabase insert
  `status='pending'`. Success screen.
- **Deliverable:** a new submission appears in Supabase as pending (not public).

## Phase 6 — Inquiry
- Inquiry form island (modal from artist page) → Supabase `inquiries` insert → email
  Shreya (Supabase Edge Function or a free form-email service). Success screen.
- **Deliverable:** an inquiry is stored + emailed.

## Phase 7 — Admin (directory data)
- `src/pages/admin/*` — Supabase-auth-gated: approval queue (approve/reject = set status)
  and inquiries inbox. Artists appear live immediately (SSR), no rebuild needed.
- **Deliverable:** Shreya can approve an artist and see it go live.

## Phase 7b — Sveltia CMS (site content) — "everything editable"
- All site *copy* lives in editable data files, not hardcoded: `src/data/site.json`
  (hero headline, tagline, search placeholder, category list, Join copy, footer/contact),
  `src/content/pages/about.md`. Homepage + pages read from these.
- `public/admin/config.yml` + `public/admin/index.html` — Sveltia CMS (git backend to the
  GitHub repo), same setup as galleryofshreya (Cloudflare Worker OAuth relay reused).
  Collections: Homepage, Categories, About, Join, Footer/Contact.
- **Two-layer editability:** Sveltia = words/pages (git, rebuild); Supabase admin = the
  living directory (artists/inquiries, dynamic, no rebuild).
- **Deliverable:** Shreya edits the homepage headline in Sveltia → site updates.

## Phase 8 — SEO
- `@astrojs/sitemap`, per-page meta/OG/Twitter, JSON-LD (Person per artist, LocalBusiness),
  `robots.txt`. Titles target "art form + city".
- **Deliverable:** sitemap + rich meta on every page.

## Phase 9 — Deploy
- Push to GitHub `artistmeadow`. Connect Cloudflare Pages (build `npm run build`, output
  `dist`, env vars). Custom domain artistmeadow.com when bought.
- **Deliverable:** live on a *.pages.dev, ready for the domain.

## Build order this session
Phase 0 → Phase 1 (get the beautiful homepage live locally), commit each. Supabase/forms/
admin/deploy follow in later passes (they need account setup with Shreya).
