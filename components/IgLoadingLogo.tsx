import React from 'react';
import { getIgLogoSrc } from '../lib/igLogoUrl';

type Props = {
  className?: string;
};

/**
 * Full-viewport black screen + centered IG mark (used while a published profile loads).
 */
export function IgLoadingLogo({ className = '' }: Props) {
  const src = getIgLogoSrc();
  return (
    <div
      className={`flex min-h-dvh w-full items-center justify-center bg-black text-zinc-100 ${className}`.trim()}
    >
      <img
        src={src}
        alt="Loading"
        width={64}
        height={64}
        className="h-16 w-16 max-w-[min(4rem,25vw)] animate-pulse object-contain"
        decoding="async"
      />
    </div>
  );
}
