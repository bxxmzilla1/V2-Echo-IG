export type ViewerGeo = {
  city: string;
  country: string;
};

function expandRegionCode(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return iso2;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso2.toUpperCase()) || iso2;
  } catch {
    return iso2;
  }
}

function parseFromLookupPayload(data: Record<string, unknown>): ViewerGeo | null {
  const geo = data.geo as { city?: string; country?: string } | undefined;
  if (geo && (geo.city != null || geo.country != null)) {
    return {
      city: geo.city != null ? String(geo.city) : '',
      country: geo.country != null ? String(geo.country) : '',
    };
  }
  return null;
}

function parseFromFlat(data: Record<string, unknown>): ViewerGeo {
  const city = (data.city as string) || '';
  const raw = (data.country as string) || '';
  const countryName = (data.country_name as string) || (raw && raw.length === 2 ? expandRegionCode(raw) : raw);
  return { city, country: countryName };
}

/**
 * Fetches the viewer's city and country from IPinfo. Use VITE_IPINFO_TOKEN in .env
 * (same token for local dev; set in Vercel env for production).
 * See: https://ipinfo.io/developers
 */
export async function fetchViewerGeo(): Promise<ViewerGeo | null> {
  const token = import.meta.env.VITE_IPINFO_TOKEN as string | undefined;
  if (!token || !token.trim()) {
    return null;
  }
  const t = encodeURIComponent(token.trim());

  try {
    const who = await fetch(`https://ipinfo.io/json?token=${t}`);
    if (!who.ok) return null;
    const base = (await who.json()) as Record<string, unknown>;
    const ip = typeof base.ip === 'string' ? base.ip : null;

    if (ip) {
      const lookup = await fetch(
        `https://api.ipinfo.io/lookup/${encodeURIComponent(ip)}?token=${t}`
      );
      if (lookup.ok) {
        const d = (await lookup.json()) as Record<string, unknown>;
        const fromGeo = parseFromLookupPayload(d);
        if (fromGeo) return fromGeo;
      }
    }

    return parseFromFlat(base);
  } catch (e) {
    console.error('ipinfo: failed to load viewer location', e);
    return null;
  }
}

/** Replaces (country) and (city) in bio text. Only for the bio field. */
export function applyGeoPlaceholders(text: string, geo: ViewerGeo | null): string {
  if (!geo) return text;
  return text
    .split('(country)').join(geo.country)
    .split('(city)').join(geo.city);
}
