import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'publish-scheduled-articles',
  { minutes: 15 },
  internal.articles.publishScheduled,
);

crons.interval(
  'news-automation-sync',
  { hours: 1 },
  internal.newsAutomation.scheduledSync,
);

crons.interval(
  'news-automation-auto-approve',
  { minutes: 15 },
  internal.newsAutomation.autoApproveDueDrafts,
);

crons.interval(
  'auto-approve-pending-articles',
  { minutes: 15 },
  internal.articles.approveOverdue,
);

export default crons;
