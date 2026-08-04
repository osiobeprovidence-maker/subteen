import { mutation } from './_generated/server';
import { v } from 'convex/values';
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
