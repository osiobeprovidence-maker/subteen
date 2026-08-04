import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  authors: defineTable({
    name: v.string(),
    avatar: v.string(),
    bio: v.string(),
    expertise: v.array(v.string()),
  }),

  games: defineTable({
    title: v.string(),
    slug: v.string(),
    coverImage: v.string(),
    heroImage: v.string(),
    releaseDate: v.string(),
    platforms: v.array(v.string()),
    publisher: v.string(),
    developer: v.string(),
    description: v.string(),
    rating: v.optional(v.number()),
    genres: v.optional(v.array(v.string())),
    pegiRating: v.optional(v.string()),
    officialWebsite: v.optional(v.string()),
    trailers: v.optional(
      v.array(v.object({ title: v.string(), url: v.string(), thumbnail: v.string() })),
    ),
    screenshots: v.optional(v.array(v.string())),
    timeline: v.optional(
      v.array(v.object({ year: v.string(), event: v.string() })),
    ),
    dlc: v.optional(
      v.array(v.object({ name: v.string(), type: v.string(), status: v.string() })),
    ),
    systemRequirements: v.optional(
      v.object({
        minimum: v.array(v.string()),
        recommended: v.array(v.string()),
      }),
    ),
  })
    .index('by_slug', ['slug'])
    .searchIndex('search_title', { searchField: 'title' }),

  articles: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    slug: v.string(),
    content: v.string(),
    heroImage: v.string(),
    category: v.string(),
    authorId: v.id('authors'),
    publishDate: v.string(),
    readingTime: v.number(),
    tags: v.array(v.string()),
    gameId: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    reviewScore: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
  })
    .index('by_slug', ['slug'])
    .index('by_category', ['category'])
    .index('by_author', ['authorId'])
    .searchIndex('search_content', { searchField: 'title' }),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    bookmarks: v.array(v.id('articles')),
    readingHistory: v.array(v.id('articles')),
    preferences: v.object({
      darkMode: v.boolean(),
      newsletter: v.boolean(),
    }),
  })
    .index('by_email', ['email']),
});
