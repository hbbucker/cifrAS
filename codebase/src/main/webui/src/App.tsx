import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { SongsListPage } from './pages/SongsListPage';
import { SongFormPage } from './pages/SongFormPage';
import { SongViewPage } from './pages/SongViewPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { MainLayout } from './components/layout/MainLayout';

import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistViewPage } from './pages/PlaylistViewPage';
import { TheaterModePage } from './pages/TheaterModePage';
import { SearchPage } from './pages/SearchPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { SharedWithMePage } from './pages/SharedWithMePage';
import { SettingsPage } from './pages/SettingsPage';
import { GoogleCallbackPage } from './pages/settings/GoogleCallbackPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LandingPage } from './pages/LandingPage';
import { usePwaAutoUpdate } from './hooks/usePwaAutoUpdate';

function App() {
 usePwaAutoUpdate();

 return (
  <Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<Navigate to="/login" replace />} />
  <Route path="/auth/callback" element={<AuthCallbackPage />} />
  <Route path="/privacy" element={<PrivacyPage />} />
  
  {/* Protected Routes wrapped in MainLayout */}
  <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/songs" element={<SongsListPage />} />
    <Route path="/songs/new" element={<SongFormPage />} />
    <Route path="/songs/edit/:id" element={<SongFormPage />} />
    <Route path="/song/:id" element={<SongViewPage />} />
    
    {/* Phase 4 Routes */}
    <Route path="/playlists" element={<PlaylistsPage />} />
    <Route path="/playlists/:id" element={<PlaylistViewPage />} />
    <Route path="/search" element={<SearchPage />} />

    {/* Phase 5 Routes */}
    <Route path="/groups" element={<GroupsPage />} />
    <Route path="/groups/:id" element={<GroupDetailsPage />} />
    <Route path="/shared" element={<SharedWithMePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/settings/integrations/google-callback" element={<GoogleCallbackPage />} />
  </Route>

  {/* Theater mode routes (no layout shell) */}
  <Route path="/theater/:playlistId" element={<PrivateRoute><TheaterModePage /></PrivateRoute>} />
  <Route path="/theater/song/:songId" element={<PrivateRoute><TheaterModePage /></PrivateRoute>} />
  </Routes>
 );
}

export default App;
