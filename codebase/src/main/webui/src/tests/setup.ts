import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const mockSongs = [
  {
    id: '1',
    title: 'Wonderwall',
    artist: 'Oasis',
    originalKey: 'G',
    keySignature: 'G',
    isFavorite: false,
    categories: ['Rock'],
    content: '[G]Wonderwall...',
    lyrics: {
      sections: [
        {
          label: 'Verse',
          lines: [
            {
              chords: [{ chord: 'G', position: 0 }],
              text: 'Today is gonna be the day'
            }
          ]
        }
      ]
    }
  }
];

const mockFetch = vi.fn((url: string) => {
  if (url.includes('/api/songs/1')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSongs[0])
    });
  }
  if (url.includes('/api/songs')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSongs)
    });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({})
  });
});

vi.stubGlobal('fetch', mockFetch);

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
