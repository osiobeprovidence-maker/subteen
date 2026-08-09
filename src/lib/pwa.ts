type UpdateListener = (available: boolean) => void;

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (registrationPromise) return;
  registrationPromise = navigator.serviceWorker
    .register('/sw.js')
    .catch(() => null);
}

export function listenForUpdates(onUpdate: UpdateListener): () => void {
  if (!registrationPromise) return () => {};
  let active = true;

  registrationPromise.then((registration) => {
    if (!active || !registration) return;

    const notify = () => {
      if (active && (registration.waiting || registration.installing)) {
        onUpdate(true);
      }
    };

    registration.addEventListener('updatefound', notify);
    notify();
    return () => registration.removeEventListener('updatefound', notify);
  });

  return () => {
    active = false;
  };
}

export function applyUpdate(): void {
  registrationPromise?.then((registration) => {
    const worker = registration?.waiting;
    if (!worker) return;
    worker.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => window.location.reload(),
      { once: true },
    );
  });
}
