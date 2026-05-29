export const linkPlaylist = async (groupId: string, playlistId: string): Promise<void> => {
 const token = localStorage.getItem('token');
 const res = await fetch(`/api/groups/${groupId}/playlists`, {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ playlistId })
 });

 if (!res.ok) {
 throw new Error('Failed to link playlist');
 }
};

export const getGroupPlaylists = async (groupId: string): Promise<Record<string, unknown>[]> => {
 const token = localStorage.getItem('token');
 const res = await fetch(`/api/groups/${groupId}/playlists`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 });

 if (!res.ok) {
 throw new Error('Failed to fetch group playlists');
 }

 return res.json();
};

export const unlinkPlaylist = async (groupId: string, playlistId: string): Promise<void> => {
 const token = localStorage.getItem('token');
 const res = await fetch(`/api/groups/${groupId}/playlists/${playlistId}`, {
 method: 'DELETE',
 headers: {
 'Authorization': `Bearer ${token}`
 }
 });

 if (!res.ok) {
 throw new Error('Failed to unlink playlist');
 }
};
