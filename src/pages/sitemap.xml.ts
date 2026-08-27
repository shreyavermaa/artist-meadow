import type { APIRoute } from 'astro';
import { getApprovedArtists } from '../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://artistmeadow.com').replace(/\/$/, '');
  const staticPaths = ['/', '/browse', '/join', '/about'];
  const artists = await getApprovedArtists();
  const urls = [
    ...staticPaths.map((p) => base + p),
    ...artists.map((a) => `${base}/artist/${a.slug}`),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    `\n</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
