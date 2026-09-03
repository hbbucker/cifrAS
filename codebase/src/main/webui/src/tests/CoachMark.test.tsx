import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
});
