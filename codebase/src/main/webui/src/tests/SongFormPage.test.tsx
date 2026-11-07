import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SongFormPage } from '../pages/SongFormPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { TourProvider } from '../context/TourContext';
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
  <TourProvider>
  <BrowserRouter>
  <SongFormPage />
  </BrowserRouter>
  </TourProvider>
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
           <TourProvider>
             <BrowserRouter>
               <SongFormPage />
             </BrowserRouter>
           </TourProvider>
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
            <TourProvider>
              <BrowserRouter>
                <SongFormPage />
              </BrowserRouter>
            </TourProvider>
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

  it('displays CoachMark onboarding tooltip for column marker and closes on dismiss', async () => {
    localStorage.clear();
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <BrowserRouter>
                <SongFormPage />
              </BrowserRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Quebra de Coluna/i)).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Quebra de Coluna/i)).not.toBeInTheDocument();
    });
  });

  it('displays CoachMark onboarding tooltip for fullscreen mode when column tour is seen', async () => {
    localStorage.clear();
    localStorage.setItem('tour_seen_song-editor-column-marker', 'true');

    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <BrowserRouter>
                <SongFormPage />
              </BrowserRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Modo Tela Cheia & Live Preview/i)).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Modo Tela Cheia & Live Preview/i)).not.toBeInTheDocument();
    });
  });

  it('renders fullscreen toggle button and opens/closes fullscreen modal on click', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <BrowserRouter>
                <SongFormPage />
              </BrowserRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    const toggleBtn = screen.getByTestId('btn-toggle-fullscreen');
    expect(toggleBtn).toBeInTheDocument();

    // Fullscreen modal should not be visible initially
    expect(screen.queryByTestId('song-editor-fullscreen-modal')).not.toBeInTheDocument();

    // Open fullscreen mode
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByTestId('song-editor-fullscreen-modal')).toBeInTheDocument();
    });

    // Type in fullscreen to verify onChange updates parent state
    const fullscreenInput = screen.getByTestId('fullscreen-content-input');
    fireEvent.change(fullscreenInput, { target: { value: 'Updated content from fullscreen' } });

    // Close fullscreen mode using restore button
    const restoreBtn = screen.getByTestId('fullscreen-restore-btn');
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('song-editor-fullscreen-modal')).not.toBeInTheDocument();
    });

    // Content in normal editor should reflect the change made in fullscreen
    const normalInput = screen.getByTestId('song-content-input') as HTMLTextAreaElement;
    expect(normalInput.value).toBe('Updated content from fullscreen');
  });

  it('allows saving song directly from fullscreen mode', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation((_url: RequestInfo | URL, init?: RequestInit) => {
      if (init && init.method === 'PUT') {
        return Promise.resolve(new Response(JSON.stringify({ id: 1, title: 'Wonderwall' }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ id: 1, title: 'Wonderwall', artist: 'Oasis', content: 'C G Em D' }), { status: 200 }));
    });

    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <BrowserRouter>
                <SongFormPage />
              </BrowserRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('song-title-input')).toHaveValue('Wonderwall');
    });

    // Open fullscreen
    fireEvent.click(screen.getByTestId('btn-toggle-fullscreen'));

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-save-btn')).toBeInTheDocument();
    });

    // Save from fullscreen
    fireEvent.click(screen.getByTestId('fullscreen-save-btn'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/songs/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});
