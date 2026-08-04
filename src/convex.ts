import { ConvexReactClient } from 'convex/react';

const url =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) ??
  'https://flexible-emu-43.eu-west-1.convex.cloud';

export const convex = new ConvexReactClient(url);
