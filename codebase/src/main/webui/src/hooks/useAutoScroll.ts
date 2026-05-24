import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoScrollResult {
  isScrolling: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useAutoScroll = (initialSpeed = 3): AutoScrollResult => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeedState] = useState(initialSpeed); // 1-10 scale
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const fractionalScrollRef = useRef<number>(0);

  const play = useCallback(() => setIsScrolling(true), []);
  const pause = useCallback(() => setIsScrolling(false), []);
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(1, Math.min(10, newSpeed)));
  }, []);

  const animate = useCallback(
    function animateFn(time: number) {
      if (lastTimeRef.current !== undefined && containerRef.current) {
        const deltaTime = time - lastTimeRef.current;
        // Map speed 1-10 to pixels per second (e.g., speed 5 = ~25px/s)
        const pixelsPerSecond = speed * 5; 
        const scrollAmount = (pixelsPerSecond * deltaTime) / 1000;
        
        fractionalScrollRef.current += scrollAmount;
        
        if (fractionalScrollRef.current >= 1) {
          const pixelsToScroll = Math.floor(fractionalScrollRef.current);
          containerRef.current.scrollTop += pixelsToScroll;
          fractionalScrollRef.current -= pixelsToScroll;
        }
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateFn);
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

  // Manual scroll interruption has been removed as per user request


  return { isScrolling, speed, play, pause, setSpeed, containerRef };
};
