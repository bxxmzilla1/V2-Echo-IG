/** Max edge in px for “480p” style remote images (saves bandwidth on thumbnails). */
const MAX_EDGE = 480;

/**
 * Rewrites well-known image URLs to ~480px variants when possible.
 * Data URLs and unknown hosts are returned unchanged.
 */
export function getImageUrl480(url: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
  try {
    const u = new URL(url);
    const h = u.hostname;

    if (h === 'picsum.photos' || h.endsWith('.picsum.photos')) {
      const segs = u.pathname.split('/').filter(Boolean);
      if (segs[0] === 'id' && segs.length >= 4) {
        return `${u.protocol}//${h}/id/${segs[1]}/${MAX_EDGE}/${MAX_EDGE}`;
      }
      if (segs[0] === 'seed' && segs.length >= 4) {
        return `${u.protocol}//${h}/seed/${segs[1]}/${MAX_EDGE}/${MAX_EDGE}`;
      }
    }

    if (h.includes('supabase.co') && u.pathname.includes('/storage/v1/object/public/')) {
      const renderPath = u.pathname.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
      u.pathname = renderPath;
      u.search = `?width=${MAX_EDGE}&height=${MAX_EDGE}&resize=cover`;
      return u.toString();
    }
  } catch {
    return url;
  }
  return url;
}
