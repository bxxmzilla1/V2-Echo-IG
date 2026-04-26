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

/** Extracts storage object path (e.g. "slug/file.png") from a public or signed object URL. */
function objectPathFromMediaUrl(url: string): string | null {
  if (!url || url.startsWith('data:') || !url.includes(BUCKET)) return null;
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split('?')[0].split('#')[0];
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function collectStorageObjectPathsFromProfile(profile: ProfileData): string[] {
  const s = new Set<string>();
  const add = (u: string) => {
    const p = objectPathFromMediaUrl(u);
    if (p) s.add(p);
  };
  add(profile.profilePic);
  for (const h of profile.highlights) add(h.imageUrl);
  for (const p of profile.posts) add(p.imageUrl);
  for (const r of profile.reels) add(r.imageUrl);
  return [...s];
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** DFS: delete all files, recurse into prefix “folders” (metadata null), bounded passes per folder to clear >1k files. */
async function removeAllObjectsUnderPath(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  pathPrefix: string
): Promise<void> {
  for (let pass = 0; pass < 100; pass++) {
    const { data: items, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list(pathPrefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
    if (listErr) {
      console.warn('storage list', pathPrefix, listErr);
      return;
    }
    if (!items?.length) return;

    const filePaths: string[] = [];
    const subDirs: string[] = [];
    for (const item of items) {
      const objectPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;
      if (item.metadata != null) filePaths.push(objectPath);
      else subDirs.push(objectPath);
    }
    for (const batch of chunkArray(filePaths, 1000)) {
      if (batch.length) {
        const { error: rm } = await supabase.storage.from(BUCKET).remove(batch);
        if (rm) console.warn('storage remove batch', pathPrefix, rm);
      }
    }
    for (const d of subDirs) {
      await removeAllObjectsUnderPath(supabase, d);
    }
  }
}

/** Remove a published page: delete DB row (verified), then all media in profile + full folder cleanup. */
export async function deletePublishedProfile(rawSlug: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  const slug = sanitizeSlug(rawSlug);
  if (!slug) throw new Error('Invalid slug.');

  const { data: before, error: fetchErr } = await supabase
    .from('published_profiles')
    .select('profile_data, slug')
    .eq('slug', slug)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!before)
    throw new Error(
      `No page found for /${slug}. It may have already been deleted.`
    );

  const profile = before.profile_data as ProfileData;
  const pathsFromJson = collectStorageObjectPathsFromProfile(profile);

  const { data: removedRows, error: delErr } = await supabase
    .from('published_profiles')
    .delete()
    .eq('slug', slug)
    .select('slug');
  if (delErr) throw new Error(delErr.message);
  if (!removedRows?.length) {
    throw new Error(
      'Delete was blocked. In Supabase → SQL, ensure policy "published_delete" exists (see supabase/schema.sql or 002_add_delete_policies.sql).'
    );
  }

  for (const batch of chunkArray(pathsFromJson, 1000)) {
    if (!batch.length) continue;
    const { error: rm } = await supabase.storage.from(BUCKET).remove(batch);
    if (rm) console.warn('storage remove (from profile json)', rm);
  }

  try {
    await removeAllObjectsUnderPath(supabase, slug);
  } catch (e) {
    console.warn('storage folder cleanup', slug, e);
  }
}
