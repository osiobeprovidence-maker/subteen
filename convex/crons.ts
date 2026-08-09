import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'publish-scheduled-articles',
  { minutes: 5 },
  internal.articles.publishScheduled,
);

crons.interval(
  'news-automation-sync',
  { minutes: 5 },
  internal.newsAutomation.scheduledSync,
);

crons.interval(
  'news-automation-auto-approve',
  { minutes: 1 },
  internal.newsAutomation.autoApproveDueDrafts,
);

export default crons;
