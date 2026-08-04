import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useResolvedMedia } from '../../hooks/useImageUpload';

export const DEFAULT_AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='a' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#27272a'/><stop offset='1' stop-color='#18181b'/></linearGradient></defs><rect width='100' height='100' fill='url(#a)'/><circle cx='50' cy='40' r='22' fill='#3f3f46'/><path d='M50 68c-20 0-32 11-32 24v6c0 6 5 10 12 10h40c7 0 12-4 12-10v-6c0-13-12-24-32-24z' fill='#3f3f46'/><path d='M50 34a8 8 0 1 0 0 .01z' fill='#B8FF4D'/></svg>`,
  );

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export const Avatar = ({ src, name, alt, size = 40, className }: AvatarProps) => {
  const resolved = useResolvedMedia(src ?? undefined);
  const [imgFailed, setImgFailed] = useState(false);

  const initials = name?.trim() ? name.trim().charAt(0).toUpperCase() : '';

  const renderDefault = () => (
    <img
      src={DEFAULT_AVATAR}
      alt={alt ?? name ?? 'avatar'}
      className="w-full h-full object-cover"
    />
  );

  let content;
  if (resolved && !imgFailed) {
    content = (
      <img
        src={resolved}
        alt={alt ?? name ?? 'avatar'}
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  } else if (!resolved) {
    content = renderDefault();
  } else if (initials) {
    content = (
      <span style={{ fontSize: Math.round(size * 0.42) }} className="font-black text-[#B8FF4D]">
        {initials}
      </span>
    );
  } else {
    content = <UserIcon style={{ width: size * 0.5, height: size * 0.5 }} className="text-zinc-500" />;
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center bg-zinc-800 border border-white/10 shrink-0',
        className,
      )}
    >
      {content}
    </div>
  );
};
