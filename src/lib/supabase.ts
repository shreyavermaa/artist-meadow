// Thin Supabase REST (PostgREST) client via fetch — no realtime/WebSocket,
// so it runs identically on Node (dev) and Cloudflare (prod).

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** True once real Supabase keys are configured. */
export const supabaseReady = Boolean(url && key);

const headers = () => ({
  apikey: key as string,
  Authorization: `Bearer ${key}`,
});

async function restGet(query: string): Promise<any[]> {
  if (!supabaseReady) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${query}`, { headers: headers() });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

async function restPost(table: string, body: unknown): Promise<{ ok: boolean }> {
  if (!supabaseReady) return { ok: false };
  try {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export interface Artist {
  id?: string;
  slug: string;
  name: string;
  art_forms: string[];
  city: string | null;
  country: string | null;
  story: string | null;
  hero_image: string | null;
  gallery: string[];
  links: Record<string, string>;
  price_hint: string | null;
  keywords: string[];
  status?: string;
  featured?: boolean;
}

export interface ArtistQuery {
  q?: string;
  category?: string;
  city?: string;
}

/** Sample data so the site works before Supabase keys are added. */
export const sampleArtists: Artist[] = [
  {
    slug: 'shreya', name: 'Shreya', art_forms: ['Calligraphy', 'Engraving'],
    city: 'Indore', country: 'India',
    story: 'I write love letters in ink — place cards, wedding vows, the little details people keep forever.',
    hero_image: null, gallery: [],
    links: { instagram: 'galleryofshreya', website: 'https://galleryofshreya.com' },
    price_hint: 'On request', keywords: ['calligraphy', 'engraving', 'wedding', 'indore'],
    status: 'approved', featured: true,
  },
  {
    slug: 'aarohi-mehta', name: 'Aarohi Mehta', art_forms: ['Mehndi & Henna'],
    city: 'Jaipur', country: 'India',
    story: 'Bridal mehndi with a modern, airy line — florals, jaali, and a little gold.',
    hero_image: null, gallery: [], links: { instagram: 'aarohi.henna' },
    price_hint: 'From ₹8,000', keywords: ['mehndi', 'henna', 'bridal', 'jaipur'],
    status: 'approved', featured: true,
  },
  {
    slug: 'kabir-rao', name: 'Kabir Rao', art_forms: ['Engraving'],
    city: 'Mumbai', country: 'India',
    story: 'Live glass and metal engraving for gifting stations at events.',
    hero_image: null, gallery: [], links: { instagram: 'kabir.engraves' },
    price_hint: 'From ₹12,000', keywords: ['engraving', 'live', 'events', 'mumbai'],
    status: 'approved', featured: true,
  },
];

function filterSample(list: Artist[], opts?: ArtistQuery): Artist[] {
  let out = list;
  if (opts?.category) out = out.filter((a) => a.art_forms.includes(opts.category!));
  if (opts?.city) out = out.filter((a) => (a.city ?? '').toLowerCase().includes(opts.city!.toLowerCase()));
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    out = out.filter((a) =>
      [a.name, a.city ?? '', a.story ?? '', ...a.art_forms, ...a.keywords]
        .join(' ').toLowerCase().includes(q)
    );
  }
  return out;
}

const enc = encodeURIComponent;

export async function getApprovedArtists(opts?: ArtistQuery): Promise<Artist[]> {
  if (!supabaseReady) return filterSample(sampleArtists, opts);
  const parts = ['status=eq.approved', 'select=*', 'order=featured.desc,created_at.desc'];
  if (opts?.category) parts.push(`art_forms=cs.${enc(`{"${opts.category}"}`)}`);
  if (opts?.city) parts.push(`city=ilike.*${enc(opts.city)}*`);
  if (opts?.q) {
    const q = enc(opts.q);
    parts.push(`or=(name.ilike.*${q}*,city.ilike.*${q}*,story.ilike.*${q}*)`);
  }
  return (await restGet(`artists?${parts.join('&')}`)) as Artist[];
}

export async function getFeaturedArtists(limit = 3): Promise<Artist[]> {
  if (!supabaseReady) return sampleArtists.slice(0, limit);
  return (await restGet(
    `artists?status=eq.approved&select=*&order=featured.desc,created_at.desc&limit=${limit}`
  )) as Artist[];
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  if (!supabaseReady) return sampleArtists.find((a) => a.slug === slug) ?? null;
  const rows = (await restGet(
    `artists?slug=eq.${enc(slug)}&status=eq.approved&select=*&limit=1`
  )) as Artist[];
  return rows[0] ?? null;
}

/** Create an inquiry (client -> Shreya). Used by the inquiry form. */
export async function createInquiry(payload: {
  artist_slug: string;
  client_name: string;
  client_contact: string;
  event_details?: string;
}): Promise<{ ok: boolean }> {
  return restPost('inquiries', payload);
}

/** Submit a new artist (always lands as pending for Shreya to approve). */
export async function submitArtist(payload: Partial<Artist>): Promise<{ ok: boolean }> {
  return restPost('artists', { ...payload, status: 'pending' });
}

/** Deterministic wine gradient for cards without a hero image yet. */
const GRADIENTS = [
  'linear-gradient(160deg,#6E2A3E,#2A0C16)',
  'linear-gradient(160deg,#8a4354,#3E1220)',
  'linear-gradient(160deg,#5c2f3d,#180710)',
  'linear-gradient(160deg,#7B2E44,#3E1220)',
  'linear-gradient(160deg,#9c4f60,#4E1A2B)',
];
export function artistGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}
