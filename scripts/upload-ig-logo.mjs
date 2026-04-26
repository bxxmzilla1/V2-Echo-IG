/**
 * One-time: uploads public/ig-logo.jpg to Supabase Storage (profile-media/app-assets/ig-logo.jpg).
 * Run: node scripts/upload-ig-logo.mjs
 * Requires VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env or .env.local
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadLocalEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = join(root, name);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

loadLocalEnv();

const url = (process.env.VITE_SUPABASE_URL || '').trim();
const key = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
const BUCKET = 'profile-media';
const PATH = 'app-assets/ig-logo.jpg';
const filePath = join(root, 'public', 'ig-logo.jpg');

if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}
if (!existsSync(filePath)) {
  console.error('Missing', filePath);
  process.exit(1);
}

const file = readFileSync(filePath);
const supabase = createClient(url, key);
const { error: uploadError } = await supabase.storage
  .from(BUCKET)
  .upload(PATH, file, { contentType: 'image/jpeg', upsert: true });

if (uploadError) {
  console.error('Upload failed:', uploadError.message);
  process.exit(1);
}

const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(PATH);
const publicUrl = pub?.publicUrl || `${url}/storage/v1/object/public/${BUCKET}/${PATH}`;

console.log('Uploaded:', PATH);
console.log('Add to .env and Vercel:');
console.log(`VITE_IG_LOGO_URL=${publicUrl}`);
