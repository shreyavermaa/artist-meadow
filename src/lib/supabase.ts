import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** True once real Supabase keys are configured in .env. */
export const supabaseReady = Boolean(url && anon);

export const supabase: SupabaseClient | null = supabaseReady
  ? createClient(url!, anon!)
  : null;

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

/** Sample data so the site works beautifully before Supabase keys are added. */
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

/** All approved artists, optionally filtered by search/category/city. */
export async function getApprovedArtists(opts?: ArtistQuery): Promise<Artist[]> {
  if (!supabase) return filterSample(sampleArtists, opts);
  let query = supabase
    .from('artists').select('*').eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (opts?.category) query = query.contains('art_forms', [opts.category]);
  if (opts?.city) query = query.ilike('city', `%${opts.city}%`);
  if (opts?.q) query = query.or(
    `name.ilike.%${opts.q}%,city.ilike.%${opts.q}%,story.ilike.%${opts.q}%`
  );
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Artist[];
}

export async function getFeaturedArtists(limit = 3): Promise<Artist[]> {
  if (!supabase) return sampleArtists.slice(0, limit);
  const { data } = await supabase
    .from('artists').select('*').eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as Artist[]) ?? [];
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  if (!supabase) return sampleArtists.find((a) => a.slug === slug) ?? null;
  const { data } = await supabase
    .from('artists').select('*').eq('slug', slug).eq('status', 'approved').maybeSingle();
  return (data as Artist) ?? null;
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
