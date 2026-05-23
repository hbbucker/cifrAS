import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoScrollResult {
  isScrolling: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useAutoScroll = (initialSpeed = 3): AutoScrollResult => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeedState] = useState(initialSpeed); // 1-10 scale
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const play = useCallback(() => setIsScrolling(true), []);
  const pause = useCallback(() => setIsScrolling(false), []);
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(1, Math.min(10, newSpeed)));
  }, []);

  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current !== undefined && containerRef.current) {
        const deltaTime = time - lastTimeRef.current;
        // Map speed 1-10 to pixels per second (e.g., speed 5 = ~25px/s)
        const pixelsPerSecond = speed * 5; 
        const scrollAmount = (pixelsPerSecond * deltaTime) / 1000;
        
        containerRef.current.scrollTop += scrollAmount;
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [speed]
  );

  useEffect(() => {
    if (isScrolling) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = undefined;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isScrolling, animate]);

  // Handle manual touch drag to halt
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => {
      if (isScrolling) {
        pause();
      }
    };

    const handleWheel = () => {
       if (isScrolling) {
         pause();
       }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isScrolling, pause]);

  return { isScrolling, speed, play, pause, setSpeed, containerRef };
};
