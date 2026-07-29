import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../services/authService';

export interface PerformanceSession {
  playlistId: string;
  currentSongIndex: number;
  scrollPosition: number;
  updatedAt: string;
}

export const usePerformanceSession = () => {
  const [activeSession, setActiveSession] = useState<PerformanceSession | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchActiveSession = useCallback(async () => {
    try {
      const res = await apiClient.get<PerformanceSession>('/performance/sessions/active');
      if (res.status === 200 && res.data) {
        setActiveSession(res.data);
      } else {
        setActiveSession(null);
      }
    } catch {
      // Offline or missing session
      setActiveSession(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActiveSession();
  }, [fetchActiveSession]);

  const saveProgress = useCallback((playlistId: string, currentSongIndex: number, scrollPosition: number) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Update local state optimistic
    const now = new Date().toISOString();
    setActiveSession({ playlistId, currentSongIndex, scrollPosition, updatedAt: now });

    debounceTimer.current = setTimeout(async () => {
      try {
        await apiClient.patch('/performance/sessions/active', {
          playlistId,
          currentSongIndex,
          scrollPosition
        });
      } catch {
        // Silently fail on offline
      }
    }, 1000); // 1s debounce
  }, []);

  const clearSession = useCallback(async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    try {
      await apiClient.delete('/performance/sessions/active');
      setActiveSession(null);
    } catch {
      // Ignore
    }
  }, []);

  return { activeSession, saveProgress, clearSession, fetchActiveSession };
};
