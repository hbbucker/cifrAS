export interface AdminDashboardMetrics {
  totalUsers: number;
  totalSongs: number;
  activeSongs: number;
  deletedSongs: number;
  totalPlaylists: number;
  songsCreatedToday: number;
  songsCreatedThisMonth: number;
  topArtists: Record<string, number>;
  topKeys: Record<string, number>;
}

export interface RecentActivity {
  id: string;
  type: 'SONG_CREATED' | 'SONG_DELETED' | 'SONG_RESTORED' | 'USER_REGISTERED';
  title: string;
  description: string;
  actorId: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'ACTIVE' | 'BLOCKED';
  isBlocked: boolean;
  lastBlockReason?: string;
  createdAt: string;
  lastSignInAt?: string;
  updatedAt?: string;
  songCount: number;
  banned: boolean;
  isAdmin: boolean;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  adminId: string;
  adminEmail: string;
  action: 'BLOCK' | 'UNBLOCK';
  reason: string;
  previousStatus: string;
  newStatus: string;
  createdAt: string;
}

export interface AdminSong {
  id: string;
  userId: string;
  authorEmail?: string;
  authorName?: string;
  title: string;
  artist: string;
  originalKey?: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  isDeleted: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalElements: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
