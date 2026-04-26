import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Grid,
  Clapperboard,
  Pin,
  Play,
  RefreshCw,
  Plus,
  X,
  Globe,
  UploadCloud
} from 'lucide-react';
import { INITIAL_PROFILE, ProfileData, Highlight, Reel, Post } from '../types';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { fetchViewerGeo, applyGeoPlaceholders, type ViewerGeo } from '../services/ipinfoService';
import { ReelsIcon, TaggedIcon, VerificationIcon } from '../components/ig/ProfileIcons';
import {
  savePublishedProfile,
  sanitizeSlug,
  isAllowedSlug,
  getPublishedProfileBySlug,
} from '../services/supabasePublish';
import { getSupabase } from '../lib/supabase';
import { APP_NAME } from '../lib/appName';

export function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('reels');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [viewerGeo, setViewerGeo] = useState<ViewerGeo | null>(null);
  const [publishSlug, setPublishSlug] = useState(() => sanitizeSlug(INITIAL_PROFILE.username));
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishNote, setPublishNote] = useState<string | null>(null);
  const linkEditorRef = useRef<HTMLDivElement>(null);

  // -- Handlers --

  const updateProfile = (key: keyof ProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updateHighlight = (id: string, key: keyof Highlight, value: string) => {
    setProfile(prev => ({
      ...prev,
      highlights: prev.highlights.map(h => h.id === id ? { ...h, [key]: value } : h)
    }));
  };

  const addHighlight = () => {
    const newId = Date.now().toString();
    setProfile(prev => ({
      ...prev,
      highlights: [
        ...prev.highlights,
        {
          id: newId,
          title: 'Highlight',
          imageUrl: `https://picsum.photos/seed/${newId}/100/100`
        }
      ]
    }));
  };

  const removeHighlight = (id: string) => {
    setProfile(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h.id !== id)
    }));
  };

  const updatePost = (id: string, changes: Partial<Post>) => {
    setProfile(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === id ? { ...p, ...changes } : p)
    }));
  };

  const updateReel = (id: string, changes: Partial<Reel>) => {
    setProfile(prev => ({
      ...prev,
      reels: prev.reels.map(r => (r.id === id ? { ...r, ...changes } : r)),
    }));
  };

  const handlePublish = async () => {
    const slug = sanitizeSlug(publishSlug);
    setPublishSlug(slug);
    if (!getSupabase()) {
      setPublishNote('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
      return;
    }
    if (!isAllowedSlug(slug)) {
      setPublishNote('Path: 2–64 chars, letters, numbers, - and _ only. Reserved: published, api, …');
      return;
    }
    setIsPublishing(true);
    setPublishNote(null);
    try {
      await savePublishedProfile(slug, profile);
      const path = `/${slug}`;
      setPublishNote(`Published! Open path ${path}`);
    } catch (e) {
      setPublishNote(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (linkEditorRef.current && !linkEditorRef.current.contains(event.target as Node)) {
            setIsEditingLink(false);
        }
    }
    if (isEditingLink) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingLink, linkEditorRef]);

  useEffect(() => {
    let alive = true;
    fetchViewerGeo().then((g) => {
      if (alive) setViewerGeo(g);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const raw = searchParams.get('edit');
    if (!raw) return;
    const slug = sanitizeSlug(raw);
    if (!getSupabase()) {
      setPublishNote('Set Supabase env vars to load a page for editing.');
      setSearchParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.delete('edit');
          return n;
        },
        { replace: true }
      );
      return;
    }
    let cancelled = false;
    (async () => {
      const p = await getPublishedProfileBySlug(slug);
      if (cancelled) return;
      if (p) {
        setProfile(p);
        setPublishSlug(slug);
        setPublishNote(`Loaded /${slug} — change anything, then Publish to update.`);
      } else {
        setPublishNote(`No published page at /${raw}.`);
      }
      setSearchParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.delete('edit');
          return n;
        },
        { replace: true }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);


  return (
    <div className="box-border flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100">
      <p
        className="pointer-events-none fixed left-3 top-2 z-30 hidden text-xs font-medium tracking-wide text-zinc-500 md:block"
        aria-hidden
      >
        {APP_NAME}
      </p>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch md:justify-center md:gap-3 md:px-3 md:py-1 md:pr-80">
      {/* mobile publish bar */}
      <div className="w-full shrink-0 space-y-2 border-b border-white/5 bg-zinc-900/50 px-3 py-2 backdrop-blur-md md:hidden">
        <p className="text-center text-xs font-medium tracking-wide text-zinc-500">{APP_NAME}</p>
        <div className="flex items-center gap-1 text-sm">
          <span className="w-8 text-zinc-500">URL</span>
          <span className="text-zinc-600">/</span>
          <input
            type="text"
            value={publishSlug}
            onChange={(e) => setPublishSlug(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
            placeholder="avaowens"
            spellCheck={false}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ig_blue py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Publish
          </button>
          <Link
            to="/published"
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 bg-zinc-800/80 py-2 text-center text-sm text-zinc-100 transition hover:bg-zinc-800"
          >
            <Globe className="w-4 h-4" />
            Sites
          </Link>
        </div>
        {publishNote && <p className="text-xs text-amber-200/90">{publishNote}</p>}
      </div>
      
      {/* --- Main Phone Container --- */}
      <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-black text-zinc-100 ring-white/10 md:max-h-[min(100dvh-0.75rem,880px)] md:h-[min(100dvh-0.75rem,880px)] md:max-w-[410px] md:shrink-0 md:basis-[410px] md:self-center md:rounded-[40px] md:shadow-glow md:ring-1">
        
        {/* --- Scrollable Content --- */}
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar scrollbar-hide">

          {/* --- Header --- */}
          <div className="h-12 px-4 flex justify-between items-center bg-black pt-4">
            <div className="flex items-center gap-6">
              <ChevronLeft className="w-7 h-7 cursor-pointer" />
              <div className="flex items-center gap-0.5 font-bold text-lg min-w-0">
                <EditableText 
                  value={profile.username} 
                  onChange={(v) => updateProfile('username', v)} 
                />
                {profile.isVerified && (
                  <VerificationIcon
                    className="w-[18px] h-[18px] shrink-0 text-ig_blue cursor-pointer"
                    aria-label="Verified"
                    onClick={() => updateProfile('isVerified', false)}
                  />
                )}
                {!profile.isVerified && (
                  <span
                    className="w-[18px] h-[18px] rounded-full border border-gray-600 opacity-30 shrink-0 inline-block align-middle cursor-pointer"
                    onClick={() => updateProfile('isVerified', true)}
                    title="Show verified badge"
                    role="button"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <MoreHorizontal className="w-6 h-6" />
            </div>
          </div>

          {/* --- Padded Profile Info Container --- */}
          <div className="px-4 pt-6 pb-2">
            <div className="flex items-center justify-between mb-4">
               {/* Profile Pic */}
               <div className="relative">
                  <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2.5px]">
                     <div className="w-full h-full rounded-full bg-black p-[2.5px]">
                       <EditableImage 
                          src={profile.profilePic} 
                          onChange={(v) => updateProfile('profilePic', v)} 
                          rounded 
                          className="w-full h-full"
                       />
                     </div>
                  </div>
               </div>

               {/* Name and Stats */}
               <div className="flex flex-col flex-1 ml-4 justify-center">
                  <div className="flex items-center gap-1">
                      <EditableText 
                        className="text-base" 
                        value={profile.name} 
                        onChange={(v) => updateProfile('name', v)} 
                        placeholder="Name"
                      />
                  </div>
                  <div className="flex flex-1 justify-around items-center mt-2 text-center">
                     <div className="flex flex-col items-center">
                       <EditableText className="font-bold text-base leading-tight" value={profile.postsCount} onChange={(v) => updateProfile('postsCount', v)} />
                       <span className="text-sm text-ig_secondary">posts</span>
                     </div>
                     <div className="flex flex-col items-center">
                       <EditableText className="font-bold text-base leading-tight" value={profile.followersCount} onChange={(v) => updateProfile('followersCount', v)} />
                       <span className="text-sm text-ig_secondary">followers</span>
                     </div>
                     <div className="flex flex-col items-center">
                       <EditableText className="font-bold text-base leading-tight" value={profile.followingCount} onChange={(v) => updateProfile('followingCount', v)} />
                       <span className="text-sm text-ig_secondary">following</span>
                     </div>
                   </div>
               </div>
            </div>

            {/* Bio Section */}
            <div className="px-1 text-sm">
               <EditableText 
                 className="my-0.5 block text-zinc-500" 
                 value={profile.category} 
                 onChange={(v) => updateProfile('category', v)} 
                 placeholder="Category"
               />
               <EditableText 
                 className="block whitespace-pre-wrap leading-tight" 
                 value={profile.bio} 
                 onChange={(v) => updateProfile('bio', v)} 
                 multiline
                 placeholder="Write your bio..."
                 formatDisplay={(v) => applyGeoPlaceholders(v, viewerGeo)}
               />
                
                {isEditingLink ? (
                  <div ref={linkEditorRef} className="mt-2 rounded-xl border border-white/10 bg-zinc-900/80 p-2.5 shadow-inner">
                      <div className="flex flex-col gap-2 text-sm">
                          <div>
                              <label className="text-xs text-zinc-500">Display Text</label>
                              <input 
                                  type="text" 
                                  value={profile.link.text} 
                                  onChange={(e) => updateProfile('link', { ...profile.link, text: e.target.value })}
                                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 p-1.5 text-zinc-100 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15"
                              />
                          </div>
                          <div>
                              <label className="text-xs text-zinc-500">URL (e.g., https://your-link.com)</label>
                              <input 
                                  type="text" 
                                  value={profile.link.url} 
                                  onChange={(e) => updateProfile('link', { ...profile.link, url: e.target.value })}
                                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/50 p-1.5 text-zinc-100 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15"
                              />
                          </div>
                      </div>
                  </div>
                ) : (
                  <div
                    className="mt-1 flex cursor-pointer items-center gap-1 rounded-md p-0.5 font-medium text-ig_link transition hover:bg-white/[0.07]"
                    onClick={() => setIsEditingLink(true)}
                  >
                      <svg aria-label="Link icon" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><path d="m9.364 10.776-.328-.329A6.027 6.027 0 0 0 3.65 9.07a6.028 6.028 0 0 0-2.096 9.682l3.652 3.651a6.026 6.026 0 0 0 8.524 0 6.026 6.026 0 0 0 0-8.523l-.329-.328a1 1 0 1 0-1.414 1.414l.329.328a4.026 4.026 0 0 1 0 5.695 4.026 4.026 0 0 1-5.695 0L2.97 17.337a4.029 4.029 0 0 1 1.4-6.47 4.026 4.026 0 0 1 4.294.943l.329.329a1 1 0 1 0 1.414-1.414Zm12.182-8.322a6.027 6.027 0 0 0-8.524 0l-.329.329a1 1 0 1 0 1.414 1.414l.329-.328a4.026 4.026 0 0 1 5.695 0 4.026 4.026 0 0 1 0 5.695l-3.652 3.651a4.028 4.028 0 0 1-5.694 0 4.029 4.029 0 0 1-1.4-6.47 1 1 0 1 0-1.572 1.144 6.029 6.029 0 0 0 2.096 9.683 6.026 6.026 0 0 0 8.524 0l3.651-3.651a6.027 6.027 0 0 0 0-8.524ZM13.842 8.745a1 1 0 0 0-1.414 1.414l2.828 2.829a1 1 0 1 0 1.414-1.414Z"></path></svg>
                      <span>{profile.link.text || "your-link.com"}</span>
                  </div>
                )}
               {/* Followed by info could go here */}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-1.5 text-sm font-semibold">
              <button type="button" className="flex-1 rounded-xl bg-ig_blue py-2 text-white shadow-md shadow-sky-500/15 transition active:scale-[0.99] active:opacity-90">Follow</button>
              <button type="button" className="flex-1 rounded-xl border border-white/5 bg-ig_gray py-2 text-white transition active:scale-[0.99] active:opacity-90">Message</button>
            </div>

            {/* Highlights */}
            <div className="flex gap-4 mt-6 overflow-x-auto no-scrollbar pb-2 px-1">
               {profile.highlights.map(hl => (
                  <div key={hl.id} className="relative flex flex-col items-center gap-1 min-w-[70px] group">
                     <button 
                       onClick={() => removeHighlight(hl.id)}
                       className="absolute -top-1 -right-0 z-10 bg-gray-900 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       title="Remove Highlight"
                     >
                       <X size={14} className="bg-gray-800 rounded-full border border-gray-700" />
                     </button>
                     <div className="w-[64px] h-[64px] rounded-full border border-gray-700 bg-black p-px">
                       <div className="h-full w-full overflow-hidden rounded-full bg-black">
                          <EditableImage 
                             src={hl.imageUrl} 
                             onChange={(v) => updateHighlight(hl.id, 'imageUrl', v)} 
                             className="w-full h-full opacity-90 hover:opacity-100"
                          />
                       </div>
                     </div>
                     <EditableText 
                       className="text-xs text-center truncate w-full" 
                       value={hl.title} 
                       onChange={(v) => updateHighlight(hl.id, 'title', v)}
                     />
                  </div>
               ))}
               {/* Add Highlight Placeholder */}
               <div 
                  className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group"
                  onClick={addHighlight}
               >
                 <div className="w-[64px] h-[64px] rounded-full border border-gray-700 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                    <Plus strokeWidth={1} size={32} className="text-white" />
                 </div>
                 <span className="text-xs">New</span>
               </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-2 flex justify-around border-t border-ig_separator/80">
             <div 
                className={`flex flex-1 justify-center border-b-2 border-transparent py-2.5 ${activeTab === 'grid' ? 'border-sky-400 text-white' : 'text-zinc-500'}`}
             >
                <Grid size={24} />
             </div>
             <div 
                className={`flex flex-1 cursor-pointer justify-center border-b-2 border-transparent py-2.5 ${activeTab === 'reels' ? 'border-sky-400 text-white' : 'text-zinc-500'}`}
                onClick={() => setActiveTab('reels')}
             >
                <ReelsIcon className={activeTab === 'reels' ? 'text-white' : 'text-zinc-500'} />
             </div>
             <div 
                className={`flex flex-1 justify-center border-b-2 border-transparent py-2.5 ${activeTab === 'tagged' ? 'border-sky-400 text-white' : 'text-zinc-500'}`}
             >
                <TaggedIcon className={activeTab === 'tagged' ? 'text-white' : 'text-zinc-500'} />
             </div>
          </div>

          {/* Grid Content */}
          {activeTab === 'grid' && (
            <div className="grid grid-cols-3 gap-0.5 pb-4">
               {profile.posts.map(post => (
                 <div key={post.id} className="group relative aspect-square overflow-hidden bg-black">
                    <EditableImage 
                       src={post.imageUrl} 
                       onChange={(v) => updatePost(post.id, { imageUrl: v })}
                       className="w-full h-full hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1 pointer-events-none">
                      {post.isPinned && <Pin size={16} className="fill-white text-white rotate-45 drop-shadow-md" />}
                      {post.isVideo && <Play size={16} className="fill-white text-white drop-shadow-md" />}
                    </div>
                    {/* Hover controls for individual posts */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                       <button 
                         onClick={(e) => { e.stopPropagation(); updatePost(post.id, { isPinned: !post.isPinned }); }}
                         className={`p-1.5 rounded-full ${post.isPinned ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
                         title="Toggle Pin"
                       >
                         <Pin size={14} />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); updatePost(post.id, { isVideo: !post.isVideo }); }}
                         className={`p-1.5 rounded-full ${post.isVideo ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
                         title="Toggle Video Icon"
                       >
                         <Clapperboard size={14} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'reels' && (
            <div className="grid grid-cols-3 gap-0.5 pb-4">
              {profile.reels.map((reel) => (
                <div key={reel.id} className="group relative aspect-[3/4] bg-black">
                  <EditableImage
                    src={reel.imageUrl}
                    onChange={(v) => updateReel(reel.id, { imageUrl: v })}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md z-10">
                    <Play size={14} fill="currentColor" className="pointer-events-none" />
                    <EditableText
                      value={reel.views}
                      onChange={(v) => updateReel(reel.id, { views: v })}
                      className="!p-0 !bg-transparent hover:!bg-black/30"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

           {activeTab === 'tagged' && (
             <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
               <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-600">
                 <TaggedIcon className="w-8 h-8" />
               </div>
               <h3 className="font-bold text-xl text-white">Photos of you</h3>
               <p className="text-center text-sm px-10 mt-2">
                 When people tag you in photos, they'll appear here.
               </p>
             </div>
           )}
        </div>
      </div>
      </div>

      {/* --- Floating Tools (Desktop side panel) --- */}
      <div className="fixed right-3 top-2 bottom-2 z-20 hidden w-72 flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/90 p-4 shadow-glow backdrop-blur-xl md:flex">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Publish</p>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Published page path</label>
          <div className="flex items-center gap-1 text-sm text-zinc-500">
            <span>/</span>
            <input
              type="text"
              value={publishSlug}
              onChange={(e) => setPublishSlug(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950/50 p-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
              placeholder="avaowens"
              spellCheck={false}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ig_blue py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Publish
            </button>
            <Link
              to="/published"
              className="flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-800/90 p-2.5 text-zinc-100 transition hover:bg-zinc-800"
              title="All published sites"
            >
              <Globe className="w-5 h-5" />
            </Link>
          </div>
          {publishNote && <p className="text-xs text-amber-200/90">{publishNote}</p>}
        </div>
        <hr className="border-white/10" />
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-300">Follow Button URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.followUrl}
              onChange={(e) => updateProfile('followUrl', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-300">Message Button URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.messageUrl}
              onChange={(e) => updateProfile('messageUrl', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-300">Reels Redirect URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.reelsUrl}
              onChange={(e) => updateProfile('reelsUrl', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/50 p-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>


        <div className="space-y-2 text-xs text-zinc-500">
          <p>Click any text or image on the phone preview to edit it directly.</p>
          <p>
            In the bio, <span className="text-zinc-300">(country)</span> and <span className="text-zinc-300">(city)</span> are replaced with the viewer&apos;s location when <code className="rounded bg-zinc-800/80 px-1 text-zinc-400">VITE_IPINFO_TOKEN</code> is set (IPinfo).
          </p>
        </div>
      </div>
      
    </div>
  );
}