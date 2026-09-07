import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

 it('renders the vertical line guide with 37ch mobile and 40ch desktop classes and non-blocking events', async () => {
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

   const lineGuide = screen.getByTestId('song-editor-line-guide');
   expect(lineGuide).toBeInTheDocument();
   expect(lineGuide.className).toContain('left-[37ch]');
   expect(lineGuide.className).toContain('sm:left-[40ch]');
   expect(lineGuide.className).toContain('pointer-events-none');
   expect(lineGuide.className).toContain('border-dashed');

   // Check that responsive guide labels are rendered
   expect(screen.getByText(/37/)).toBeInTheDocument();
   expect(screen.getByText(/40/)).toBeInTheDocument();
 });

  it('inserts [coluna] marker into editor when [Coluna] button is clicked', async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId('btn-insert-coluna')).toBeInTheDocument();
      expect(screen.getByTestId('song-title-input')).toHaveValue('Wonderwall');
    });

    const insertColunaBtn = screen.getByTestId('btn-insert-coluna');
    const contentInput = screen.getByTestId('song-content-input') as HTMLTextAreaElement;

    fireEvent.click(insertColunaBtn);

    await waitFor(() => {
      expect(contentInput.value).toContain('[coluna]');
    });
  });
});
