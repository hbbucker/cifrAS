import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TourProvider, useTour } from '../context/TourContext';

const TestComponent = () => {
  const { activeTourId, startTour, endTour, hasSeenTour } = useTour();
  
  return (
    <div>
      <span data-testid="active-tour">{activeTourId || 'none'}</span>
      <span data-testid="has-seen">{hasSeenTour('test-tour') ? 'yes' : 'no'}</span>
      <button onClick={() => startTour('test-tour')}>Start</button>
      <button onClick={endTour}>End</button>
    </div>
  );
};

describe('TourContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides context values and manages tour state', () => {
    render(
      <TourProvider>
        <TestComponent />
      </TourProvider>
    );
    
    expect(screen.getByTestId('active-tour').textContent).toBe('none');
    expect(screen.getByTestId('has-seen').textContent).toBe('no');
    
    act(() => {
      screen.getByText('Start').click();
    });
    
    expect(screen.getByTestId('active-tour').textContent).toBe('test-tour');
    
    act(() => {
      screen.getByText('End').click();
    });
    
    expect(screen.getByTestId('active-tour').textContent).toBe('none');
    expect(screen.getByTestId('has-seen').textContent).toBe('yes');
    expect(localStorage.getItem('tour_seen_test-tour')).toBe('true');
  });

  it('throws error when useTour is used outside of TourProvider', () => {
    // Suppress console.error for this expected error
    const originalError = console.error;
    console.error = () => {};
    
    expect(() => render(<TestComponent />)).toThrow('useTour must be used within a TourProvider');
    
    console.error = originalError;
  });
});
