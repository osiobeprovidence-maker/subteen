import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { automationStatusSchema } from './lib/automation';

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

  communities: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    platform: v.optional(v.string()),
    category: v.optional(v.string()),
    gameTitle: v.optional(v.string()),
    releaseYear: v.optional(v.string()),
    setting: v.optional(v.string()),
    protagonist: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    status: v.union(v.literal('published'), v.literal('draft')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_featured', ['featured']),

  articles: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    slug: v.string(),
    content: v.string(),
    heroImage: v.optional(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    eventStartTime: v.optional(v.string()),
    eventEndTime: v.optional(v.string()),
    venue: v.optional(v.string()),
    organizer: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    ticketInfo: v.optional(v.string()),
    eventStatus: v.optional(v.string()),
    authorId: v.optional(v.id('authors')),
    authorName: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    publishDate: v.string(),
    readingTime: v.number(),
    tags: v.array(v.string()),
    gameId: v.optional(v.string()),
    communityId: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    reviewScore: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
    contentType: v.optional(v.string()),
    language: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    shares: v.optional(v.number()),
    sourceType: v.optional(v.string()),
    status: v.optional(v.union(v.literal('published'), v.literal('draft'), v.literal('scheduled'))),
    scheduledFor: v.optional(v.number()),
    reviewStatus: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
    ),
    autoApproveAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    rejectReason: v.optional(v.string()),
    views: v.optional(v.number()),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    originalUrl: v.optional(v.string()),
    originalTitle: v.optional(v.string()),
  })
    .index('by_slug', ['slug'])
    .index('by_category', ['category'])
    .index('by_subcategory', ['subcategory'])
    .index('by_author', ['authorId'])
    .index('by_status', ['status'])
    .index('by_community', ['communityId'])
    .index('by_originalUrl', ['originalUrl'])
    .index('by_review_status', ['reviewStatus'])
    .searchIndex('search_content', { searchField: 'title' }),

  users: defineTable({
    firebaseUid: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal('member'),
        v.literal('editor'),
        v.literal('admin'),
        v.literal('super_admin'),
      ),
    ),
    status: v.optional(v.union(v.literal('active'), v.literal('suspended'))),
    joined: v.optional(v.string()),
    articleCount: v.optional(v.number()),
    country: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
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

  editorialSections: defineTable({
    slug: v.string(),
    name: v.string(),
    active: v.boolean(),
    isDefault: v.boolean(),
    order: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_active', ['active']),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.union(v.literal('Active'), v.literal('Disabled')),
  })
    .index('by_slug', ['slug'])
    .index('by_name', ['name']),

  videos: defineTable({
    title: v.string(),
    uploadId: v.string(),
    assetId: v.optional(v.string()),
    playbackId: v.string(),
    status: v.union(v.literal('processing'), v.literal('ready'), v.literal('error')),
    articleId: v.optional(v.id('articles')),
    createdAt: v.number(),
  })
    .index('by_article', ['articleId'])
    .index('by_upload', ['uploadId']),

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
    logoUrl: v.optional(v.string()),
    iconLogo: v.optional(v.string()),
    darkLogo: v.optional(v.string()),
    lightLogo: v.optional(v.string()),
    brandUpdatedAt: v.optional(v.number()),
    brandUpdatedBy: v.optional(v.string()),
    autoApproveEnabled: v.optional(v.boolean()),
    autoApproveDelayMinutes: v.optional(v.number()),
  }),

  mediaAssets: defineTable({
    storageId: v.string(),
    name: v.string(),
    mimeType: v.string(),
    size: v.number(),
    kind: v.union(v.literal('image'), v.literal('video'), v.literal('file')),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    uploadedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_created', ['createdAt']),

  reports: defineTable({
    reason: v.string(),
    description: v.optional(v.string()),
    targetType: v.string(),
    targetId: v.string(),
    targetTitle: v.optional(v.string()),
    reporterUserId: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('resolved'), v.literal('dismissed')),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    resolutionNote: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_created', ['createdAt']),

  rssSources: defineTable({
    name: v.string(),
    feedUrl: v.string(),
    websiteUrl: v.string(),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultCategory: v.optional(v.string()),
    defaultSubcategory: v.optional(v.string()),
    active: v.boolean(),
    pidgin: v.optional(v.boolean()),
    lastSyncedAt: v.optional(v.number()),
    lastSyncStatus: v.optional(v.string()),
    lastSyncError: v.optional(v.string()),
    lastSyncStats: v.optional(
      v.object({
        newStories: v.number(),
        duplicates: v.number(),
        failed: v.number(),
        processingTimeMs: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_active', ['active'])
    .index('by_name', ['name']),

  importedNews: defineTable({
    sourceId: v.id('rssSources'),
    guid: v.optional(v.string()),
    originalUrl: v.string(),
    originalTitle: v.string(),
    originalDescription: v.optional(v.string()),
    originalAuthor: v.optional(v.string()),
    originalPublishedAt: v.optional(v.number()),
    originalImageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    language: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    status: automationStatusSchema,
    duplicateOf: v.optional(v.id('importedNews')),
    duplicateReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_source', ['sourceId'])
    .index('by_status', ['status'])
    .index('by_originalUrl', ['originalUrl'])
    .index('by_guid', ['guid']),

  automatedNewsDrafts: defineTable({
    importedNewsId: v.id('importedNews'),
    sourceId: v.id('rssSources'),
    title: v.string(),
    subtitle: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    tags: v.array(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    slug: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    sourceImageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    language: v.optional(v.string()),
    aiModel: v.optional(v.string()),
    status: automationStatusSchema,
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    articleId: v.optional(v.id('articles')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_imported', ['importedNewsId'])
    .index('by_status', ['status'])
    .index('by_source', ['sourceId']),

  automationLogs: defineTable({
    sourceId: v.optional(v.id('rssSources')),
    action: v.string(),
    status: v.union(v.literal('success'), v.literal('error'), v.literal('info'), v.literal('warning')),
    message: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_created', ['createdAt'])
    .index('by_source', ['sourceId']),

  automationSettings: defineTable({
    key: v.string(),
    syncFrequencyMinutes: v.number(),
    aiProcessing: v.boolean(),
    autoPublish: v.boolean(),
    trustedSources: v.array(v.string()),
    trustedCategories: v.array(v.string()),
    trustedSubcategories: v.optional(v.array(v.string())),
    autoApprove: v.optional(v.boolean()),
    autoApproveDelayMinutes: v.optional(v.number()),
    autoApproveEnabledAt: v.optional(v.number()),
    defaultStatus: v.string(),
    maxStoriesPerSync: v.number(),
    updatedAt: v.number(),
  })
    .index('by_key', ['key']),
}, { schemaValidation: false });
