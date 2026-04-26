import { ProfileData } from '../types';

// Helper to escape HTML special characters
function escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function ensureUrlProtocol(url: string): string {
    if (!url) return '#';
    return (!url.startsWith('http://') && !url.startsWith('https://')) ? `https://${url}` : url;
}

// Helper to fetch an image URL and convert it to a Base64 string
async function imageUrlToBase64(url: string): Promise<string> {
  if (!url || url.startsWith('data:image')) {
    return url;
  }
  try {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to convert image URL to Base64: ${url}`, error);
    // Fallback to a placeholder on error
    return 'https://via.placeholder.com/400';
  }
}

// Inlined SVGs to avoid dependencies
const svgs = {
    reelsIcon: `<svg aria-label="Reels" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line><path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`,
    taggedIcon: `<svg aria-label="Tagged" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle></svg>`,
    verificationIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.01 2.011a3.2 3.2 0 0 1 2.113 .797l.154 .145l.698 .698a1.2 1.2 0 0 0 .71 .341l.135 .008h1a3.2 3.2 0 0 1 3.195 3.018l.005 .182v1c0 .27 .092 .533 .258 .743l.09 .1l.697 .698a3.2 3.2 0 0 1 .147 4.382l-.145 .154l-.698 .698a1.2 1.2 0 0 0 -.341 .71l-.008 .135v1a3.2 3.2 0 0 1 -3.018 3.195l-.182 .005h-1a1.2 1.2 0 0 0 -.743 .258l-.1 .09l-.698 .697a3.2 3.2 0 0 1 -4.382 .147l-.154 -.145l-.698 -.698a1.2 1.2 0 0 0 -.71 -.341l-.135 -.008h-1a3.2 3.2 0 0 1 -3.195 -3.018l-.005 -.182v-1a1.2 1.2 0 0 0 -.258 -.743l-.09 -.1l-.697 -.698a3.2 3.2 0 0 1 -.147 -4.382l.145 -.154l.698 -.698a1.2 1.2 0 0 0 .341 -.71l.008 -.135v-1l.005 -.182a3.2 3.2 0 0 1 3.013 -3.013l.182 -.005h1a1.2 1.2 0 0 0 .743 -.258l.1 -.09l.698 -.697a3.2 3.2 0 0 1 2.269 -.944zm3.697 7.282a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>`,
};

export const generateExportHtml = async (profile: ProfileData): Promise<string> => {
    const [
        profilePicB64,
        highlightsB64,
        postsB64,
        reelsB64
    ] = await Promise.all([
        imageUrlToBase64(profile.profilePic),
        Promise.all(profile.highlights.map(h => imageUrlToBase64(h.imageUrl))),
        Promise.all(profile.posts.map(p => imageUrlToBase64(p.imageUrl))),
        Promise.all(profile.reels.map(r => imageUrlToBase64(r.imageUrl)))
    ]);

    const profileWithB64 = {
        ...profile,
        profilePic: profilePicB64,
        highlights: profile.highlights.map((h, i) => ({ ...h, imageUrl: highlightsB64[i] })),
        posts: profile.posts.map((p, i) => ({ ...p, imageUrl: postsB64[i] })),
        reels: profile.reels.map((r, i) => ({ ...r, imageUrl: reelsB64[i] }))
    };
    
    const reelsRedirectUrl = ensureUrlProtocol(profile.reelsUrl);
    const reelsHtml = profileWithB64.reels.map(reel => `
        <a href="${reelsRedirectUrl}" target="_blank" rel="noopener noreferrer" class="block relative aspect-[3/4] bg-gray-800">
            <img src="${reel.imageUrl}" alt="Reel" class="w-full h-full object-cover" />
            <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            <div class="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                <span>${escapeHtml(reel.views)}</span>
            </div>
        </a>
    `).join('');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IG Profile: ${escapeHtml(profile.username)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: { extend: { colors: { ig_blue: '#0095f6', ig_gray: '#363636', ig_link: '#e0f1ff', ig_separator: '#262626', ig_secondary: '#a8a8a8' } } },
      }
    </script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-black flex justify-center pt-0 md:pt-10 pb-10">
    <div class="w-full md:w-[410px] bg-black text-white">
        <div class="h-12 px-4 flex justify-between items-center bg-black pt-4">
            <div class="flex items-center gap-6">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                <div class="flex items-center gap-1 font-bold text-lg">
                    <span>${escapeHtml(profile.username)}</span>
                </div>
            </div>
            <div class="flex gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </div>
        </div>
        
        <div class="px-4 pt-6 pb-2">
            <div class="flex items-center justify-between mb-4">
                <div class="w-[88px] h-[88px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2.5px]">
                    <div class="w-full h-full rounded-full bg-black p-[2.5px]">
                        <img src="${profileWithB64.profilePic}" alt="Profile Picture" class="w-full h-full object-cover rounded-full" />
                    </div>
                </div>
                <div class="flex flex-col flex-1 ml-4 justify-center">
                    <div class="flex items-center gap-1">
                        <span class="text-base">${escapeHtml(profile.name)}</span>
                        ${profile.isVerified ? svgs.verificationIcon : ''}
                    </div>
                    <div class="flex flex-1 justify-around items-center mt-2 text-center">
                        <div class="flex flex-col items-center"><span class="font-bold text-base leading-tight">${escapeHtml(profile.postsCount)}</span><span class="text-sm text-ig_secondary">posts</span></div>
                        <div class="flex flex-col items-center"><span class="font-bold text-base leading-tight">${escapeHtml(profile.followersCount)}</span><span class="text-sm text-ig_secondary">followers</span></div>
                        <div class="flex flex-col items-center"><span class="font-bold text-base leading-tight">${escapeHtml(profile.followingCount)}</span><span class="text-sm text-ig_secondary">following</span></div>
                    </div>
                </div>
            </div>
            
            <div class="px-1 text-sm">
               <span class="text-gray-400 block my-0.5">${escapeHtml(profile.category)}</span>
               <p class="block whitespace-pre-wrap leading-tight">${escapeHtml(profile.bio).replace(/\n/g, '<br>')}</p>
               <a href="${ensureUrlProtocol(profile.link.url)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 mt-1 text-ig_link font-medium">
                 <svg aria-label="Link icon" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><path d="m9.364 10.776-.328-.329A6.027 6.027 0 0 0 3.65 9.07a6.028 6.028 0 0 0-2.096 9.682l3.652 3.651a6.026 6.026 0 0 0 8.524 0 6.026 6.026 0 0 0 0-8.523l-.329-.328a1 1 0 1 0-1.414 1.414l.329.328a4.026 4.026 0 0 1 0 5.695 4.026 4.026 0 0 1-5.695 0L2.97 17.337a4.029 4.029 0 0 1 1.4-6.47 4.026 4.026 0 0 1 4.294.943l.329.329a1 1 0 1 0 1.414-1.414Zm12.182-8.322a6.027 6.027 0 0 0-8.524 0l-.329.329a1 1 0 1 0 1.414 1.414l.329-.328a4.026 4.026 0 0 1 5.695 0 4.026 4.026 0 0 1 0 5.695l-3.652 3.651a4.028 4.028 0 0 1-5.694 0 4.029 4.029 0 0 1-1.4-6.47 1 1 0 1 0-1.572 1.144 6.029 6.029 0 0 0 2.096 9.683 6.026 6.026 0 0 0 8.524 0l3.651-3.651a6.027 6.027 0 0 0 0-8.524ZM13.842 8.745a1 1 0 0 0-1.414 1.414l2.828 2.829a1 1 0 1 0 1.414-1.414Z"></path></svg>
                 <span>${escapeHtml(profile.link.text)}</span>
               </a>
            </div>
            
            <div class="flex gap-1.5 mt-4 text-sm font-semibold">
              <a href="${ensureUrlProtocol(profile.followUrl)}" target="_blank" rel="noopener noreferrer" class="flex-1 bg-ig_blue text-white py-1.5 rounded-lg text-center no-underline">Follow</a>
              <a href="${ensureUrlProtocol(profile.messageUrl)}" target="_blank" rel="noopener noreferrer" class="flex-1 bg-ig_gray text-white py-1.5 rounded-lg text-center no-underline">Message</a>
            </div>
            
            <div class="flex gap-4 mt-6 overflow-x-auto no-scrollbar pb-2 px-1">
                ${profileWithB64.highlights.map(hl => `
                    <div class="flex flex-col items-center gap-1 min-w-[70px]">
                        <div class="w-[64px] h-[64px] rounded-full bg-gray-800 border border-gray-700 p-[1px]">
                            <div class="w-full h-full rounded-full overflow-hidden bg-black">
                                <img src="${hl.imageUrl}" alt="Highlight" class="w-full h-full opacity-90 object-cover" />
                            </div>
                        </div>
                        <span class="text-xs text-center truncate w-full">${escapeHtml(hl.title)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="flex justify-around border-t border-ig_separator mt-2">
            <div class="flex-1 py-2.5 flex justify-center text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M9 21V9"></path></svg></div>
            <div class="flex-1 py-2.5 flex justify-center border-b border-white text-white">${svgs.reelsIcon}</div>
            <div class="flex-1 py-2.5 flex justify-center text-gray-500">${svgs.taggedIcon}</div>
        </div>
        
        <div class="grid grid-cols-3 gap-0.5 pb-4">
            ${reelsHtml}
        </div>
    </div>
</body>
</html>
    `;
};