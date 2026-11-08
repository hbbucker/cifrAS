import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CoachMark } from '../components/ui/CoachMark';
import { TourProvider, useTour } from '../context/TourContext';

const Inner = ({ children, startTourId }: { children: React.ReactNode; startTourId?: string }) => {
  const { startTour } = useTour();
  React.useEffect(() => {
    if (startTourId) startTour(startTourId);
  }, [startTour, startTourId]);
  return <>{children}</>;
};

const TestWrapper = ({ children, startTourId }: { children: React.ReactNode; startTourId?: string }) => {
  return (
    <TourProvider>
      <Inner startTourId={startTourId}>{children}</Inner>
    </TourProvider>
  );
};

describe('CoachMark', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders children only when tour is not active', () => {
    render(
      <TestWrapper>
        <CoachMark tourId="test-tour" title="Test Title" description="Test Desc">
          <button>Target Button</button>
        </CoachMark>
      </TestWrapper>
    );
    
    expect(screen.getByText('Target Button')).toBeInTheDocument();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders coach mark content when tour is active', () => {
    render(
      <TestWrapper startTourId="test-tour">
        <CoachMark tourId="test-tour" title="Test Title" description="Test Desc" position="bottom">
          <button>Target Button</button>
        </CoachMark>
      </TestWrapper>
    );
    
    expect(screen.getByText('Target Button')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Desc')).toBeInTheDocument();
  });

  it('closes tour when end button is clicked', () => {
    render(
      <TestWrapper startTourId="test-tour">
        <CoachMark tourId="test-tour" title="Test Title" description="Test Desc">
          <button>Target Button</button>
        </CoachMark>
      </TestWrapper>
    );
    
    const entendiBtn = screen.getByText('Entendi');
    act(() => {
      entendiBtn.click();
    });
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('closes tour when close (X) button is clicked', () => {
    render(
      <TestWrapper startTourId="test-tour">
        <CoachMark tourId="test-tour" title="Test Title" description="Test Desc">
          <button>Target Button</button>
        </CoachMark>
      </TestWrapper>
    );

    const closeBtn = screen.getByLabelText('Close');
    act(() => {
      closeBtn.click();
    });

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders custom confirmText when provided', () => {
    render(
      <TestWrapper startTourId="test-tour">
        <CoachMark tourId="test-tour" title="Test Title" description="Test Desc" confirmText="Avançar" position="top">
          <button>Target Button</button>
        </CoachMark>
      </TestWrapper>
    );

    expect(screen.getByText('Avançar')).toBeInTheDocument();
  });

  it('advances to nextTourId when next button is clicked', () => {
    render(
      <TestWrapper startTourId="step-1">
        <CoachMark tourId="step-1" nextTourId="step-2" title="Step 1 Title" description="Step 1 Desc">
          <button>Step 1 Button</button>
        </CoachMark>
        <CoachMark tourId="step-2" title="Step 2 Title" description="Step 2 Desc">
          <button>Step 2 Button</button>
        </CoachMark>
      </TestWrapper>
    );

    expect(screen.getByText('Step 1 Title')).toBeInTheDocument();
    expect(screen.queryByText('Step 2 Title')).not.toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Próximo|next/i });
    expect(nextBtn).toBeInTheDocument();
    act(() => {
      nextBtn.click();
    });

    expect(screen.queryByText('Step 1 Title')).not.toBeInTheDocument();
    expect(screen.getByText('Step 2 Title')).toBeInTheDocument();
    expect(localStorage.getItem('tour_seen_step-1')).toBe('true');
  });

  it('clamps popover inside viewport when target is near right edge', () => {
    // Mock viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    const { container } = render(
      <TestWrapper startTourId="edge-tour">
        <CoachMark tourId="edge-tour" title="Right Edge Title" description="Right Edge Desc" position="bottom">
          <button data-testid="target-btn">Edge Button</button>
        </CoachMark>
      </TestWrapper>
    );

    // Mock target getBoundingClientRect near right edge
    const targetWrapper = container.firstElementChild as HTMLElement;
    vi.spyOn(targetWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 950,
      right: 990,
      width: 40,
      height: 40,
      x: 950,
      y: 100,
      toJSON: () => ({}),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const popover = screen.getByText('Right Edge Title').closest('div[style*="position: fixed"]') as HTMLElement;
    expect(popover).toBeInTheDocument();
    // max allowed left: 1000 - 256 - 12 = 732
    expect(popover.style.left).toBe('732px');
  });

  it('clamps popover inside viewport when target is near left edge', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    const { container } = render(
      <TestWrapper startTourId="edge-tour">
        <CoachMark tourId="edge-tour" title="Left Edge Title" description="Left Edge Desc" position="bottom">
          <button>Edge Button</button>
        </CoachMark>
      </TestWrapper>
    );

    const targetWrapper = container.firstElementChild as HTMLElement;
    vi.spyOn(targetWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 10,
      right: 50,
      width: 40,
      height: 40,
      x: 10,
      y: 100,
      toJSON: () => ({}),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const popover = screen.getByText('Left Edge Title').closest('div[style*="position: fixed"]') as HTMLElement;
    expect(popover).toBeInTheDocument();
    // min allowed left: 12px
    expect(popover.style.left).toBe('12px');
  });

  it('auto-flips to top when target is near bottom edge', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });

    const { container } = render(
      <TestWrapper startTourId="edge-tour">
        <CoachMark tourId="edge-tour" title="Bottom Edge Title" description="Bottom Edge Desc" position="bottom">
          <button>Bottom Button</button>
        </CoachMark>
      </TestWrapper>
    );

    const targetWrapper = container.firstElementChild as HTMLElement;
    vi.spyOn(targetWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 540,
      left: 400,
      right: 480,
      width: 80,
      height: 40,
      x: 400,
      y: 500,
      toJSON: () => ({}),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const popover = screen.getByText('Bottom Edge Title').closest('div[style*="position: fixed"]') as HTMLElement;
    expect(popover).toBeInTheDocument();
    // top = target.top (500) - popoverHeight (160) - GAP (12) = 328px
    expect(popover.style.top).toBe('328px');
  });

  it('auto-flips to left when target is near right edge with position=right', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });

    const { container } = render(
      <TestWrapper startTourId="edge-tour">
        <CoachMark tourId="edge-tour" title="Right Flip Title" description="Right Flip Desc" position="right">
          <button>Right Flip Button</button>
        </CoachMark>
      </TestWrapper>
    );

    const targetWrapper = container.firstElementChild as HTMLElement;
    vi.spyOn(targetWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 240,
      left: 700,
      right: 780,
      width: 80,
      height: 40,
      x: 700,
      y: 200,
      toJSON: () => ({}),
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    const popover = screen.getByText('Right Flip Title').closest('div[style*="position: fixed"]') as HTMLElement;
    expect(popover).toBeInTheDocument();
    // flipped to left: left = target.left (700) - popoverWidth (256) - GAP (12) = 432px
    expect(popover.style.left).toBe('432px');
  });

  it('auto-flips to bottom when target is near top edge with position=top', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    const { container } = render(
      <TestWrapper startTourId="edge-tour">
        <CoachMark tourId="edge-tour" title="Top Flip Title" description="Top Flip Desc" position="top">
          <button>Top Flip Button</button>
        </CoachMark>
      </TestWrapper>
    );

    const targetWrapper = container.firstElementChild as HTMLElement;
    vi.spyOn(targetWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      bottom: 90,
      left: 400,
      right: 480,
      width: 80,
      height: 40,
      x: 400,
      y: 50,
      toJSON: () => ({}),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const popover = screen.getByText('Top Flip Title').closest('div[style*="position: fixed"]') as HTMLElement;
    expect(popover).toBeInTheDocument();
    // flipped to bottom: top = target.bottom (90) + GAP (12) = 102px
    expect(popover.style.top).toBe('102px');
  });

  it('auto-flips to right when target is near left edge with position=left', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    const { container } = render(
      <TestWrapper startTourId="edge-tour">
        <CoachMark tourId="edge-tour" title="Left Flip Title" description="Left Flip Desc" position="left">
          <button>Left Flip Button</button>
        </CoachMark>
      </TestWrapper>
    );

    const targetWrapper = container.firstElementChild as HTMLElement;
    vi.spyOn(targetWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 240,
      left: 50,
      right: 130,
      width: 80,
      height: 40,
      x: 50,
      y: 200,
      toJSON: () => ({}),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const popover = screen.getByText('Left Flip Title').closest('div[style*="position: fixed"]') as HTMLElement;
    expect(popover).toBeInTheDocument();
    // flipped to right: left = target.right (130) + GAP (12) = 142px
    expect(popover.style.left).toBe('142px');
  });
});
