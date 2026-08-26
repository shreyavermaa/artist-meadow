import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Hybrid: pages are static by default; dynamic routes opt in with
// `export const prerender = false` (Browse, Search, Artist pages, Admin).
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({ imageService: 'passthrough' }),
  site: 'https://artistmeadow.com',
});
