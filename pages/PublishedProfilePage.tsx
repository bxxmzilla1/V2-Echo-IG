import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReadOnlyProfileView } from '../components/ReadOnlyProfileView';
import { IgLoadingLogo } from '../components/IgLoadingLogo';
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
    return <IgLoadingLogo />;
  }

  if (profile === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 px-4 text-zinc-100">
        <p className="text-lg text-zinc-200">No page at /{slug}</p>
        <Link to="/" className="font-medium text-ig_blue hover:underline">
          Back to editor
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 pb-10 pt-0 text-zinc-100 md:pt-10">
      <ReadOnlyProfileView
        profile={profile}
        viewerGeo={viewerGeo}
        onBack={() => navigate('/')}
      />
      <p className="mt-4 text-xs text-zinc-600">
        <Link to="/published" className="text-zinc-500 transition hover:text-zinc-400">
          All published pages
        </Link>
      </p>
    </div>
  );
}
