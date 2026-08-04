import { AuthConfig } from 'convex/server';

export default {
  providers: [
    {
      domain: 'https://securetoken.google.com/usesubteen',
      applicationID: 'usesubteen',
    },
  ],
} satisfies AuthConfig;
