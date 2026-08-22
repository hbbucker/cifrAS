import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SongViewPage } from '../pages/SongViewPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

vi.mock('react-router-dom', async () => {
 const actual = await vi.importActual('react-router-dom');
 return {
 ...actual as Record<string, unknown>,
 useParams: () => ({ id: '1' }),
 };
});

describe('SongViewPage Component', () => {
 it('loads correct mock song title based on id', async () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <BrowserRouter>
  <SongViewPage />
  </BrowserRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );
 
 // The default title in the buggy code is "I Took A Pill In Ibiza"
 // ID 1 should be Wonderwall
  expect(await screen.findByText('Wonderwall')).toBeInTheDocument();
 });

 it('shows FeatureDiscoveryModal when feature_discovery_03_seen is false or not set', async () => {
   // Clear local storage
   localStorage.clear();
   vi.useFakeTimers();

   render(
     <AuthProvider>
       <ThemeProvider>
         <ToastProvider>
           <BrowserRouter>
             <SongViewPage />
           </BrowserRouter>
         </ToastProvider>
       </ThemeProvider>
     </AuthProvider>
   );

   // Fast forward the timer to trigger the modal
   vi.advanceTimersByTime(1100);
   vi.useRealTimers();

   // The modal title should appear
   // The button text is "Entendi!", "Got it!", or "featureDiscovery.button"
   expect(await screen.findByText(/Entendi!|Got it!|featureDiscovery\.button/i)).toBeInTheDocument();
 });
});
