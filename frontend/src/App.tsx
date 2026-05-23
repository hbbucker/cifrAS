import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SongsListPage } from './pages/SongsListPage';
import { SongFormPage } from './pages/SongFormPage';
import { SongViewPage } from './pages/SongViewPage';
import { PrivateRoute } from './components/auth/PrivateRoute';

import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistViewPage } from './pages/PlaylistViewPage';
import { TheaterModePage } from './pages/TheaterModePage';
import { SearchPage } from './pages/SearchPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { SharedWithMePage } from './pages/SharedWithMePage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/songs" element={<PrivateRoute><SongsListPage /></PrivateRoute>} />
      <Route path="/songs/new" element={<PrivateRoute><SongFormPage /></PrivateRoute>} />
      <Route path="/songs/edit/:id" element={<PrivateRoute><SongFormPage /></PrivateRoute>} />
      <Route path="/song/:id" element={<PrivateRoute><SongViewPage /></PrivateRoute>} />
      
      {/* Phase 4 Routes */}
      <Route path="/playlists" element={<PrivateRoute><PlaylistsPage /></PrivateRoute>} />
      <Route path="/playlists/:id" element={<PrivateRoute><PlaylistViewPage /></PrivateRoute>} />
      <Route path="/theater/:playlistId" element={<PrivateRoute><TheaterModePage /></PrivateRoute>} />
      <Route path="/theater/song/:songId" element={<PrivateRoute><TheaterModePage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />

      {/* Phase 5 Routes */}
      <Route path="/groups" element={<PrivateRoute><GroupsPage /></PrivateRoute>} />
      <Route path="/groups/:id" element={<PrivateRoute><GroupDetailsPage /></PrivateRoute>} />
      <Route path="/shared" element={<PrivateRoute><SharedWithMePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
