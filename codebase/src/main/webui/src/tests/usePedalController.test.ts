import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  usePedalController,
  DEFAULT_PEDAL_CONFIG,
  getStoredPedalConfig,
  saveStoredPedalConfig,
  PEDAL_STORAGE_KEY,
  type PedalKeyConfig,
} from '../hooks/usePedalController';
import '@testing-library/jest-dom/vitest';

describe('usePedalController Hook', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { value: 1000, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 3000, configurable: true });
    container.scrollTop = 500;
    container.scrollBy = vi.fn((...args: [ScrollToOptions?] | [number, number]) => {
      const first = args[0];
      if (typeof first === 'object' && first !== null && typeof first.top === 'number') {
        container.scrollTop += first.top;
      } else if (typeof args[1] === 'number') {
        container.scrollTop += args[1];
      }
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides default configuration and storage helpers', () => {
    expect(getStoredPedalConfig()).toEqual(DEFAULT_PEDAL_CONFIG);

    const custom: PedalKeyConfig = {
      ...DEFAULT_PEDAL_CONFIG,
      scrollStepPercentage: 80,
      profile: 'custom',
    };
    saveStoredPedalConfig(custom);
    expect(getStoredPedalConfig().scrollStepPercentage).toBe(80);
    expect(localStorage.getItem(PEDAL_STORAGE_KEY)).toContain('"scrollStepPercentage":80');
  });

  it('handles fallback gracefully when storage is corrupted', () => {
    localStorage.setItem(PEDAL_STORAGE_KEY, 'invalid-json{');
    expect(getStoredPedalConfig()).toEqual(DEFAULT_PEDAL_CONFIG);
  });

  it('scrolls down on PageDown or ArrowDown and fires feedback callback', () => {
    const containerRef = { current: container };
    const onPedalFeedback = vi.fn();
    const onNextSong = vi.fn();

    renderHook(() =>
      usePedalController({
        containerRef,
        onPedalFeedback,
        onNextSong,
      })
    );

    // Initial scroll is 500. 65% of 1000 = 650.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));

    expect(container.scrollBy).toHaveBeenCalledWith({ top: 650, behavior: 'smooth' });
    expect(onPedalFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'PageDown', action: 'scroll_down' })
    );
  });

  it('scrolls up on PageUp or ArrowUp and fires feedback callback', () => {
    const containerRef = { current: container };
    const onPedalFeedback = vi.fn();
    const onPrevSong = vi.fn();

    renderHook(() =>
      usePedalController({
        containerRef,
        onPedalFeedback,
        onPrevSong,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));

    expect(container.scrollBy).toHaveBeenCalledWith({ top: -650, behavior: 'smooth' });
    expect(onPedalFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'PageUp', action: 'scroll_up' })
    );
  });

  it('triggers onNextSong when scrolling down while near bottom', () => {
    container.scrollTop = 2000; // max scroll is 3000 - 1000 = 2000
    const containerRef = { current: container };
    const onNextSong = vi.fn();

    renderHook(() =>
      usePedalController({
        containerRef,
        onNextSong,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(onNextSong).toHaveBeenCalledTimes(1);
  });

  it('triggers onPrevSong when scrolling up while near top', () => {
    container.scrollTop = 5;
    const containerRef = { current: container };
    const onPrevSong = vi.fn();

    renderHook(() =>
      usePedalController({
        containerRef,
        onPrevSong,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(onPrevSong).toHaveBeenCalledTimes(1);
  });

  it('handles autoscroll_toggle mode properly', () => {
    const containerRef = { current: container };
    const onToggleAutoScroll = vi.fn();
    const onPedalFeedback = vi.fn();

    const config: PedalKeyConfig = {
      ...DEFAULT_PEDAL_CONFIG,
      mode: 'autoscroll_toggle',
    };

    renderHook(() =>
      usePedalController({
        containerRef,
        config,
        onToggleAutoScroll,
        onPedalFeedback,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
    expect(onToggleAutoScroll).toHaveBeenCalledTimes(1);
    expect(onPedalFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'toggle_autoscroll' })
    );
  });

  it('handles song_navigation mode properly', () => {
    const containerRef = { current: container };
    const onNextSong = vi.fn();
    const onPrevSong = vi.fn();

    const config: PedalKeyConfig = {
      ...DEFAULT_PEDAL_CONFIG,
      mode: 'song_navigation',
    };

    renderHook(() =>
      usePedalController({
        containerRef,
        config,
        onNextSong,
        onPrevSong,
      })
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
    expect(onNextSong).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
    expect(onPrevSong).toHaveBeenCalledTimes(1);
  });

  it('ignores keydown events when focus is inside text inputs', () => {
    const containerRef = { current: container };
    const onPedalFeedback = vi.fn();

    renderHook(() =>
      usePedalController({
        containerRef,
        onPedalFeedback,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true });
    input.dispatchEvent(event);

    expect(onPedalFeedback).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('exposes manual scrollDown and scrollUp methods', () => {
    const containerRef = { current: container };
    const { result } = renderHook(() =>
      usePedalController({
        containerRef,
      })
    );

    act(() => {
      result.current.scrollDown();
    });
    expect(container.scrollBy).toHaveBeenCalledWith({ top: 650, behavior: 'smooth' });

    act(() => {
      result.current.scrollUp();
    });
    expect(container.scrollBy).toHaveBeenCalledWith({ top: -650, behavior: 'smooth' });
  });
});
