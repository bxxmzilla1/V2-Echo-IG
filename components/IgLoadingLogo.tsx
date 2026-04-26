import React from 'react';
import { getIgLogoSrc } from '../lib/igLogoUrl';

type Props = {
  className?: string;
};

/**
 * Full-viewport centered IG logo for loading states.
 */
export function IgLoadingLogo({ className = '' }: Props) {
  const src = getIgLogoSrc();
  return (
    <div
      className={`flex min-h-dvh items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 ${className}`.trim()}
    >
      <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/40 p-4 shadow-inner backdrop-blur-sm">
        <img
          src={src}
          alt="Loading"
          width={120}
          height={120}
          className="max-h-28 w-auto max-w-full animate-pulse object-contain"
          decoding="async"
        />
      </div>
    </div>
  );
}
