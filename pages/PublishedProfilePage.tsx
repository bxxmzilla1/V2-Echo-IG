import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReadOnlyProfileView } from '../components/ReadOnlyProfileView';
import { getPublishedProfileBySlug } from '../services/supabasePublish';
import { fetchViewerGeo, type ViewerGeo } from '../services/ipinfoService';
import { ProfileData } from '../types';

export function PublishedProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null | undefined>(undefined);
  const [viewerGeo, setViewerGeo] = useState<ViewerGeo | null>(null);

  useEffect(() => {
    let a = true;
    fetchViewerGeo().then((g) => {
      if (a) setViewerGeo(g);
    });
    return () => {
      a = false;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setProfile(null);
      return;
    }
    let a = true;
    getPublishedProfileBySlug(slug).then((p) => {
      if (a) setProfile(p ?? null);
    });
    return () => {
      a = false;
    };
  }, [slug]);

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg">No page at /{slug}</p>
        <Link to="/" className="text-ig_blue underline">
          Back to editor
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center pt-0 md:pt-10 pb-10">
      <ReadOnlyProfileView
        profile={profile}
        viewerGeo={viewerGeo}
        onBack={() => navigate('/')}
      />
      <p className="text-xs text-gray-600 mt-4">
        <Link to="/published" className="text-gray-500 hover:text-gray-400">
          All published pages
        </Link>
      </p>
    </div>
  );
}
