import React, { useState } from 'react';
import { MoreHorizontal, Grid, Clapperboard, Pin, Play } from 'lucide-react';
import { ProfileData } from '../types';
import { ReelsIcon, TaggedIcon, VerificationIcon } from './ig/ProfileIcons';
import { applyGeoPlaceholders, type ViewerGeo } from '../services/ipinfoService';
import { getImageUrl480 } from '../lib/imageDisplayUrl';

function ensureUrl(url: string): string {
  if (!url) return '#';
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

type Props = {
  profile: ProfileData;
  viewerGeo: ViewerGeo | null;
};

export function ReadOnlyProfileView({ profile, viewerGeo }: Props) {
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('reels');

  const bio = applyGeoPlaceholders(profile.bio, viewerGeo);

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden bg-black text-zinc-100 ring-white/10 md:max-h-[880px] md:w-[410px] md:rounded-[40px] md:shadow-glow md:ring-1">
      <div className="flex-1 scrollbar-hide overflow-y-auto no-scrollbar">
        <div className="flex h-12 items-center justify-between bg-black px-4 pt-4">
          <div className="flex min-w-0 items-center gap-0.5 text-lg font-bold">
            <span className="truncate">{profile.username}</span>
            {profile.isVerified && (
              <VerificationIcon className="h-[18px] w-[18px] shrink-0 text-ig_blue" aria-hidden />
            )}
          </div>
          <div className="flex gap-4">
            <MoreHorizontal className="h-6 w-6" aria-hidden />
          </div>
        </div>

        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2.5px]">
              <div className="w-full h-full rounded-full bg-black p-[2.5px]">
                <img
                  src={getImageUrl480(profile.profilePic)}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                  width={80}
                  height={80}
                  loading="eager"
                  decoding="async"
                />
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
            <span className="my-0.5 block text-zinc-500">{profile.category}</span>
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
              className="flex-1 rounded-xl bg-ig_blue py-2 text-center text-sm font-semibold text-white no-underline shadow-md shadow-sky-500/15"
            >
              Follow
            </a>
            <a
              href={ensureUrl(profile.messageUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-white/5 bg-ig_gray py-2 text-center text-sm font-semibold text-white no-underline"
            >
              Message
            </a>
          </div>

          <div className="flex gap-4 mt-6 overflow-x-auto no-scrollbar pb-2 px-1">
            {profile.highlights.map((hl) => (
              <div key={hl.id} className="flex flex-col items-center gap-1 min-w-[70px]">
                <div className="h-[64px] w-[64px] rounded-full border border-white/10 bg-black p-px">
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    <img
                      src={getImageUrl480(hl.imageUrl)}
                      alt=""
                      className="h-full w-full object-cover opacity-90"
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <span className="text-xs text-center truncate w-full">{hl.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-around border-t border-ig_separator/80">
          <button
            type="button"
            className={`flex flex-1 justify-center border-b-2 border-transparent bg-transparent py-2.5 ${
              activeTab === 'grid' ? 'border-sky-400 text-white' : 'text-zinc-500'
            }`}
            onClick={() => setActiveTab('grid')}
          >
            <Grid size={24} />
          </button>
          <button
            type="button"
            className={`flex flex-1 justify-center border-b-2 border-transparent py-2.5 ${
              activeTab === 'reels' ? 'border-sky-400 text-white' : 'text-zinc-500'
            }`}
            onClick={() => setActiveTab('reels')}
          >
            <ReelsIcon className={activeTab === 'reels' ? 'text-white' : 'text-zinc-500'} />
          </button>
          <button
            type="button"
            className={`flex flex-1 justify-center border-b-2 border-transparent py-2.5 ${
              activeTab === 'tagged' ? 'border-sky-400 text-white' : 'text-zinc-500'
            }`}
            onClick={() => setActiveTab('tagged')}
          >
            <TaggedIcon className={activeTab === 'tagged' ? 'text-white' : 'text-zinc-500'} />
          </button>
        </div>

        {activeTab === 'grid' && (
          <div className="grid grid-cols-3 gap-0.5 pb-4">
            {profile.posts.map((post) => (
              <div key={post.id} className="relative aspect-square overflow-hidden bg-black">
                <img
                  src={getImageUrl480(post.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  width={240}
                  height={240}
                  loading="lazy"
                  decoding="async"
                />
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
                className="relative block aspect-[3/4] bg-black"
              >
                <img
                  src={getImageUrl480(reel.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  width={180}
                  height={240}
                  loading="lazy"
                  decoding="async"
                />
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
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-600">
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
