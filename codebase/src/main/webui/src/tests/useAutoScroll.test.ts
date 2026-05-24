import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoScroll } from '../hooks/useAutoScroll';
import '@testing-library/jest-dom/vitest';

describe('useAutoScroll Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(() => cb(Date.now()), 16)));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id) => clearTimeout(id)));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAutoScroll());
    expect(result.current.isScrolling).toBe(false);
    expect(result.current.speed).toBe(3);
  });

  it('toggles play and pause', () => {
    const { result } = renderHook(() => useAutoScroll());
    
    act(() => {
      result.current.play();
    });
    expect(result.current.isScrolling).toBe(true);

    act(() => {
      result.current.pause();
    });
    expect(result.current.isScrolling).toBe(false);
  });

  it('updates speed within limits', () => {
    const { result } = renderHook(() => useAutoScroll());
    
    act(() => {
      result.current.setSpeed(8);
    });
    expect(result.current.speed).toBe(8);

    act(() => {
      result.current.setSpeed(15); // Exceeds limit 10
    });
    expect(result.current.speed).toBe(10);
    
    act(() => {
      result.current.setSpeed(0); // Below limit 1
    });
    expect(result.current.speed).toBe(1);
  });
});
