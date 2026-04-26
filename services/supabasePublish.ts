import type { ProfileData } from '../types';
import { getSupabase } from '../lib/supabase';

const BUCKET = 'profile-media';
const RESERVED_SLUGS = new Set(['published', 'api', 'assets', 'sw', 'workbox']);

export function sanitizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isAllowedSlug(s: string): boolean {
  if (!s || s.length < 2 || s.length > 64) return false;
  if (RESERVED_SLUGS.has(s)) return false;
  return /^([a-z0-9]{2}|[a-z0-9][a-z0-9_-]*[a-z0-9])$/.test(s);
}

function extFromDataUrl(dataUrl: string): string {
  const m = /^data:image\/(\w+);/.exec(dataUrl);
  if (!m) return 'bin';
  const t = m[1].toLowerCase();
  if (t === 'jpeg') return 'jpg';
  return t;
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [head, b64] = dataUrl.split(',');
    if (!b64) return null;
    const mime = /data:([^;]+)/.exec(head)?.[1] || 'application/octet-stream';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

async function uploadDataUrlIfNeeded(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  slug: string,
  label: string,
  url: string
): Promise<string> {
  if (!url.startsWith('data:')) return url;
  const blob = dataUrlToBlob(url);
  if (!blob) return url;
  const ext = extFromDataUrl(url);
  const path = `${slug}/${label}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || `image/${ext}`,
  });
  if (error) {
    console.error('supabase upload', error);
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProfileMediaUrls(
  slug: string,
  profile: ProfileData
): Promise<ProfileData> {
  const supabase = getSupabase();
  if (!supabase) return profile;

  const p = JSON.parse(JSON.stringify(profile)) as ProfileData;

  p.profilePic = await uploadDataUrlIfNeeded(supabase, slug, 'profile', p.profilePic);

  for (let i = 0; i < p.highlights.length; i++) {
    const h = p.highlights[i];
    h.imageUrl = await uploadDataUrlIfNeeded(supabase, slug, `hl-${h.id}`, h.imageUrl);
  }
  for (let i = 0; i < p.posts.length; i++) {
    const post = p.posts[i];
    post.imageUrl = await uploadDataUrlIfNeeded(supabase, slug, `post-${post.id}`, post.imageUrl);
  }
  for (let i = 0; i < p.reels.length; i++) {
    const r = p.reels[i];
    r.imageUrl = await uploadDataUrlIfNeeded(supabase, slug, `reel-${r.id}`, r.imageUrl);
  }

  return p;
}

export async function savePublishedProfile(slug: string, profile: ProfileData): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  if (!isAllowedSlug(slug)) throw new Error('Invalid path. Use 2–64 chars: letters, numbers, - and _ only.');

  const withMedia = await uploadProfileMediaUrls(slug, profile);

  const { error } = await supabase.from('published_profiles').upsert(
    {
      slug,
      profile_data: withMedia,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slug' }
  );
  if (error) throw new Error(error.message);
}

export type PublishedListRow = { slug: string; updated_at: string };

export async function listPublishedProfiles(): Promise<PublishedListRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('published_profiles')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []) as PublishedListRow[];
}

export async function getPublishedProfileBySlug(slug: string): Promise<ProfileData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('published_profiles')
    .select('profile_data')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data?.profile_data) return null;
  return data.profile_data as ProfileData;
}
