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

export default crons;
