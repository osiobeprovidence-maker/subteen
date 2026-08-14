/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  expertise: string[];
}

export type Category = 
  | 'News' 
  | 'Reviews' 
  | 'Guides' 
  | 'Esports' 
  | 'Deals' 
  | 'Trailers' 
  | 'Patch Notes'
  | 'Opinion' 
  | 'Features' 
  | 'Industry' 
  | 'Hardware';

export type CommunityStatus = 'published' | 'draft';

export interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  icon?: string;
  platform?: string;
  category?: string;
  gameTitle?: string;
  releaseYear?: string;
  setting?: string;
  protagonist?: string;
  featured?: boolean;
  status: CommunityStatus;
  postCount?: number;
  createdAt: number;
  updatedAt: number;
}

export type Platform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile' | 'VR';

export interface Game {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  heroImage: string;
  releaseDate: string;
  platforms: Platform[];
  publisher: string;
  developer: string;
  description: string;
  rating?: number;
  genres?: string[];
  pegiRating?: string;
  officialWebsite?: string;
  trailers?: { title: string; url: string; thumbnail: string }[];
  screenshots?: string[];
  timeline?: { year: string; event: string }[];
  dlc?: { name: string; type: string; status: string }[];
  systemRequirements?: {
    minimum: string[];
    recommended: string[];
  };
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  heroImage: string;
  category: Category;
  subcategory?: string;
  excerpt?: string;
  country?: string;
  region?: string;
  city?: string;
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  venue?: string;
  organizer?: string;
  ticketUrl?: string;
  ticketInfo?: string;
  eventStatus?: string;
  contentType?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  publishDate: string;
  readingTime: number;
  tags: string[];
  gameId?: string;
  communityId?: string;
  communityName?: string;
  communitySlug?: string;
  communityIcon?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  reviewScore?: number;
  videoUrl?: string;
  language?: 'en' | 'pidgin';
  status?: 'draft' | 'published' | 'scheduled';
  views?: number;
  sourceName?: string;
  sourceUrl?: string;
  sourceLogoUrl?: string;
  originalUrl?: string;
  originalTitle?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bookmarks: string[]; // Article IDs
  readingHistory: string[]; // Article IDs
  preferences: {
    darkMode: boolean;
    newsletter: boolean;
  };
}
