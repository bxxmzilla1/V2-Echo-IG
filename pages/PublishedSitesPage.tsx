import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import {
  listPublishedProfiles,
  deletePublishedProfile,
  type PublishedListRow,
} from '../services/supabasePublish';
import { getSupabase } from '../lib/supabase';

export function PublishedSitesPage() {
  const [rows, setRows] = useState<PublishedListRow[] | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!getSupabase()) {
      setRows([]);
      return;
    }
    listPublishedProfiles().then(setRows);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);
    try {
      await deletePublishedProfile(slug);
      await listPublishedProfiles().then(setRows);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed. Check Supabase RLS (published_delete + storage delete).');
    } finally {
      setDeletingSlug(null);
    }
  };

  if (rows === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!getSupabase()) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 px-4 text-zinc-100">
        <p className="max-w-md text-center text-zinc-400">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to list published pages.</p>
        <Link to="/" className="font-medium text-ig_blue hover:underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Published pages</h1>
        <Link
          to="/"
          className="rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-sm font-medium text-sky-400 transition hover:bg-zinc-800"
        >
          Editor
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-zinc-500">Nothing published yet. Publish from the home screen.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const busy = deletingSlug === r.slug;
            return (
              <li
                key={r.slug}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 shadow-inner backdrop-blur-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-ig_link">/{r.slug}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Updated {new Date(r.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Link
                    to={`/${r.slug}`}
                    className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    title="View"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/?edit=${encodeURIComponent(r.slug)}`}
                    className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-white/10 hover:text-ig_blue"
                    title="Edit in app"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.slug)}
                    disabled={busy}
                    className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                    title="Delete"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
