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
    if (!confirm(`Delete the published page /${slug}? This removes the live page and its stored images for that path.`)) {
      return;
    }
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!getSupabase()) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-center text-gray-300">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to list published pages.</p>
        <Link to="/" className="text-ig_blue">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Published pages</h1>
        <Link to="/" className="text-sm text-ig_blue">
          Editor
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-gray-500">Nothing published yet. Publish from the home screen.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const busy = deletingSlug === r.slug;
            return (
              <li
                key={r.slug}
                className="flex gap-2 rounded-lg border border-gray-800 bg-gray-900/50 p-3 items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ig_link font-mono truncate">/{r.slug}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Updated {new Date(r.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/${r.slug}`}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                    title="View"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/?edit=${encodeURIComponent(r.slug)}`}
                    className="p-2 text-gray-400 hover:text-ig_blue rounded-lg hover:bg-white/10"
                    title="Edit in app"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.slug)}
                    disabled={busy}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 disabled:opacity-40"
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
