import React from 'react';
import { Link } from 'react-router-dom';
import { CommunityImage } from './CommunityImage';
import type { Community } from '../../types';

interface CommunityCardProps {
  community: Community;
  className?: string;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, className }) => {
  const platform = community.platform?.toUpperCase() ?? 'GAMING';
  return (
    <Link to={`/communities/${community.slug}`} className={`group space-y-4 ${className ?? ''}`}>
      <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 relative bg-zinc-950">
        <CommunityImage
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#B8FF4D] text-black rounded uppercase tracking-widest truncate">
            {platform}
          </span>
          {community.postCount !== undefined && community.postCount > 0 && (
            <span className="text-[8px] font-black px-1.5 py-0.5 bg-black/60 text-white rounded uppercase tracking-widest shrink-0">
              {community.postCount} {community.postCount === 1 ? 'Story' : 'Stories'}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors leading-tight">
        {community.name}
      </h3>
      {community.gameTitle && (
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black -mt-3">
          {community.gameTitle}
        </p>
      )}
    </Link>
  );
};
