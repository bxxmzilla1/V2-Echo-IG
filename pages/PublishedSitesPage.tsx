import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublishedProfiles, type PublishedListRow } from '../services/supabasePublish';
import { getSupabase } from '../lib/supabase';

export function PublishedSitesPage() {
  const [rows, setRows] = useState<PublishedListRow[] | null>(null);

  useEffect(() => {
    if (!getSupabase()) {
      setRows([]);
      return;
    }
    listPublishedProfiles().then(setRows);
  }, []);

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
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.slug}>
              <Link
                to={`/${r.slug}`}
                className="block rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 hover:border-gray-600 transition-colors"
              >
                <span className="text-ig_link font-mono">/{r.slug}</span>
                <span className="block text-xs text-gray-500 mt-1">
                  Updated {new Date(r.updated_at).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
