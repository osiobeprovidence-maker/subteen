import { mutation } from './_generated/server';
import { AUTHORS, GAMES } from '../src/data/mockData';

const SEED_ARTICLES = [
  {
    title: 'Grand Theft Auto VI: Everything We Know So Far',
    subtitle: 'From Leonida to the latest trailer leaks, here is the ultimate breakdown.',
    slug: 'gta-vi-everything-we-know',
    content: `# The Return to Vice City

The wait for Grand Theft Auto VI has been the longest in the series' history. Rockstar Games finally broke the silence with a trailer that shattered records, introducing us to Lucia and Jason in the vibrant, chaotic state of Leonida.

## A New Era of Technical Prowess

The level of detail shown in the first trailer is staggering. Rockstar is clearly pushing the limits of current-gen hardware, from ray-traced water physics to AI-driven traffic that actually behaves like people on a busy Thursday night.

> "Leonida is the most ambitious evolution of the Grand Theft Auto series yet." — Rockstar Games

### What We Know

*   **Dual Protagonists**: A Bonnie and Clyde inspired story, a first for the series.
*   **Vast Open World**: Leonida encompasses Vice City, swamplands, and a sprawling hinterland.
*   **Enhanced AI**: Smarter NPCs with daily routines and reactive environments.
*   **Online Integration**: GTA Online is expected to evolve into the new map over time.

## When Will We Play?

Rockstar has locked a release window, and everything points to the game launching on PlayStation and Xbox first. A PC version historically follows roughly a year later — expect the same pattern here.

It has been the defining saga of open-world gaming, and Leonida is the biggest gamble yet. If the early footage is any indication, it will be worth every second of the wait.`,
    heroImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1600&h=900&auto=format&fit=crop',
    category: 'News',
    authorId: '1',
    publishDate: '2024-03-20',
    readingTime: 8,
    tags: ['GTA VI', 'Rockstar Games', 'Open World'],
    gameId: 'grand-theft-auto-vi',
    isFeatured: true,
  },
  {
    title: 'Elden Ring: Shadow of the Erdtree Review',
    subtitle: 'A masterpiece expanded into something even more terrifying and beautiful.',
    slug: 'elden-ring-shadow-erdtree-review',
    content: `# A Land Built for Legends

When the base game of Elden Ring arrived, it felt like a closing chapter for the Souls genre. Shadow of the Erdtree proves it was only an interlude. FromSoftware has delivered the most ambitious expansion in the series' history — a new realm that rivals entire games in size, density, and cruelty.

## The Realm of Shadow

The Land of Shadow is not a corridor; it is a fully realised region that peels back layer after layer. Verticality that once only appeared in legacy dungeons now stretches across entire zones. You will drop through fog into caverns, climb collapsed towers, and stumble into secret boss arenas that make the rest of the game feel tame.

> "You do not master Shadow of the Erdtree. You survive it, and then you learn to love it." — Subteen Review

## An Uphill Battle

Let's be clear: this is the hardest content FromSoftware has ever shipped. The final gauntlet is a series of fights that will have you questioning your build, your reflexes, and your sanity. But the difficulty is fair in the way the studio's best work always is — every death teaches something.

### The Bosses

*   **Messmer the Impaler**: A ballet of fire and spears that sets the tone early.
*   **Miquella, the Kind**: A finale that redefines what a FromSoftware end boss can be.
*   **The optional hunts**: Some of the best encounters are hidden behind exploration.

## The Verdict

Shadow of the Erdtree is not just an expansion; it is a statement. It respects everything players love about Elden Ring and then demands more. For anyone who finished the Lands Between and wished there was more — there always was.

**Score: 10/10**`,
    heroImage: 'https://images.unsplash.com/photo-1612285335132-13674681329c?q=80&w=1600&h=900&auto=format&fit=crop',
    category: 'Reviews',
    authorId: '1',
    publishDate: '2024-06-21',
    readingTime: 12,
    tags: ['Elden Ring', 'FromSoftware', 'Souls-like'],
    gameId: 'elden-ring',
    reviewScore: 10,
    isTrending: true,
  },
  {
    title: 'Mastering the Meta in Valorant',
    subtitle: 'The agent pool keeps shifting. Here is how to stay ahead of the pack this season.',
    slug: 'valorant-meta-guide',
    content: `# The Meta Never Sleeps

Valorant's meta is a living thing. Every patch, every agent rework, every map rotation drags the competitive landscape in a new direction. If you feel like your old picks have stopped working, you are probably right — and it is time to adapt.

## The Roles That Win Rounds

At the highest level, teams build around a flexible initiator core, a durable controller, and a duelist who can open space. The agent pool is deep enough now that no single composition is gospel, but these principles hold:

### Controllers Are Back

Smokes have become the most valuable utility in the game. Teams that run two controllers are winning site takes before the duel even starts. If you are queueing solo, learning a controller is the single fastest way to climb.

### Initiators Define the Pace

Recent patches gave initiators more autonomous power. Utility that gathers information is worth more than raw damage when you are playing against coordinated defaults.

## Five Tips to Climb

1.  **Simplify your agent pool**: Two agents, mastered, beats ten you know "okay".
2.  **Watch the minimap every three seconds**: Sounds simple; nobody does it.
3.  **Comms over frags**: A drone ping is worth a thousand kills.
4.  **Play the economy**: Save rounds are how matches are actually won.
5.  **Review one loss a day**: Watch your deaths, not your kills.

## Closing Thoughts

The meta will shift again next patch. It always does. The players who survive are the ones who learn to read *why* something is strong, not just copy what is strong. Master the fundamentals and you will outlast every meta.`,
    heroImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&h=450&auto=format&fit=crop',
    category: 'Guides',
    authorId: '2',
    publishDate: '2024-08-01',
    readingTime: 5,
    tags: ['Valorant', 'Esports', 'Guide'],
    gameId: 'valorant',
    isTrending: true,
  },
  {
    title: 'The Future of VR Gaming',
    subtitle: 'Where the next generation of headsets is actually taking us.',
    slug: 'future-vr-2024',
    content: `# Past the Hype Cycle

VR has been "the future" for a decade. The difference now is that the hardware has finally caught up to the promise. Lighter headsets, eye-tracked foveated rendering, and cheaper standalone units have pulled the technology out of the enthusiast niche and into living rooms.

## The Standalone Revolution

The most important shift has been wireless standalone headsets. No PC, no cables, no setup ritual. You put it on and you are in. That friction removal is the entire reason VR finally crossed into the mainstream — and the next wave of devices is doubling down on it.

> "The best VR headset is the one you actually put on." — Industry maxim, now finally true

## Where the Content Is

*   **Social spaces**: Millions of people log in weekly just to hang out.
*   **Fitness**: Beat-style rhythm games outsell most AAA flatscreen titles.
*   **Simulation**: Flight, driving, and space sims are the silent killers of productivity.
*   **Flat-to-VR conversions**: Every major PC title now ships with a VR mod within months.

## The Barriers That Remain

Motion comfort is solved for most people, but the software still trails the hardware. Developers are still learning how to design games that don't just port a first-person shooter into a headset. And the price of entry, while falling, still stops a generation of players at the checkout screen.

## The Road Ahead

Passthrough mixed reality is the next wave — blending your real room with digital layers instead of replacing it. Early demos suggest it could be the gateway feature that finally explains to a mainstream audience why VR matters.

It has been a long, broken promise. But for the first time, the future of VR is not a demo reel. It is on shelves, and it is good.`,
    heroImage: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&h=450&auto=format&fit=crop',
    category: 'Features',
    authorId: '4',
    publishDate: '2024-07-15',
    readingTime: 15,
    tags: ['VR', 'Technology', 'Industry'],
  },
  {
    title: "Baldur's Gate 3, One Year Later: Why It Still Has No Equal",
    subtitle: 'The RPG that changed how we think about choice — and whether any studio can follow it.',
    slug: 'baldurs-gate-3-retrospective',
    content: `# The Long Shadow of Larian

It is easy to forget, a year on, how improbable Baldur's Gate 3 was. A studio famous for niche CRPGs, crowdfunded in the shadow of a beloved franchise, delivering a launch that somehow exceeded the wildest expectations. A year later, nothing has touched it.

## Choice As Architecture

The reason the game endures is not its size — it is that the choices actually mean something. Save a character in act one and they will remember it in act three. Let a seemingly minor NPC die and a questline quietly reshapes itself. The reactivity is not a gimmick; it is the architecture.

> "Every run of Baldur's Gate 3 is a different game, and every one of them is right." — Subteen

## The Multiplayer Miracle

It should not have worked. A five-person cooperative Dungeons & Dragons simulator where one player is romancing a vampire while another is threatening the entire city. And yet the game's co-op mode produced some of the funniest stories in gaming history — because it was never about winning. It was about the chaos.

## Can Anyone Follow It?

The uncomfortable question every studio is asking is how to follow it. The honest answer is that most can't — not for lack of talent, but for lack of scope. A game this reactive takes years and an unreasonable amount of faith from a publisher.

Larian has already said it will not be making a direct sequel. In a way, that is perfect. Baldur's Gate 3 is a peak that everyone else will be climbing for the rest of the decade, and the view from the top is one of a kind.`,
    heroImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1600&h=900&auto=format&fit=crop',
    category: 'Features',
    authorId: '1',
    publishDate: '2025-01-24',
    readingTime: 11,
    tags: ['Baldur', 'Larian', 'RPG'],
    gameId: 'baldurs-gate-3',
    isFeatured: true,
  },
  {
    title: 'Helldivers 2 Rewrote the Rules of Live Service',
    subtitle: 'How a chaotic co-op shooter turned its players into a global, player-driven narrative engine.',
    slug: 'helldivers-2-live-service-revolution',
    content: `# Democracy, Managed

Every studio making a live-service game is trying to copy Helldivers 2 right now. Few will admit it, but the evidence is everywhere: community-driven storylines, shared global progression, and a willingness to let players *fail* and live with the consequences.

## The War Is the Game

The genius of Arrowhead's design is that the war never stops. Every mission a player completes contributes to a global campaign tracked in real time. When a supply line falls, the front moves. When a major order is failed, the community loses a planet — and it hurts.

> "You do not play Helldivers 2. You serve it." — Subteen

## Players Become the Story

The community turned this into a narrative engine. Strategic debates rage on forums. Planets are sacrificed to save others. Internal memes about the "bottom half" of the map become genuine strategic doctrine. Arrowhead does not write this story — it just supplies the canvas and lets millions of players paint.

### Why It Works

*   **Shared stakes**: Every kill contributes to a cause bigger than one match.
*   **Failure is content**: Losing a planet generates more discussion than winning one.
*   **No paid power**: Monetisation never touches the battlefield.
*   **Frequent surprises**: The latest faction's arrival reshaped the war overnight.

## The New Blueprint

Helldivers 2 proved that a live-service game does not need battle passes, FOMO timers, and predatory monetisation to be profitable. It needs a good game, a live world, and a community trusted to make the story its own.

The rest of the industry is still catching up. We are happy to keep diving.`,
    heroImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1600&h=900&auto=format&fit=crop',
    category: 'News',
    authorId: '2',
    publishDate: '2025-08-14',
    readingTime: 9,
    tags: ['Helldivers', 'Live Service', 'Co-op'],
    gameId: 'helldivers-2',
    isTrending: true,
  },
  {
    title: 'Valorant Champions: The Final That Changed Everything',
    subtitle: 'A grand final for the ages that will define the scene for years to come.',
    slug: 'valorant-champions-final-recap',
    content: `# History, Written in Clutches

There are grand finals, and then there are matches that become the reference point for an entire generation of esports. Valorant Champions produced one of the latter. It had everything: reverse sweeps, 1v4 clutch moments, and a map five that will be studied in VOD rooms for the next decade.

## The Build-Up

The road to the final was a gauntlet. The top seeds traded blows in the group stage, the lower brackets were a bloodbath, and the favourites who had dominated all year suddenly looked mortal under the pressure of the biggest stage in the scene.

## Map Five, Overtime

It came down to the deciding map, and overtime. The economy was shredded. The utility was gone. It was raw aim and ice-cold nerves — and it produced the single most replayed clutch of the year.

> "You watch a hundred finals waiting for one map like that." — Casting desk, as the crowd drowned out the call

### Takeaways for the Scene

*   **The meta evolved mid-tournament**: Teams that adapted their agent comps on the fly went deep.
*   **Igls matter more than ever**: The smartest shot-callers dragged their teams through impossible rounds.
*   **New blood arrived**: The breakout rookies of the event are already being courted by every top roster.

## What Comes Next

The off-season will be brutal. Rosters will shuffle, regions will trade players, and the winners will spend the entire break being hunted. That is the cycle of the sport — and it is exactly why we keep watching.

See you at the next Champions. It has a lot to live up to.`,
    heroImage: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=1600&h=900&auto=format&fit=crop',
    category: 'Esports',
    authorId: '3',
    publishDate: '2025-09-05',
    readingTime: 7,
    tags: ['Valorant', 'Champions', 'Esports'],
    gameId: 'valorant',
    isTrending: true,
  },
  {
    title: 'The Live-Service Reckoning: What Failed, and What Survived',
    subtitle: 'An industry that built its economy on updates is now learning which models players will actually tolerate.',
    slug: 'live-service-reckoning',
    content: `# The Bubble That Broke

For the better part of a decade, the industry told itself a comfortable story: that a game released is only the beginning, and the money lives in the content pipeline that follows it. Then the cancellations started. Multiplayer titles were shuttered before their first anniversary, live-service projects were cancelled before launch, and a generation of players stopped trusting the roadmap.

## What Killed the Older Model

The failure pattern is remarkably consistent. A full-priced game, shipped with battle passes, daily login streaks, and cosmetic shops aimed straight at FOMO. Players were asked to treat the game like a job before the game had earned the right to be their second home.

> "Live service was never the problem. Living service was." — Subteen

## What Actually Survives

The survivors share a strange quality: they feel alive. Games like Helldivers 2 and Baldur's Gate 3 prove that the model that works is not the one that schedules content drops but the one that lets players shape the world. The relationship has to be reciprocal.

### The Models That Win

*   **Shared-world consequences**: When the community's actions change the game, players stay.
*   **Optional engagement**: No daily chores, no deadlines — just reasons to come back.
*   **Quality over cadence**: One brilliant season beats four forgettable ones.
*   **Trust**: No pay-to-win, ever. The moment that line is crossed, the player base walks.

## The Road Ahead

The next few years will be brutal. Dozens of games in development were built on the old assumptions and will ship into a market that no longer accepts them. The studios that survive will be the ones that treat their players like partners rather than churn statistics.

The reckoning was overdue. The industry that emerges from it will be smaller, leaner, and — if we are lucky — far more honest.`,
    heroImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1600&h=900&auto=format&fit=crop',
    category: 'Industry',
    authorId: '3',
    publishDate: '2026-03-10',
    readingTime: 10,
    tags: ['Industry', 'Live Service', 'Analysis'],
  },
];

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    const authorIds = new Map<string, string>();
    for (const author of AUTHORS) {
      const existing = await ctx.db
        .query('authors')
        .filter((q) => q.eq(q.field('name'), author.name))
        .first();
      const id = existing?._id ?? (await ctx.db.insert('authors', {
        name: author.name,
        avatar: author.avatar,
        bio: author.bio,
        expertise: author.expertise,
      }));
      authorIds.set(author.id, id);
    }

    const gameIds = new Map<string, string>();
    for (const game of GAMES) {
      const existing = await ctx.db
        .query('games')
        .withIndex('by_slug', (q) => q.eq('slug', game.slug))
        .unique();
      const id = existing?._id ?? (await ctx.db.insert('games', {
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
      }));
      gameIds.set(game.id, id);
    }

    let inserted = 0;
    let updated = 0;
    for (const article of SEED_ARTICLES) {
      const patch = {
        title: article.title,
        subtitle: article.subtitle,
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
        status: 'published' as const,
        authorName: undefined,
        authorAvatar: undefined,
      };
      const existing = await ctx.db
        .query('articles')
        .withIndex('by_slug', (q) => q.eq('slug', article.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, patch);
        updated += 1;
      } else {
        await ctx.db.insert('articles', {
          ...patch,
          slug: article.slug,
          views: Math.floor(Math.random() * 9000) + 1000,
        });
        inserted += 1;
      }
    }

    return {
      seeded: true,
      authors: AUTHORS.length,
      games: GAMES.length,
      articles: SEED_ARTICLES.length,
      inserted,
      updated,
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
      { name: 'Bob Wilson', email: 'bob@example.com', role: 'member' as const, status: 'suspended' as const, joined: 'May 2024', articleCount: 0 },
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

const SEED_COMMUNITIES = [
  {
    name: 'Grand Theft Auto VI',
    slug: 'grand-theft-auto-vi',
    description:
      'The home of every story, trailer and rumour about Rockstar’s return to Leonida. Lucia, Jason and the biggest open world ever built — discussed here daily.',
    coverImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
    icon: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&auto=format&fit=crop',
    platform: 'PlayStation',
    category: 'Action / Open World',
    gameTitle: 'Grand Theft Auto VI',
    releaseYear: '2025',
    setting: 'Leonida',
    protagonist: 'Lucia & Jason',
    featured: true,
    status: 'published' as const,
  },
  {
    name: 'Elden Ring',
    slug: 'elden-ring',
    description:
      'The Lands Between and beyond. Builds, bosses, lore theories and every Shadow of the Erdtree secret the community can unearth.',
    coverImage: 'https://images.unsplash.com/photo-1612285335132-13674681329c?q=80&w=1000&auto=format&fit=crop',
    icon: 'https://images.unsplash.com/photo-1612285335132-13674681329c?q=80&w=200&auto=format&fit=crop',
    platform: 'PC',
    category: 'Action RPG / Souls-like',
    gameTitle: 'Elden Ring',
    releaseYear: '2022',
    setting: 'The Lands Between',
    protagonist: 'The Tarnished',
    status: 'published' as const,
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    description:
      'Tactical shooter tactics, agent picks, VCT coverage and climbing guides from the Subteen Valorant community.',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    icon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop',
    platform: 'PC',
    category: 'Tactical Shooter / Esports',
    gameTitle: 'Valorant',
    releaseYear: '2020',
    setting: 'Near-future Earth',
    status: 'published' as const,
  },
  {
    name: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    description:
      'Builds, honour mode runs, romances gone wrong and the endless choices of Larian’s masterpiece.',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop',
    icon: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=200&auto=format&fit=crop',
    platform: 'PC',
    category: 'CRPG / Turn-based',
    gameTitle: "Baldur's Gate 3",
    releaseYear: '2023',
    setting: 'Faerûn',
    protagonist: 'The Dark Urge',
    status: 'published' as const,
  },
  {
    name: 'Helldivers 2',
    slug: 'helldivers-2',
    description:
      'For Democracy. War strategies, loadout builds and the latest from the galactic front lines.',
    coverImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop',
    icon: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=200&auto=format&fit=crop',
    platform: 'PlayStation',
    category: 'Co-op Shooter',
    gameTitle: 'Helldivers 2',
    releaseYear: '2024',
    setting: 'Super Earth & the Galaxy',
    status: 'published' as const,
  },
  {
    name: 'Minecraft',
    slug: 'minecraft',
    description:
      'Builds, survival tips, redstone contraptions and every update worth digging into.',
    coverImage: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=1000&auto=format&fit=crop',
    icon: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=200&auto=format&fit=crop',
    platform: 'Xbox',
    category: 'Sandbox / Survival',
    gameTitle: 'Minecraft',
    releaseYear: '2011',
    setting: 'The Overworld',
    status: 'published' as const,
  },
];

/** Seeds demo communities and links seeded articles to them. Idempotent by slug. */
export const seedCommunities = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    for (const c of SEED_COMMUNITIES) {
      const existing = await ctx.db
        .query('communities')
        .withIndex('by_slug', (q) => q.eq('slug', c.slug))
        .unique();
      if (existing) continue;
      const now = Date.now();
      await ctx.db.insert('communities', {
        ...c,
        coverImage: c.coverImage,
        icon: c.icon,
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }

    const links = [
      { articleSlug: 'gta-vi-everything-we-know', communitySlug: 'grand-theft-auto-vi' },
      { articleSlug: 'elden-ring-shadow-erdtree-review', communitySlug: 'elden-ring' },
      { articleSlug: 'valorant-meta-guide', communitySlug: 'valorant' },
      { articleSlug: 'baldurs-gate-3-retrospective', communitySlug: 'baldurs-gate-3' },
      { articleSlug: 'helldivers-2-live-service-revolution', communitySlug: 'helldivers-2' },
      { articleSlug: 'valorant-champions-final-recap', communitySlug: 'valorant' },
    ];
    let linked = 0;
    for (const link of links) {
      const article = await ctx.db
        .query('articles')
        .withIndex('by_slug', (q) => q.eq('slug', link.articleSlug))
        .unique();
      const community = await ctx.db
        .query('communities')
        .withIndex('by_slug', (q) => q.eq('slug', link.communitySlug))
        .unique();
      if (article && community && !article.communityId) {
        await ctx.db.patch(article._id, { communityId: community._id });
        linked += 1;
      }
    }

    return { seeded: true, created, linked };
  },
});
