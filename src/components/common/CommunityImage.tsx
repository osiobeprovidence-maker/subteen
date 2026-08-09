import React, { useState } from 'react';
import { ImageIcon, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useResolvedMedia } from '../../hooks/useImageUpload';

interface CommunityImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Resolves a community cover/icon (URL or Convex storage id) and falls back to
 * a branded placeholder instead of the browser's broken-image state.
 */
export const CommunityImage: React.FC<CommunityImageProps> = ({ src, alt, className, fallbackClassName }) => {
  const resolved = useResolvedMedia(src);
  const [failed, setFailed] = useState(false);
  const showFallback = !resolved || failed;

  if (showFallback) {
    return (
      <div className={cn('bg-zinc-900 flex items-center justify-center text-zinc-700', fallbackClassName, className)}>
        <Gamepad2 size={28} className="opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export const FallbackImageIcon = ImageIcon;
