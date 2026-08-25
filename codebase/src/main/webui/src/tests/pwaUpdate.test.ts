import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSafeToUpdate, setupViteChunkErrorRecovery, setupServiceWorkerAutoUpdate } from '../utils/pwaUpdate';

interface MockRegisterSWOptions {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegisteredSW?: (swUrl: string, registration: { update: () => Promise<void> | void } | undefined) => (() => void) | void;
}

// Mock virtual:pwa-register
const mockRegisterSW = vi.fn();
vi.mock('virtual:pwa-register', () => ({
  registerSW: (options: MockRegisterSWOptions) => mockRegisterSW(options),
}));

describe('PWA Update Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSafeToUpdate', () => {
    it('returns true for general routes and empty path', () => {
      expect(isSafeToUpdate('')).toBe(true);
      expect(isSafeToUpdate('/')).toBe(true);
      expect(isSafeToUpdate('/dashboard')).toBe(true);
      expect(isSafeToUpdate('/songs')).toBe(true);
      expect(isSafeToUpdate('/playlists')).toBe(true);
    });

    it('returns false for theater mode to protect live performance', () => {
      expect(isSafeToUpdate('/theater/123')).toBe(false);
      expect(isSafeToUpdate('/theater/song/456')).toBe(false);
    });

    it('returns false for song creation and edit routes to protect user changes', () => {
      expect(isSafeToUpdate('/songs/new')).toBe(false);
      expect(isSafeToUpdate('/songs/edit/789')).toBe(false);
    });
  });

  describe('setupViteChunkErrorRecovery', () => {
    it('triggers window reload on vite:preloadError event when no recent reload', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, reload: reloadMock, pathname: '/dashboard' },
      });

      const cleanup = setupViteChunkErrorRecovery();

      const event = new CustomEvent('vite:preloadError', { cancelable: true });
      window.dispatchEvent(event);

      expect(reloadMock).toHaveBeenCalled();
      expect(sessionStorage.getItem('cifras_chunk_reload_ts')).toBeTruthy();

      cleanup();
    });

    it('throttles reload if a reload happened less than 10 seconds ago', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, reload: reloadMock, pathname: '/dashboard' },
      });

      sessionStorage.setItem('cifras_chunk_reload_ts', Date.now().toString());

      const cleanup = setupViteChunkErrorRecovery();

      const event = new CustomEvent('vite:preloadError', { cancelable: true });
      window.dispatchEvent(event);

      expect(reloadMock).not.toHaveBeenCalled();

      cleanup();
    });
  });

  describe('setupServiceWorkerAutoUpdate', () => {
    it('registers service worker and handles refresh callbacks', () => {
      const captured: { options?: MockRegisterSWOptions } = {};
      mockRegisterSW.mockImplementation((opts: MockRegisterSWOptions) => {
        captured.options = opts;
        return vi.fn();
      });

      const onAvailable = vi.fn();
      const onApplied = vi.fn();

      const cleanup = setupServiceWorkerAutoUpdate({
        onUpdateAvailable: onAvailable,
        onUpdateApplied: onApplied,
      });

      expect(mockRegisterSW).toHaveBeenCalledWith(expect.objectContaining({ immediate: true }));

      // Simulate onOfflineReady
      captured.options?.onOfflineReady?.();

      // Simulate onNeedRefresh when on safe route
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, pathname: '/dashboard' },
      });

      captured.options?.onNeedRefresh?.();
      expect(onAvailable).toHaveBeenCalled();
      expect(onApplied).toHaveBeenCalled();

      cleanup();
    });

    it('defers update if onNeedRefresh triggers on unsafe route until route changes', () => {
      const captured: { options?: MockRegisterSWOptions } = {};
      const updateSWMock = vi.fn();
      mockRegisterSW.mockImplementation((opts: MockRegisterSWOptions) => {
        captured.options = opts;
        return updateSWMock;
      });

      const onAvailable = vi.fn();
      const onApplied = vi.fn();

      const cleanup = setupServiceWorkerAutoUpdate({
        onUpdateAvailable: onAvailable,
        onUpdateApplied: onApplied,
      });

      // Set to unsafe route
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, pathname: '/theater/123' },
      });

      captured.options?.onNeedRefresh?.();
      expect(onAvailable).toHaveBeenCalled();
      expect(onApplied).not.toHaveBeenCalled();
      expect(updateSWMock).not.toHaveBeenCalled();

      // Navigate to safe route and fire popstate
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...window.location, pathname: '/songs' },
      });
      window.dispatchEvent(new Event('popstate'));

      expect(onApplied).toHaveBeenCalled();
      expect(updateSWMock).toHaveBeenCalledWith(true);

      cleanup();
    });

    it('sets up periodic checks, visibilitychange and online listeners on registered SW', () => {
      vi.useFakeTimers();
      const mockRegistration = {
        update: vi.fn(),
      };

      const captured: { options?: MockRegisterSWOptions } = {};
      mockRegisterSW.mockImplementation((opts: MockRegisterSWOptions) => {
        captured.options = opts;
        return vi.fn();
      });

      const cleanup = setupServiceWorkerAutoUpdate({ checkIntervalMs: 1000 });

      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      captured.options?.onRegisteredSW?.('sw.js', mockRegistration);

      // Fast-forward periodic timer
      vi.advanceTimersByTime(1000);
      expect(mockRegistration.update).toHaveBeenCalled();

      // Simulate visibility change
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(mockRegistration.update).toHaveBeenCalledTimes(2);

      // Simulate online event
      window.dispatchEvent(new Event('online'));
      expect(mockRegistration.update).toHaveBeenCalledTimes(3);

      // Call inner SW cleanup if returned
      const swCleanup = captured.options?.onRegisteredSW?.('sw.js', mockRegistration);
      if (typeof swCleanup === 'function') {
        swCleanup();
      }

      cleanup();
      vi.useRealTimers();
    });

    it('handles registration callback with undefined registration gracefully', () => {
      const captured: { options?: MockRegisterSWOptions } = {};
      mockRegisterSW.mockImplementation((opts: MockRegisterSWOptions) => {
        captured.options = opts;
        return vi.fn();
      });

      const cleanup = setupServiceWorkerAutoUpdate();
      expect(() => {
        captured.options?.onRegisteredSW?.('sw.js', undefined);
      }).not.toThrow();
      cleanup();
    });
  });
});
