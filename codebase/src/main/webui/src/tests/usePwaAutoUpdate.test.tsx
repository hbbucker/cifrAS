import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { usePwaAutoUpdate } from '../hooks/usePwaAutoUpdate';
import * as pwaUtils from '../utils/pwaUpdate';

describe('usePwaAutoUpdate Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes chunk recovery and service worker update listeners on mount', () => {
    const mockCleanupChunk = vi.fn();
    const mockCleanupPwa = vi.fn();

    const spyChunk = vi.spyOn(pwaUtils, 'setupViteChunkErrorRecovery').mockReturnValue(mockCleanupChunk);
    const spyPwa = vi.spyOn(pwaUtils, 'setupServiceWorkerAutoUpdate').mockReturnValue(mockCleanupPwa);

    const { unmount } = renderHook(() => usePwaAutoUpdate(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>,
    });

    expect(spyChunk).toHaveBeenCalled();
    expect(spyPwa).toHaveBeenCalled();

    unmount();
    expect(mockCleanupChunk).toHaveBeenCalled();
    expect(mockCleanupPwa).toHaveBeenCalled();
  });

  it('dispatches popstate event when navigating to a safe route', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    renderHook(() => usePwaAutoUpdate(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={['/songs']}>{children}</MemoryRouter>,
    });

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
  });
});
