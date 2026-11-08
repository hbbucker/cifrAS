import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTour } from '../../context/TourContext';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface CoachMarkProps {
  children: React.ReactNode;
  tourId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  confirmText?: string;
  nextTourId?: string;
}

export const CoachMark: React.FC<CoachMarkProps> = ({ 
  children, 
  tourId, 
  title, 
  description, 
  position = 'bottom',
  confirmText,
  nextTourId
}) => {
  const { t } = useTranslation();
  const { activeTourId, endTour, nextTour } = useTour();
  const isActive = activeTourId === tourId;

  const targetRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
    arrowLeft?: number;
    arrowTop?: number;
  }>({
    top: 0,
    left: 0,
    placement: position,
  });

  const updatePosition = useCallback(() => {
    if (!targetRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const popoverEl = popoverRef.current;
    const popoverWidth = (popoverEl && popoverEl.offsetWidth > 0) ? popoverEl.offsetWidth : 256;
    const popoverHeight = (popoverEl && popoverEl.offsetHeight > 0) ? popoverEl.offsetHeight : 160;

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 768;

    const PADDING = 12;
    const GAP = 12;

    let effectivePlacement = position;

    // Auto-flip logic if overflowing preferred direction
    if (position === 'bottom') {
      const wouldOverflowBottom = targetRect.bottom + GAP + popoverHeight > viewportHeight - PADDING;
      const hasTopSpace = targetRect.top - GAP - popoverHeight >= PADDING;
      if (wouldOverflowBottom && hasTopSpace) {
        effectivePlacement = 'top';
      }
    } else if (position === 'top') {
      const wouldOverflowTop = targetRect.top - GAP - popoverHeight < PADDING;
      const hasBottomSpace = targetRect.bottom + GAP + popoverHeight <= viewportHeight - PADDING;
      if (wouldOverflowTop && hasBottomSpace) {
        effectivePlacement = 'bottom';
      }
    } else if (position === 'left') {
      const wouldOverflowLeft = targetRect.left - GAP - popoverWidth < PADDING;
      const hasRightSpace = targetRect.right + GAP + popoverWidth <= viewportWidth - PADDING;
      if (wouldOverflowLeft && hasRightSpace) {
        effectivePlacement = 'right';
      } else if (wouldOverflowLeft && !hasRightSpace) {
        effectivePlacement = targetRect.bottom + GAP + popoverHeight <= viewportHeight - PADDING ? 'bottom' : 'top';
      }
    } else if (position === 'right') {
      const wouldOverflowRight = targetRect.right + GAP + popoverWidth > viewportWidth - PADDING;
      const hasLeftSpace = targetRect.left - GAP - popoverWidth >= PADDING;
      if (wouldOverflowRight && hasLeftSpace) {
        effectivePlacement = 'left';
      } else if (wouldOverflowRight && !hasLeftSpace) {
        effectivePlacement = targetRect.bottom + GAP + popoverHeight <= viewportHeight - PADDING ? 'bottom' : 'top';
      }
    }

    let rawTop = 0;
    let rawLeft = 0;

    if (effectivePlacement === 'top') {
      rawTop = targetRect.top - popoverHeight - GAP;
      rawLeft = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    } else if (effectivePlacement === 'bottom') {
      rawTop = targetRect.bottom + GAP;
      rawLeft = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    } else if (effectivePlacement === 'left') {
      rawLeft = targetRect.left - popoverWidth - GAP;
      rawTop = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
    } else if (effectivePlacement === 'right') {
      rawLeft = targetRect.right + GAP;
      rawTop = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
    }

    // Clamp coordinates strictly within viewport bounds with safe padding
    const maxLeft = Math.max(PADDING, viewportWidth - popoverWidth - PADDING);
    const maxTop = Math.max(PADDING, viewportHeight - popoverHeight - PADDING);
    const clampedLeft = Math.max(PADDING, Math.min(rawLeft, maxLeft));
    const clampedTop = Math.max(PADDING, Math.min(rawTop, maxTop));

    // Calculate relative arrow position pointing toward target center
    let arrowLeft: number | undefined;
    let arrowTop: number | undefined;

    if (effectivePlacement === 'top' || effectivePlacement === 'bottom') {
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const relativeX = targetCenterX - clampedLeft;
      arrowLeft = Math.max(16, Math.min(relativeX - 7, popoverWidth - 24));
    } else {
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const relativeY = targetCenterY - clampedTop;
      arrowTop = Math.max(16, Math.min(relativeY - 7, popoverHeight - 24));
    }

    setCoords({
      top: clampedTop,
      left: clampedLeft,
      placement: effectivePlacement,
      arrowLeft,
      arrowTop,
    });
  }, [position]);

  useEffect(() => {
    if (!isActive) return;

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, updatePosition]);

  if (!isActive) return <>{children}</>;

  const handleConfirm = () => {
    if (nextTourId) {
      nextTour(nextTourId);
    } else {
      endTour();
    }
  };

  const defaultButtonText = nextTourId ? t('common.next', 'Próximo') : t('common.gotIt', 'Entendi');

  const getArrowStyle = (): React.CSSProperties => {
    if (coords.placement === 'top') {
      return {
        bottom: -6,
        left: coords.arrowLeft !== undefined ? `${coords.arrowLeft}px` : 'calc(50% - 7px)',
      };
    }
    if (coords.placement === 'bottom') {
      return {
        top: -6,
        left: coords.arrowLeft !== undefined ? `${coords.arrowLeft}px` : 'calc(50% - 7px)',
      };
    }
    if (coords.placement === 'left') {
      return {
        right: -6,
        top: coords.arrowTop !== undefined ? `${coords.arrowTop}px` : 'calc(50% - 7px)',
      };
    }
    return {
      left: -6,
      top: coords.arrowTop !== undefined ? `${coords.arrowTop}px` : 'calc(50% - 7px)',
    };
  };

  const popoverContent = (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        maxWidth: 'calc(100vw - 24px)',
      }}
      className="w-64 z-[9999] animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="relative bg-[#aa3bff] text-white p-4 rounded-md shadow-md">
        <div
          className="absolute w-3.5 h-3.5 bg-[#aa3bff] rotate-45 pointer-events-none"
          style={getArrowStyle()}
        />
        
        <div className="relative flex justify-between items-start mb-2">
          <h4 className="font-bold text-sm leading-tight pr-4">{title}</h4>
          <button 
            onClick={endTour} 
            className="text-white/80 hover:text-white p-1 -mr-2 -mt-2 shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-white/90 mb-3">{description}</p>
        <button 
          onClick={handleConfirm}
          className="text-xs font-bold bg-white text-[#aa3bff] hover:bg-white/90 px-4 py-2 rounded-md transition-colors w-full cursor-pointer"
        >
          {confirmText || defaultButtonText}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={targetRef} className="relative inline-block">
      <div className="relative z-10 ring-4 ring-[#aa3bff]/40 ring-offset-2 ring-offset-bg-main rounded-md animate-pulse">
        {children}
      </div>

      {typeof document !== 'undefined' ? createPortal(popoverContent, document.body) : popoverContent}
    </div>
  );
};
