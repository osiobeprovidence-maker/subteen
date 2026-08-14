import React from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { Film } from 'lucide-react';
import { cn } from '../../lib/utils';

export function extractPlaybackId(input?: string | null): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http')) {
    const match = trimmed.match(/([a-zA-Z0-9_-]{16,})/);
    return match ? match[1] : '';
  }
  return trimmed;
}

interface MuxVideoProps {
  playbackId?: string | null;
  title?: string;
  className?: string;
}

export const MuxVideo = ({ playbackId, title, className }: MuxVideoProps) => {
  const id = extractPlaybackId(playbackId);

  if (!id) {
    return (
      <div
        className={cn(
          'aspect-video rounded-2xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center gap-3 text-zinc-600',
          className,
        )}
      >
        <Film size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest">No video attached</span>
      </div>
    );
  }

  return (
    <MuxPlayer
      className={cn('aspect-video w-full rounded-2xl overflow-hidden', className)}
      playbackId={id}
      streamType="on-demand"
      accentColor="#B8FF4D"
      primaryColor="#ffffff"
      secondaryColor="#000000"
      placeholder={title}
      metadata={{ video_title: title ?? 'Subteen video' }}
    />
  );
};
