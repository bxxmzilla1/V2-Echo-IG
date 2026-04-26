export interface Post {
  id: string;
  imageUrl: string;
  isPinned: boolean;
  isVideo: boolean;
}

export interface Reel {
  id:string;
  imageUrl: string;
  views: string;
}

export interface Highlight {
  id: string;
  title: string;
  imageUrl: string;
}

export interface ProfileData {
  username: string;
  name: string;
  isVerified: boolean;
  category: string;
  bio: string;
  link: {
    text: string;
    url: string;
  };
  postsCount: string;
  followersCount: string;
  followingCount: string;
  profilePic: string;
  posts: Post[];
  highlights: Highlight[];
  reels: Reel[];
  reelsUrl: string;
  followUrl: string;
  messageUrl: string;
}

export const INITIAL_PROFILE: ProfileData = {
  username: "avaowens",
  isVerified: false,
  name: "Ava Owens",
  category: "Public figure",
  bio: "21 ✨ | FLORIDA\nsnap: sophieraiin",
  link: {
    text: "link.me/avaowens",
    url: "https://www.instagram.com",
  },
  postsCount: "205",
  followersCount: "8.6M",
  followingCount: "422",
  profilePic: "https://picsum.photos/id/64/200/200",
  highlights: [
    { id: '1', title: '🫶', imageUrl: 'https://picsum.photos/id/338/100/100' },
    { id: '2', title: 'Q&A', imageUrl: 'https://picsum.photos/id/342/100/100' },
  ],
  posts: Array.from({ length: 6 }).map((_, i) => ({
    id: `post-${i}`,
    imageUrl: `https://picsum.photos/seed/post${i}/400/400`,
    isPinned: i === 0,
    isVideo: i === 2,
  })),
  reels: Array.from({ length: 9 }).map((_, i) => ({
    id: `reel-${i}`,
    imageUrl: `https://picsum.photos/seed/reel${i}/400/400`,
    views: `${((Math.random() * 4) + 0.2).toFixed(1)}M`,
  })),
  reelsUrl: "https://www.instagram.com/reels/",
  followUrl: "https://www.instagram.com/avaowens",
  messageUrl: "https://www.instagram.com/direct/inbox/",
};