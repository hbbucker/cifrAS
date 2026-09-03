import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA and Favicon Icon Assets', () => {
  const publicDir = path.resolve(__dirname, '../../public');

  const requiredIcons = [
    { filename: 'favicon.svg', minSize: 100 },
    { filename: 'favicon.png', minSize: 500 },
    { filename: 'favicon-32x32.png', minSize: 200 },
    { filename: 'favicon-16x16.png', minSize: 100 },
    { filename: 'favicon.ico', minSize: 500 },
    { filename: 'apple-touch-icon.png', minSize: 1000 },
    { filename: 'pwa-192x192.png', minSize: 1000 },
    { filename: 'pwa-512x512.png', minSize: 2000 },
    { filename: 'pwa-maskable-192x192.png', minSize: 1000 },
    { filename: 'pwa-maskable-512x512.png', minSize: 2000 },
  ];

  for (const { filename, minSize } of requiredIcons) {
    it(`verifies ${filename} exists in public directory and is non-empty`, () => {
      const filePath = path.join(publicDir, filename);
      expect(fs.existsSync(filePath), `Expected ${filename} to exist in public/`).toBe(true);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(minSize);
    });
  }

  it('verifies index.html references apple-touch-icon and proper favicons', () => {
    const indexPath = path.resolve(__dirname, '../../index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    expect(html).toContain('apple-touch-icon.png');
    expect(html).toContain('favicon.svg');
    expect(html).toContain('favicon.ico');
  });

  it('verifies vite.config.ts includes all PWA icon assets and manifest icons', () => {
    const configPath = path.resolve(__dirname, '../../vite.config.ts');
    const config = fs.readFileSync(configPath, 'utf8');

    expect(config).toContain('pwa-192x192.png');
    expect(config).toContain('pwa-512x512.png');
    expect(config).toContain('pwa-maskable-192x192.png');
    expect(config).toContain('pwa-maskable-512x512.png');
    expect(config).toContain('apple-touch-icon.png');
  });
});
