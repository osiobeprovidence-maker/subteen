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
    status: v.optional(v.union(v.literal('published'), v.literal('draft'))),
    views: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_category', ['category'])
    .index('by_author', ['authorId'])
    .searchIndex('search_content', { searchField: 'title' }),

  users: defineTable({
    firebaseUid: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    role: v.optional(v.union(v.literal('admin'), v.literal('editor'), v.literal('user'))),
    status: v.optional(v.union(v.literal('active'), v.literal('suspended'))),
    joined: v.optional(v.string()),
    articleCount: v.optional(v.number()),
    bookmarks: v.array(v.id('articles')),
    readingHistory: v.array(v.id('articles')),
    preferences: v.object({
      darkMode: v.boolean(),
      newsletter: v.boolean(),
    }),
  })
    .index('by_email', ['email'])
    .index('by_firebase_uid', ['firebaseUid']),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal('Active'), v.literal('Disabled')),
  })
    .index('by_slug', ['slug']),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.union(v.literal('Active'), v.literal('Disabled')),
  })
    .index('by_slug', ['slug'])
    .index('by_name', ['name']),

  adCampaigns: defineTable({
    advertiser: v.string(),
    campaignName: v.string(),
    status: v.union(v.literal('Active'), v.literal('Paused'), v.literal('Ended')),
    clicks: v.number(),
    views: v.number(),
    ctr: v.string(),
    revenue: v.number(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  }),

  adPlacements: defineTable({
    name: v.string(),
    enabled: v.boolean(),
    platform: v.string(),
    size: v.string(),
  }),

  settings: defineTable({
    siteName: v.string(),
    siteDescription: v.string(),
    language: v.string(),
    timezone: v.string(),
    accentColor: v.string(),
    featuredLayout: v.string(),
    trendingLimit: v.number(),
    latestLimit: v.number(),
  }),
});
