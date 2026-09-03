import React, { createContext, useContext, useState } from 'react';

interface TourContextType {
  activeTourId: string | null;
  startTour: (tourId: string) => void;
  endTour: () => void;
  nextTour: (nextTourId: string) => void;
  hasSeenTour: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  const startTour = (tourId: string) => {
    if (!hasSeenTour(tourId)) {
      setActiveTourId(tourId);
    }
  };

  const endTour = () => {
    if (activeTourId) {
      localStorage.setItem(`tour_seen_${activeTourId}`, 'true');
      setActiveTourId(null);
    }
  };

  const nextTour = (nextTourId: string) => {
    if (activeTourId) {
      localStorage.setItem(`tour_seen_${activeTourId}`, 'true');
    }
    if (!hasSeenTour(nextTourId)) {
      setActiveTourId(nextTourId);
    } else {
      setActiveTourId(null);
    }
  };

  const hasSeenTour = (tourId: string) => {
    return localStorage.getItem(`tour_seen_${tourId}`) === 'true';
  };

  return (
    <TourContext.Provider value={{ activeTourId, startTour, endTour, nextTour, hasSeenTour }}>
      {children}
    </TourContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
