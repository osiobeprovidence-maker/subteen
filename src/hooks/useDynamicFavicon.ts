import { useEffect } from 'react';
import { useBrandAssets } from './useBrandAssets';

export function useDynamicFavicon() {
  const { iconUrl } = useBrandAssets();

  useEffect(() => {
    if (!iconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = iconUrl;
  }, [iconUrl]);
}
