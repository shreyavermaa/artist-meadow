import type { APIRoute } from 'astro';

export const prerender = false;

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

function kebab(s: string): string {
  return (
    s.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50) || 'artist'
  );
}

async function insert(row: Record<string, unknown>): Promise<Response> {
  return fetch(`${url}/rest/v1/artists`, {
    method: 'POST',
    headers: {
      apikey: key as string,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!url || !key) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 500 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad json' }), { status: 400 });
  }
  if (!body?.name || !Array.isArray(body.art_forms) || body.art_forms.length === 0) {
    return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400 });
  }

  const links = Object.fromEntries(
    Object.entries(body.links ?? {}).filter(([, v]) => v && String(v).trim())
  );
  const base = kebab(String(body.name));
  const row: Record<string, unknown> = {
    slug: base,
    name: String(body.name).slice(0, 120),
    art_forms: body.art_forms,
    keywords: Array.isArray(body.keywords) ? body.keywords : [],
    city: body.city || null,
    country: body.country || 'India',
    story: body.story || null,
    hero_image: body.hero_image || null,
    gallery: Array.isArray(body.gallery) ? body.gallery : [],
    links,
    price_hint: body.price_hint || null,
    status: 'pending',
  };

  let res = await insert(row);
  if (!res.ok) {
    // Likely a slug clash — retry once with a short suffix.
    row.slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    res = await insert(row);
  }
  if (!res.ok) {
    const detail = await res.text();
    return new Response(JSON.stringify({ error: 'insert failed', detail }), { status: 500 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};