import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CoachMark } from '../components/ui/CoachMark';
import { TourProvider, useTour } from '../context/TourContext';

const TestWrapper = ({ children, startTourId }: { children: React.ReactNode, startTourId?: string }) => {
  const Inner = () => {
    const { startTour } = useTour();
    React.useEffect(() => {
      if (startTourId) startTour(startTourId);
    }, [startTour]);
    return <>{children}</>;
  };

  return (
    <TourProvider>
      <Inner />
    </TourProvider>
  );
};

describe('CoachMark', () => {
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
});
