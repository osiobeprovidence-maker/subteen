import { Author, Game } from '../types';

export const AUTHORS: Author[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    bio: 'Veteran gaming journalist with over 10 years of experience covering the industry. Specialist in RPGs and indie gems.',
    expertise: ['RPGs', 'Indie Games', 'Industry Analysis'],
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop',
    bio: 'Hardware enthusiast and competitive FPS player. If it has a high refresh rate, Marcus is there.',
    expertise: ['FPS', 'Hardware', 'Esports'],
  },
];

export const GAMES: Game[] = [
  {
    id: 'gta-vi',
    slug: 'grand-theft-auto-vi',
    title: 'Grand Theft Auto VI',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&h=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200&h=600&auto=format&fit=crop',
    releaseDate: '2025-Q3',
    platforms: ['PlayStation', 'Xbox'],
    publisher: 'Rockstar Games',
    developer: 'Rockstar North',
    description: 'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond.',
    genres: ['Open World', 'Action', 'Adventure'],
    pegiRating: '18+',
    officialWebsite: 'https://www.rockstargames.com/VI',
    timeline: [
      { year: '2023', event: 'Announcement' },
      { year: '2024', event: 'Trailer One' },
      { year: '2025', event: 'Gameplay Reveal' },
      { year: '2026', event: 'Launch' },
    ],
    dlc: [
      { name: 'Leonida Expansion', type: 'Map Expansion', status: 'Upcoming' },
      { name: 'Heists Pack', type: 'Mission Pack', status: 'Included' },
    ],
    systemRequirements: {
      minimum: ['OS: Windows 10', 'CPU: Intel i5-6600K', 'RAM: 12GB', 'GPU: GTX 1660'],
      recommended: ['OS: Windows 11', 'CPU: Intel i7-12700K', 'RAM: 32GB', 'GPU: RTX 3080'],
    }
  },
  {
    id: 'elden-ring',
    slug: 'elden-ring',
    title: 'Elden Ring',
    coverImage: 'https://images.unsplash.com/photo-1612285335132-13674681329c?q=80&w=400&h=600&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&h=600&auto=format&fit=crop',
    releaseDate: '2022-02-25',
    platforms: ['PC', 'PlayStation', 'Xbox'],
    publisher: 'Bandai Namco',
    developer: 'FromSoftware',
    description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
    rating: 9.5,
  },
];

