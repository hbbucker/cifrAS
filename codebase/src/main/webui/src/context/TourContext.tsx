import React, { createContext, useContext, useState } from 'react';

interface TourContextType {
  activeTourId: string | null;
  startTour: (tourId: string) => void;
  endTour: () => void;
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

  const hasSeenTour = (tourId: string) => {
    return localStorage.getItem(`tour_seen_${tourId}`) === 'true';
  };

  return (
    <TourContext.Provider value={{ activeTourId, startTour, endTour, hasSeenTour }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
