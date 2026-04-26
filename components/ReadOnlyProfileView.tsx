import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Grid, Clapperboard, Pin, Play } from 'lucide-react';
import { ProfileData } from '../types';
import { ReelsIcon, TaggedIcon, VerificationIcon } from './ig/ProfileIcons';
import { applyGeoPlaceholders, type ViewerGeo } from '../services/ipinfoService';

function ensureUrl(url: string): string {
  if (!url) return '#';
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

type Props = {
  profile: ProfileData;
  viewerGeo: ViewerGeo | null;
  onBack?: () => void;
};

export function ReadOnlyProfileView({ profile, viewerGeo, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('reels');

  const bio = applyGeoPlaceholders(profile.bio, viewerGeo);

  return (
    <div className="relative w-full md:w-[410px] min-h-full md:max-h-[880px] bg-black md:border md:border-gray-800 md:rounded-[40px] overflow-hidden flex flex-col text-white shadow-2xl">
      <div className="flex-1 scrollbar-hide overflow-y-auto no-scrollbar">
        <div className="h-12 px-4 flex justify-between items-center bg-black pt-4">
          <div className="flex items-center gap-6">
            <button type="button" onClick={onBack} className="p-0 border-0 bg-transparent text-white" aria-label="Back">
              <ChevronLeft className="w-7 h-7 cursor-pointer" />
            </button>
            <div className="flex items-center gap-0.5 font-bold text-lg min-w-0">
              <span className="truncate">{profile.username}</span>
              {profile.isVerified && (
                <VerificationIcon className="w-[18px] h-[18px] shrink-0 text-ig_blue" aria-hidden />
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <MoreHorizontal className="w-6 h-6" />
          </div>
        </div>

        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2.5px]">
              <div className="w-full h-full rounded-full bg-black p-[2.5px]">
                <img src={profile.profilePic} alt="" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <div className="flex flex-col flex-1 ml-4 justify-center">
              <div className="text-base font-normal">{profile.name}</div>
              <div className="flex flex-1 justify-around items-center mt-2 text-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-base leading-tight">{profile.postsCount}</span>
                  <span className="text-sm text-ig_secondary">posts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-base leading-tight">{profile.followersCount}</span>
                  <span className="text-sm text-ig_secondary">followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-base leading-tight">{profile.followingCount}</span>
                  <span className="text-sm text-ig_secondary">following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-1 text-sm">
            <span className="text-gray-400 block my-0.5">{profile.category}</span>
            <p className="block whitespace-pre-wrap leading-tight">{bio}</p>
            <a
              href={ensureUrl(profile.link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-1 text-ig_link font-medium"
            >
              <svg aria-label="Link" fill="currentColor" height="12" viewBox="0 0 24 24" width="12">
                <path d="m9.364 10.776-.328-.329A6.027 6.027 0 0 0 3.65 9.07a6.028 6.028 0 0 0-2.096 9.682l3.652 3.651a6.026 6.026 0 0 0 8.524 0 6.026 6.026 0 0 0 0-8.523l-.329-.328a1 1 0 1 0-1.414 1.414l.329.328a4.026 4.026 0 0 1 0 5.695 4.026 4.026 0 0 1-5.695 0L2.97 17.337a4.029 4.029 0 0 1 1.4-6.47 4.026 4.026 0 0 1 4.294.943l.329.329a1 1 0 1 0 1.414-1.414Zm12.182-8.322a6.027 6.027 0 0 0-8.524 0l-.329.329a1 1 0 1 0 1.414 1.414l.329-.328a4.026 4.026 0 0 1 5.695 0 4.026 4.026 0 0 1 0 5.695l-3.652 3.651a4.028 4.028 0 0 1-5.694 0 4.029 4.029 0 0 1-1.4-6.47 1 1 0 1 0-1.572 1.144 6.029 6.029 0 0 0 2.096 9.683 6.026 6.026 0 0 0 8.524 0l3.651-3.651a6.027 6.027 0 0 0 0-8.524ZM13.842 8.745a1 1 0 0 0-1.414 1.414l2.828 2.829a1 1 0 1 0 1.414-1.414Z"></path>
              </svg>
              {profile.link.text}
            </a>
          </div>

          <div className="flex gap-1.5 mt-4 text-sm font-semibold">
            <a
              href={ensureUrl(profile.followUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-ig_blue text-white py-1.5 rounded-lg text-center no-underline"
            >
              Follow
            </a>
            <a
              href={ensureUrl(profile.messageUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-ig_gray text-white py-1.5 rounded-lg text-center no-underline"
            >
              Message
            </a>
          </div>

          <div className="flex gap-4 mt-6 overflow-x-auto no-scrollbar pb-2 px-1">
            {profile.highlights.map((hl) => (
              <div key={hl.id} className="flex flex-col items-center gap-1 min-w-[70px]">
                <div className="w-[64px] h-[64px] rounded-full bg-gray-800 border border-gray-700 p-[1px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black">
                    <img src={hl.imageUrl} alt="" className="w-full h-full opacity-90 object-cover" />
                  </div>
                </div>
                <span className="text-xs text-center truncate w-full">{hl.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-around border-t border-ig_separator mt-2">
          <button
            type="button"
            className={`flex-1 py-2.5 flex justify-center border-0 bg-transparent ${
              activeTab === 'grid' ? 'border-b border-white text-white' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('grid')}
          >
            <Grid size={24} />
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 flex justify-center ${
              activeTab === 'reels' ? 'border-b border-white text-white' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('reels')}
          >
            <ReelsIcon className={activeTab === 'reels' ? 'text-white' : 'text-gray-500'} />
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 flex justify-center ${
              activeTab === 'tagged' ? 'border-b border-white text-white' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('tagged')}
          >
            <TaggedIcon className={activeTab === 'tagged' ? 'text-white' : 'text-gray-500'} />
          </button>
        </div>

        {activeTab === 'grid' && (
          <div className="grid grid-cols-3 gap-0.5 pb-4">
            {profile.posts.map((post) => (
              <div key={post.id} className="relative aspect-square bg-gray-800 overflow-hidden">
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex flex-col gap-1 pointer-events-none">
                  {post.isPinned && <Pin size={16} className="fill-white text-white rotate-45 drop-shadow-md" />}
                  {post.isVideo && <Play size={16} className="fill-white text-white drop-shadow-md" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="grid grid-cols-3 gap-0.5 pb-4">
            {profile.reels.map((reel) => (
              <a
                key={reel.id}
                href={ensureUrl(profile.reelsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-[3/4] bg-gray-800"
              >
                <img src={reel.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md z-10">
                  <Play size={14} fill="currentColor" />
                  {reel.views}
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center mb-4">
              <TaggedIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-white">Photos of you</h3>
            <p className="text-center text-sm px-10 mt-2">When people tag you in photos, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
