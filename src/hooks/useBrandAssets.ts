import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useBrandAssets() {
  const settings = useQuery(api.settings.get);
  const ids = useMemo(() => {
    if (!settings) return [];
    return [settings.iconLogo, settings.darkLogo, settings.lightLogo].filter(
      (x): x is string => !!x,
    );
  }, [settings]);
  const urls = useQuery(api.media.getUrls, ids.length > 0 ? { ids } : 'skip');

  return {
    settings,
    iconUrl: settings?.iconLogo && urls ? (urls[settings.iconLogo] ?? undefined) : undefined,
    darkUrl: settings?.darkLogo && urls ? (urls[settings.darkLogo] ?? undefined) : undefined,
    lightUrl: settings?.lightLogo && urls ? (urls[settings.lightLogo] ?? undefined) : undefined,
  };
}
