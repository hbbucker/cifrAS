import { useState, useEffect } from 'react';
import { getPendingSongShares } from '../api/songShares';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const usePendingSharesCount = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }

    let isMounted = true;

    const fetchCount = async () => {
      try {
        const pending = await getPendingSongShares();
        if (isMounted) {
          setCount(pending.length);
        }
      } catch {
        if (isMounted) {
          setCount(0);
        }
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, location.pathname]);

  return count;
};
