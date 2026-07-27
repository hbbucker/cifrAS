import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
 const actual = await vi.importActual('react-router-dom');
 return {
 ...actual as Record<string, unknown>,
 useNavigate: () => mockNavigate,
 };
});

const mockSongs = [
  { id: '1', title: 'Song 1', artist: 'Artist 1', isFavorite: true, categories: [] }
];

globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockSongs),
  } as Response)
);

describe('DashboardPage Component', () => {
 it('navigates to song edit when edit action is clicked', async () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <BrowserRouter>
  <DashboardPage />
  </BrowserRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );

 // Wait for mock data to load
 const menuBtn = await screen.findAllByTestId('menu-btn', {}, { timeout: 2000 });
 fireEvent.click(menuBtn[0]);
 
 const editBtn = screen.getAllByText('musicCard.edit')[0];
 fireEvent.click(editBtn);
 
 expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/songs/edit/'));
 });

 it('navigates to song view when card is clicked', async () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <BrowserRouter>
  <DashboardPage />
  </BrowserRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );

 const viewDivs = await screen.findAllByTestId(/view-song-/i, {}, { timeout: 2000 });
 fireEvent.click(viewDivs[0]);
 expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/song/'));
 });
});
