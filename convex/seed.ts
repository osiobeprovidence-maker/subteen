import { mutation } from './_generated/server';
import { AUTHORS, GAMES, ARTICLES } from '../src/data/mockData';

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('articles').first();
    if (existing) {
      return { seeded: false };
    }

    const authorIds = new Map<string, string>();
    for (const author of AUTHORS) {
      const id = await ctx.db.insert('authors', {
        name: author.name,
        avatar: author.avatar,
        bio: author.bio,
        expertise: author.expertise,
      });
      authorIds.set(author.id, id);
    }

    const gameIds = new Map<string, string>();
    for (const game of GAMES) {
      const id = await ctx.db.insert('games', {
        title: game.title,
        slug: game.slug,
        coverImage: game.coverImage,
        heroImage: game.heroImage,
        releaseDate: game.releaseDate,
        platforms: game.platforms,
        publisher: game.publisher,
        developer: game.developer,
        description: game.description,
        rating: game.rating,
        genres: game.genres,
        pegiRating: game.pegiRating,
        officialWebsite: game.officialWebsite,
        trailers: game.trailers,
        screenshots: game.screenshots,
        timeline: game.timeline,
        dlc: game.dlc,
        systemRequirements: game.systemRequirements,
      });
      gameIds.set(game.id, id);
    }

    for (const article of ARTICLES) {
      await ctx.db.insert('articles', {
        title: article.title,
        subtitle: article.subtitle,
        slug: article.slug,
        content: article.content,
        heroImage: article.heroImage,
        category: article.category,
        authorId: authorIds.get(article.authorId) as any,
        publishDate: article.publishDate,
        readingTime: article.readingTime,
        tags: article.tags,
        gameId: article.gameId,
        isFeatured: article.isFeatured,
        isTrending: article.isTrending,
        reviewScore: article.reviewScore,
        videoUrl: article.videoUrl,
        status: 'published',
        views: Math.floor(Math.random() * 9000) + 1000,
      });
    }

    return {
      seeded: true,
      authors: AUTHORS.length,
      games: GAMES.length,
      articles: ARTICLES.length,
    };
  },
});

export const seedExtras = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('categories').first();
    if (existing) {
      return { seeded: false };
    }

    for (const category of [
      { name: 'News', slug: 'news', icon: '🎮', description: 'Breaking gaming news and announcements.', status: 'Active' as const },
      { name: 'Reviews', slug: 'reviews', icon: '🕹️', description: 'In-depth game reviews and scoring.', status: 'Active' as const },
      { name: 'Guides', slug: 'guides', icon: '⚔️', description: 'Walkthroughs, tips, and strategy guides.', status: 'Active' as const },
      { name: 'Esports', slug: 'esports', icon: '🏆', description: 'Competitive gaming coverage and results.', status: 'Active' as const },
      { name: 'Deals', slug: 'deals', icon: '💰', description: 'Sales, discounts, and price drops.', status: 'Active' as const },
      { name: 'Trailers', slug: 'trailers', icon: '🎬', description: 'Official trailers and gameplay footage.', status: 'Active' as const },
      { name: 'Opinion', slug: 'opinion', icon: '💬', description: 'Editorials and hot takes from the team.', status: 'Active' as const },
      { name: 'Features', slug: 'features', icon: '📰', description: 'Long-form features and deep dives.', status: 'Active' as const },
      { name: 'Industry', slug: 'industry', icon: '🏭', description: 'Business and industry analysis.', status: 'Active' as const },
      { name: 'Hardware', slug: 'hardware', icon: '💻', description: 'Gear, PCs, and peripherals.', status: 'Disabled' as const },
    ]) {
      await ctx.db.insert('categories', category);
    }

    for (const tag of ['PlayStation', 'Xbox', 'Nintendo', 'Steam', 'Rockstar', 'EA', 'Ubisoft', 'Indie', 'PC', 'Mobile', 'VR', 'Esports']) {
      await ctx.db.insert('tags', {
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, '-'),
        status: 'Active' as const,
      });
    }

    for (const campaign of [
      { advertiser: 'Razer', campaignName: 'Kraken V4 Launch', status: 'Active' as const, clicks: 12400, views: 142000, ctr: '8.7%', revenue: 1240 },
      { advertiser: 'Samsung', campaignName: 'Odyssey G9 Promo', status: 'Active' as const, clicks: 45200, views: 820000, ctr: '5.5%', revenue: 4520 },
      { advertiser: 'Logitech', campaignName: 'G Pro Wireless', status: 'Paused' as const, clicks: 8100, views: 120000, ctr: '6.7%', revenue: 810 },
    ]) {
      await ctx.db.insert('adCampaigns', campaign);
    }

    for (const placement of [
      { name: 'Homepage Hero', enabled: true, platform: 'Desktop / Mobile', size: '1920x450' },
      { name: 'Sidebar Sticky', enabled: true, platform: 'Desktop', size: '300x600' },
      { name: 'Article Inline', enabled: true, platform: 'Desktop / Mobile', size: '728x90' },
      { name: 'Mobile Banner', enabled: false, platform: 'Mobile', size: '320x50' },
      { name: 'Search Results', enabled: true, platform: 'Desktop / Mobile', size: 'Native' },
    ]) {
      await ctx.db.insert('adPlacements', placement);
    }

    await ctx.db.insert('settings', {
      siteName: 'SUBTEEN',
      siteDescription: 'The ultimate gaming news publication.',
      language: 'English (US)',
      timezone: 'UTC-7 (Pacific)',
      accentColor: '#B8FF4D',
      featuredLayout: 'Hero',
      trendingLimit: 5,
      latestLimit: 10,
    });

    for (const user of [
      { name: 'John Doe', email: 'john@example.com', role: 'admin' as const, status: 'active' as const, joined: 'Mar 2024', articleCount: 0 },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'editor' as const, status: 'active' as const, joined: 'Apr 2024', articleCount: 42 },
      { name: 'Bob Wilson', email: 'bob@example.com', role: 'user' as const, status: 'suspended' as const, joined: 'May 2024', articleCount: 0 },
      { name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'editor' as const, status: 'active' as const, joined: 'Jun 2024', articleCount: 12 },
      { name: 'Marcus Thorne', email: 'marcus@gaming.com', role: 'editor' as const, status: 'active' as const, joined: 'Feb 2024', articleCount: 84 },
    ]) {
      await ctx.db.insert('users', {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joined: user.joined,
        articleCount: user.articleCount,
        bookmarks: [],
        readingHistory: [],
        preferences: { darkMode: true, newsletter: false },
      });
    }

    return { seeded: true, categories: 10, tags: 12, adCampaigns: 3, adPlacements: 5, settings: 1, users: 5 };
  },
});
