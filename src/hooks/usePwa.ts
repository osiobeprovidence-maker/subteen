import { useEffect, useState } from 'react';

const DISMISS_KEY = 'subteen:pwa-install-dismissed';
const INSTALLED_KEY = 'subteen:pwa-installed';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useStandaloneMode(): boolean {
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const update = () => {
      setStandalone(mq.matches || (navigator as any).standalone === true);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return standalone;
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function usePwaInstall() {
  const standalone = useStandaloneMode();
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    try {
      return localStorage.getItem(INSTALLED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const isIOS =
    typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const iosStandalone =
    typeof navigator !== 'undefined' && (navigator as any).standalone === true;

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(INSTALLED_KEY, '1');
      } catch {}
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canShow =
    !standalone &&
    !iosStandalone &&
    !isInstalled &&
    !dismissed &&
    (deferredPrompt !== null || isIOS);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  };

  const install = async (): Promise<void> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem(INSTALLED_KEY, '1');
        } catch {}
      }
    }
  };

  return { canShow, install, dismiss, isIOS };
}
