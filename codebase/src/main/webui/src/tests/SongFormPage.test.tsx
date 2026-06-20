import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SongFormPage } from '../pages/SongFormPage';
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

describe('SongFormPage Component', () => {
 it('loads mock data when id is present in URL', async () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <BrowserRouter>
  <SongFormPage />
  </BrowserRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );
 
  // Expect the input to have loaded "Wonderwall" (id=1)
  await waitFor(() => {
    const titleInput = screen.getByTestId('song-title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('Wonderwall');
  });
 });
});
