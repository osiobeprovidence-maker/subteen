import { ConvexReactClient } from 'convex/react';

const url =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) ??
  'https://exciting-clownfish-893.convex.cloud';

export const convex = new ConvexReactClient(url);
