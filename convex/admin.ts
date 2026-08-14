import { query } from './_generated/server';

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const [articles, users, campaigns] = await Promise.all([
      ctx.db.query('articles').collect(),
      ctx.db.query('users').collect(),
      ctx.db.query('adCampaigns').collect(),
    ]);

    const publishedToday = articles.filter((a) => {
      const day = new Date(a.publishDate).toDateString();
      return day === new Date().toDateString();
    }).length;

    const drafts = articles.filter((a) => a.status === 'draft').length;
    const editors = users.filter((u) => u.role === 'editor' || u.role === 'admin').length;
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);

    const events = articles.filter((a) => a.category === 'Events' || a.contentType === 'event');
    const draftEvents = events.filter((a) => a.status === 'draft' || a.status === 'scheduled').length;
    const upcomingEvents = events.filter((a) => {
      if (a.status !== 'published') return false;
      const raw = a.eventDate ?? a.publishDate;
      const time = new Date(raw).getTime();
      return !Number.isNaN(time) && time >= Date.now() - 24 * 60 * 60 * 1000;
    }).length;

    return {
      publishedToday,
      draftsWaiting: drafts,
      totalArticles: articles.length,
      totalUsers: users.length,
      totalEditors: editors,
      totalRevenue,
      draftEvents,
      upcomingEvents,
      recentArticles: articles
        .slice()
        .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
        .slice(0, 10),
    };
  },
});
