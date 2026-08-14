import React from 'react';
import { useResolvedMedia } from '../../hooks/useImageUpload';
import { cn } from '../../lib/utils';

interface ArticleImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export const ArticleImage = ({ src, alt = '', className, onClick }: ArticleImageProps) => {
  const resolved = useResolvedMedia(src ?? undefined);

  if (!resolved) {
    return <div className={cn('bg-zinc-900', className)} />;
  }

  return <img src={resolved} alt={alt} className={className} onClick={onClick} />;
};
