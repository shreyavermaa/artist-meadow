# Deploying Artist Meadow

Everything is built. To go live, do these once.

## 1. GitHub
Create an empty repo named **artistmeadow** at github.com/new (owner: your account,
public or private, no README). Then (Claude runs):
```
git remote add origin https://github.com/<you>/artistmeadow.git
git push -u origin main
```

## 2. Cloudflare Pages
Workers & Pages → Create → Pages → Connect to Git → pick **artistmeadow**.
Build settings:
- Framework preset: **Astro**
- Build command: **npm run build**
- Build output directory: **dist**
- Environment variables (add all):
  - `PUBLIC_SUPABASE_URL` = https://fmvjzbuxmsojfnwzblrr.supabase.co
  - `PUBLIC_SUPABASE_ANON_KEY` = (your publishable key)
  - `SUPABASE_SERVICE_ROLE_KEY` = (Supabase → Settings → API → service_role secret)
  - `ADMIN_PASSWORD` = (a strong password for /manage)
  - `PUBLIC_CLOUDINARY_CLOUD_NAME` = (your Cloudinary cloud)
  - `PUBLIC_CLOUDINARY_UPLOAD_PRESET` = (unsigned preset, see step 3)
- Deploy. You get a `*.pages.dev` URL.

## 3. Cloudinary (image uploads on Join)
Cloudinary dashboard → Settings → Upload → Add upload preset → **Signing mode: Unsigned**
→ save its name. Put cloud name + preset name in the env vars above.

## 4. Sveltia CMS (edit site words at /admin)
`public/admin/config.yml` `repo:` must match your GitHub repo. The GitHub OAuth app +
worker from galleryofshreya are reused. Visit `/admin`, log in with GitHub, edit, save.

## 5. Domain
Buy **artistmeadow.com**. In Cloudflare Pages project → Custom domains → add it
(and www). If the domain's DNS is on Cloudflare, it's automatic.

## 6. SEO (after domain is live)
Google Search Console → add domain property → verify (Cloudflare auto) → submit
`https://artistmeadow.com/sitemap.xml`.
