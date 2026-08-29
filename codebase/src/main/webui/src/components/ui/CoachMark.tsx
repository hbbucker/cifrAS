import React from 'react';
import { useTour } from '../../context/TourContext';
import { X } from 'lucide-react';

interface CoachMarkProps {
  children: React.ReactNode;
  tourId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const CoachMark: React.FC<CoachMarkProps> = ({ 
  children, 
  tourId, 
  title, 
  description,
  position = 'bottom'
}) => {
  const { activeTourId, endTour } = useTour();
  const isActive = activeTourId === tourId;

  if (!isActive) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
  };

  return (
    <div className="relative inline-block">
      <div className="relative z-10 ring-4 ring-[#aa3bff]/40 ring-offset-2 ring-offset-bg-main rounded-md animate-pulse">
        {children}
      </div>

      <div className={`absolute w-64 z-50 animate-in fade-in zoom-in-95 duration-300 ${positionClasses[position]}`}>
        <div className="relative bg-[#aa3bff] text-white p-4 rounded-md">
          <div className={`absolute w-4 h-4 bg-[#aa3bff] rotate-45 ${arrowClasses[position]}`} />
          
          <div className="relative flex justify-between items-start mb-2">
            <h4 className="font-bold text-sm leading-tight pr-4">{title}</h4>
            <button onClick={endTour} className="text-white/80 hover:text-white p-1 -mr-2 -mt-2 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-white/90 mb-3">{description}</p>
          <button 
            onClick={endTour}
            className="text-xs font-bold bg-white text-[#aa3bff] hover:bg-white/90 px-4 py-2 rounded-md transition-colors w-full"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
