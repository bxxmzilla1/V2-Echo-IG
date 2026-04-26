/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_IPINFO_TOKEN?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Optional. Full URL to the IG mark in Supabase Storage (see scripts/upload-ig-logo.mjs). */
  readonly VITE_IG_LOGO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
