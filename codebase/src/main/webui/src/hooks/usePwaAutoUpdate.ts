import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isSafeToUpdate, setupServiceWorkerAutoUpdate, setupViteChunkErrorRecovery } from '../utils/pwaUpdate';

export function usePwaAutoUpdate() {
  const location = useLocation();

  useEffect(() => {
    const cleanupChunkRecovery = setupViteChunkErrorRecovery();
    const cleanupPwaUpdate = setupServiceWorkerAutoUpdate();

    return () => {
      cleanupChunkRecovery();
      cleanupPwaUpdate();
    };
  }, []);

  // When location changes, if safe to update, dispatches a location check event
  useEffect(() => {
    if (isSafeToUpdate(location.pathname)) {
      window.dispatchEvent(new Event('popstate'));
    }
  }, [location.pathname]);
}
