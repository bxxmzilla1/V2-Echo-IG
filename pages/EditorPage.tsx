import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Download,
  Globe,
  UploadCloud
} from 'lucide-react';
import { INITIAL_PROFILE, ProfileData, Highlight, Reel, Post } from '../types';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { generateExportHtml } from '../services/exportService';
import { fetchViewerGeo, applyGeoPlaceholders, type ViewerGeo } from '../services/ipinfoService';
import { ReelsIcon, TaggedIcon, VerificationIcon } from '../components/ig/ProfileIcons';
import {
  savePublishedProfile,
  sanitizeSlug,
  isAllowedSlug,
} from '../services/supabasePublish';
import { getSupabase } from '../lib/supabase';

export function EditorPage() {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('reels');
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const htmlContent = await generateExportHtml(profile);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${profile.username}-profile.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export profile:", error);
        alert("An error occurred while exporting the profile. See console for details.");
    } finally {
        setIsExporting(false);
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


  return (
    <div className="w-full min-h-screen bg-black flex flex-col md:flex-row justify-center items-center md:items-start pt-0 md:pt-10 pb-10">
      <div className="w-full max-w-2xl md:max-w-none flex flex-col md:flex-row justify-center items-center gap-0 md:gap-6">
      {/* mobile publish bar */}
      <div className="w-full md:hidden border-b border-gray-800 px-3 py-3 space-y-2">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-500 w-8">URL</span>
          <span className="text-gray-600">/</span>
          <input
            type="text"
            value={publishSlug}
            onChange={(e) => setPublishSlug(e.target.value)}
            className="flex-1 bg-gray-900 text-white px-2 py-1.5 rounded border border-gray-700 text-sm min-w-0"
            placeholder="avaowens"
            spellCheck={false}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 bg-ig_blue hover:opacity-90 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Publish
          </button>
          <Link
            to="/published"
            className="flex-1 bg-gray-800 text-center text-white py-2 rounded-lg text-sm border border-gray-600 flex items-center justify-center gap-1"
          >
            <Globe className="w-4 h-4" />
            Sites
          </Link>
        </div>
        {publishNote && <p className="text-xs text-amber-200/90">{publishNote}</p>}
      </div>
      
      {/* --- Main Phone Container --- */}
      <div className="relative w-full md:w-[410px] md:h-[calc(100vh-5rem)] md:max-h-[880px] bg-black md:border md:border-gray-800 md:rounded-[40px] overflow-hidden flex flex-col text-white shadow-2xl">
        
        {/* --- Scrollable Content --- */}
        <div className="flex-1 scrollbar-hide overflow-y-auto no-scrollbar">

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
                 className="text-gray-400 block my-0.5" 
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
                  <div ref={linkEditorRef} className="mt-2 p-2 bg-gray-800/80 rounded-lg border border-gray-700">
                      <div className="flex flex-col gap-2 text-sm">
                          <div>
                              <label className="text-xs text-gray-400">Display Text</label>
                              <input 
                                  type="text" 
                                  value={profile.link.text} 
                                  onChange={(e) => updateProfile('link', { ...profile.link, text: e.target.value })}
                                  className="bg-black/50 text-white w-full p-1 rounded outline-none border border-transparent focus:border-blue-500"
                              />
                          </div>
                          <div>
                              <label className="text-xs text-gray-400">URL (e.g., https://your-link.com)</label>
                              <input 
                                  type="text" 
                                  value={profile.link.url} 
                                  onChange={(e) => updateProfile('link', { ...profile.link, url: e.target.value })}
                                  className="bg-black/50 text-white w-full p-1 rounded outline-none border border-transparent focus:border-blue-500"
                              />
                          </div>
                      </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 mt-1 text-ig_link font-medium cursor-pointer hover:bg-white/10 p-0.5 rounded"
                    onClick={() => setIsEditingLink(true)}
                  >
                      <svg aria-label="Link icon" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><path d="m9.364 10.776-.328-.329A6.027 6.027 0 0 0 3.65 9.07a6.028 6.028 0 0 0-2.096 9.682l3.652 3.651a6.026 6.026 0 0 0 8.524 0 6.026 6.026 0 0 0 0-8.523l-.329-.328a1 1 0 1 0-1.414 1.414l.329.328a4.026 4.026 0 0 1 0 5.695 4.026 4.026 0 0 1-5.695 0L2.97 17.337a4.029 4.029 0 0 1 1.4-6.47 4.026 4.026 0 0 1 4.294.943l.329.329a1 1 0 1 0 1.414-1.414Zm12.182-8.322a6.027 6.027 0 0 0-8.524 0l-.329.329a1 1 0 1 0 1.414 1.414l.329-.328a4.026 4.026 0 0 1 5.695 0 4.026 4.026 0 0 1 0 5.695l-3.652 3.651a4.028 4.028 0 0 1-5.694 0 4.029 4.029 0 0 1-1.4-6.47 1 1 0 1 0-1.572 1.144 6.029 6.029 0 0 0 2.096 9.683 6.026 6.026 0 0 0 8.524 0l3.651-3.651a6.027 6.027 0 0 0 0-8.524ZM13.842 8.745a1 1 0 0 0-1.414 1.414l2.828 2.829a1 1 0 1 0 1.414-1.414Z"></path></svg>
                      <span>{profile.link.text || "your-link.com"}</span>
                  </div>
                )}
               {/* Followed by info could go here */}
            </div>

            {/* Buttons */}
            <div className="flex gap-1.5 mt-4 text-sm font-semibold">
              <button className="flex-1 bg-ig_blue text-white py-1.5 rounded-lg active:opacity-80">Follow</button>
              <button className="flex-1 bg-ig_gray text-white py-1.5 rounded-lg active:opacity-80">Message</button>
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
                     <div className="w-[64px] h-[64px] rounded-full bg-gray-800 border border-gray-700 p-[1px]">
                       <div className="w-full h-full rounded-full overflow-hidden bg-black">
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
          <div className="flex justify-around border-t border-ig_separator mt-2">
             <div 
                className={`flex-1 py-2.5 flex justify-center ${activeTab === 'grid' ? 'border-b border-white text-white' : 'text-gray-500'}`}
             >
                <Grid size={24} />
             </div>
             <div 
                className={`flex-1 py-2.5 flex justify-center cursor-pointer ${activeTab === 'reels' ? 'border-b border-white text-white' : 'text-gray-500'}`}
                onClick={() => setActiveTab('reels')}
             >
                <ReelsIcon className={activeTab === 'reels' ? 'text-white' : 'text-gray-500'} />
             </div>
             <div 
                className={`flex-1 py-2.5 flex justify-center ${activeTab === 'tagged' ? 'border-b border-white text-white' : 'text-gray-500'}`}
             >
                <TaggedIcon className={activeTab === 'tagged' ? 'text-white' : 'text-gray-500'} />
             </div>
          </div>

          {/* Grid Content */}
          {activeTab === 'grid' && (
            <div className="grid grid-cols-3 gap-0.5 pb-4">
               {profile.posts.map(post => (
                 <div key={post.id} className="relative aspect-square bg-gray-800 group overflow-hidden">
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
                <div key={reel.id} className="relative aspect-[3/4] bg-gray-800 group">
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
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center mb-4">
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
      <div className="hidden md:flex fixed right-8 top-10 flex-col gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700 w-72 max-h-[90vh] overflow-y-auto shadow-xl z-20">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Published page path</label>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>/</span>
            <input
              type="text"
              value={publishSlug}
              onChange={(e) => setPublishSlug(e.target.value)}
              className="flex-1 bg-gray-800 text-white p-2 rounded border border-gray-600 text-sm min-w-0"
              placeholder="avaowens"
              spellCheck={false}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 bg-ig_blue hover:opacity-90 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Publish
            </button>
            <Link
              to="/published"
              className="shrink-0 bg-gray-800 text-white p-2 rounded-lg border border-gray-600 flex items-center justify-center"
              title="All published sites"
            >
              <Globe className="w-5 h-5" />
            </Link>
          </div>
          {publishNote && <p className="text-xs text-amber-200/90">{publishNote}</p>}
        </div>
        <hr className="border-gray-700" />
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export HTML'}
        </button>
        
        <hr className="border-gray-700" />
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Follow Button URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.followUrl}
              onChange={(e) => updateProfile('followUrl', e.target.value)}
              className="bg-gray-800 text-white w-full p-2 rounded outline-none border border-gray-600 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Message Button URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.messageUrl}
              onChange={(e) => updateProfile('messageUrl', e.target.value)}
              className="bg-gray-800 text-white w-full p-2 rounded outline-none border border-gray-600 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Reels Redirect URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={profile.reelsUrl}
              onChange={(e) => updateProfile('reelsUrl', e.target.value)}
              className="bg-gray-800 text-white w-full p-2 rounded outline-none border border-gray-600 focus:border-blue-500 text-sm"
            />
          </div>
        </div>


        <div className="text-xs text-gray-400 space-y-2">
          <p>Click any text or image on the phone preview to edit it directly.</p>
          <p>
            In the bio, <span className="text-gray-300">(country)</span> and <span className="text-gray-300">(city)</span> are replaced with the viewer&apos;s location when <code className="text-gray-500">VITE_IPINFO_TOKEN</code> is set (IPinfo).
          </p>
        </div>
      </div>
      
    </div>
  );
}