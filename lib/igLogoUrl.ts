/** Public asset in `public/ig-logo.jpg`; override with a CDN URL (e.g. Supabase). */
const FALLBACK = '/ig-logo.jpg';

export function getIgLogoSrc(): string {
  const u = (import.meta.env.VITE_IG_LOGO_URL as string | undefined)?.trim();
  if (u) return u;
  return FALLBACK;
}
