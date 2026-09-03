import { describe, it, expect } from 'vitest';

describe('PWA and Favicon Configuration', () => {
  const pwaIconsConfig = [
    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/pwa-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ];

  it('contains valid standard icons for Chrome/Desktop PWA installation', () => {
    const standardIcons = pwaIconsConfig.filter(icon => icon.purpose === 'any');
    expect(standardIcons).toHaveLength(2);
    expect(standardIcons.map(i => i.sizes)).toEqual(['192x192', '512x512']);
    expect(standardIcons.every(i => i.type === 'image/png')).toBe(true);
    expect(standardIcons.every(i => i.src.startsWith('/'))).toBe(true);
  });

  it('contains valid maskable icons for Android adaptive launcher icons', () => {
    const maskableIcons = pwaIconsConfig.filter(icon => icon.purpose === 'maskable');
    expect(maskableIcons).toHaveLength(2);
    expect(maskableIcons.map(i => i.sizes)).toEqual(['192x192', '512x512']);
    expect(maskableIcons.every(i => i.type === 'image/png')).toBe(true);
    expect(maskableIcons.every(i => i.src.startsWith('/'))).toBe(true);
  });

  it('validates proper HTML link tags for Apple devices and Favicons', () => {
    const headLinks = [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ];

    const appleIcon = headLinks.find(link => link.rel === 'apple-touch-icon');
    expect(appleIcon).toBeDefined();
    expect(appleIcon?.href).toBe('/apple-touch-icon.png');

    const svgFavicon = headLinks.find(link => link.type === 'image/svg+xml');
    expect(svgFavicon).toBeDefined();
    expect(svgFavicon?.href).toBe('/favicon.svg');

    const icoFavicon = headLinks.find(link => link.rel === 'shortcut icon');
    expect(icoFavicon).toBeDefined();
    expect(icoFavicon?.href).toBe('/favicon.ico');
  });
});
