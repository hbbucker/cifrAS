import { registerSW } from 'virtual:pwa-register';

export interface PwaUpdateOptions {
  checkIntervalMs?: number;
  onUpdateAvailable?: () => void;
  onUpdateApplied?: () => void;
}

/**
 * Verifies if the current route is safe for background reload/update.
 * Prevents interrupting live performances (Theater Mode) or active song editing.
 */
export function isSafeToUpdate(pathname: string): boolean {
  if (!pathname) return true;
  const isTheater = pathname.startsWith('/theater');
  const isEditing = pathname.startsWith('/songs/new') || pathname.startsWith('/songs/edit');
  return !isTheater && !isEditing;
}

/**
 * Sets up global listener for Vite dynamic chunk preload errors.
 * Automatically recovers from stale chunks after new deployments.
 */
export function setupViteChunkErrorRecovery(): () => void {
  const handler = (event: Event) => {
    event.preventDefault();
    const storageKey = 'cifras_chunk_reload_ts';
    const lastReload = sessionStorage.getItem(storageKey);
    const now = Date.now();

    // Prevent infinite reload loop if reload occurred in the last 10 seconds
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem(storageKey, now.toString());
      window.location.reload();
    }
  };

  window.addEventListener('vite:preloadError', handler);
  return () => window.removeEventListener('vite:preloadError', handler);
}

/**
 * Sets up Service Worker auto-update with periodic checks and route/visibility listeners.
 */
export function setupServiceWorkerAutoUpdate(options: PwaUpdateOptions = {}): () => void {
  const checkIntervalMs = options.checkIntervalMs ?? 5 * 60 * 1000; // 5 minutes default
  let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;
  let hasPendingUpdate = false;

  const tryApplyUpdate = () => {
    if (hasPendingUpdate && isSafeToUpdate(window.location.pathname)) {
      hasPendingUpdate = false;
      options.onUpdateApplied?.();
      if (updateSW) {
        updateSW(true);
      }
    }
  };

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          hasPendingUpdate = true;
          options.onUpdateAvailable?.();
          tryApplyUpdate();
        },
        onOfflineReady() {
          // App is ready to work offline
        },
        onRegisteredSW(_swUrl, registration) {
          if (!registration) return;

          // Periodic check
          const intervalId = setInterval(() => {
            if (navigator.onLine) {
              registration.update();
            }
          }, checkIntervalMs);

          // Check on window focus / visibility change
          const onVisibilityChange = () => {
            if (document.visibilityState === 'visible' && navigator.onLine) {
              registration.update();
              tryApplyUpdate();
            }
          };

          // Check on coming back online
          const onOnline = () => {
            registration.update();
            tryApplyUpdate();
          };

          document.addEventListener('visibilitychange', onVisibilityChange);
          window.addEventListener('online', onOnline);

          return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('online', onOnline);
          };
        },
      });
    } catch {
      // Ignored if virtual:pwa-register is not supported in test environment
    }
  }

  // Listener for route changes to apply pending updates when safe
  const onLocationCheck = () => {
    tryApplyUpdate();
  };
  window.addEventListener('popstate', onLocationCheck);

  return () => {
    window.removeEventListener('popstate', onLocationCheck);
  };
}
