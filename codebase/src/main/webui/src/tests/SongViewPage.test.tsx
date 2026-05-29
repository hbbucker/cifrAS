import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SongViewPage } from '../pages/SongViewPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
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
 <BrowserRouter>
 <SongViewPage />
 </BrowserRouter>
 </AuthProvider>
 );
 
 // The default title in the buggy code is "I Took A Pill In Ibiza"
 // ID 1 should be Wonderwall
 expect(screen.getByText('Wonderwall')).toBeInTheDocument();
 });
});
