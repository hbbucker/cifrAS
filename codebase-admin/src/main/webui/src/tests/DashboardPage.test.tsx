import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';

vi.mock('../api/adminApi', () => ({
  getDashboardMetrics: vi.fn().mockResolvedValue({
    totalUsers: 100,
    totalSongs: 500,
    activeSongs: 480,
    deletedSongs: 20,
    totalPlaylists: 80,
    songsCreatedToday: 5,
    songsCreatedThisMonth: 120,
    topArtists: { 'Legião Urbana': 40 },
    topKeys: { 'C': 150 },
  }),
  getRecentActivity: vi.fn().mockResolvedValue([
    {
      id: '1',
      type: 'SONG_CREATED',
      title: 'Tempo Perdido',
      description: 'Nova cifra cadastrada',
      actorId: 'user-1',
      timestamp: new Date().toISOString(),
    },
  ]),
}));

describe('DashboardPage', () => {
  it('renders dashboard metrics and title', async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(await screen.findByText('480')).toBeInTheDocument();
    expect(await screen.findByText('Tempo Perdido')).toBeInTheDocument();
  });
});
