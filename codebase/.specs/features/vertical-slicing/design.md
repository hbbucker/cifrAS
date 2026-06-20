# Vertical Slicing & Strict Use Cases Architecture

## Objetivo
Eliminar o anti-pattern "God Services" e "God Controllers" em todo o sistema cifrAS. Garantir que cada classe tenha apenas uma responsabilidade (Single Responsibility Principle) através da adoção de "Strict Use Cases" acoplados a "Vertical Sliced Resources".

## Decisão Arquitetural (ADR)
1. **Fatiamento de Resources (REST):** Não teremos um único `GroupResource` gerenciando rotas desconexas. Os endpoints serão agrupados por semântica de recurso aninhado (Ex: `/groups/{id}/members` vai para `GroupMemberResource`).
2. **Use Cases ao invés de Services:** A camada de aplicação será composta por Use Cases que representam uma única operação de negócio. A interface de um Use Case terá um único método público (ex: `execute()`).
3. **Injeção Direta:** O Resource injeta diretamente o(s) Use Case(s) necessários para suas rotas. ZERO Factories ou Middle Men.

## Design do Domínio `Group` (Piloto)

### Resources (Controllers)
- `GroupResource`: `/groups` e `/groups/{id}`
- `GroupMemberResource`: `/groups/{id}/members` e `/groups/{id}/members/{userId}`
- `GroupPlaylistResource`: `/groups/{id}/playlists`
- `GroupInvitationResource`: `/groups/invitations`

### Use Cases (Application Layer)
**Management:**
- `CreateGroupUseCase`
- `GetGroupUseCase`
- `ListUserGroupsUseCase`
- `DeleteGroupUseCase`

**Membership:**
- `AddGroupMemberUseCase`
- `RemoveGroupMemberUseCase`

**Collaboration (Playlists):**
- `LinkGroupPlaylistUseCase`
- `UnlinkGroupPlaylistUseCase`
- `ListGroupPlaylistsUseCase`

**Invitations:**
- `SendGroupInvitationUseCase`
- `AcceptGroupInvitationUseCase`
- `DeclineGroupInvitationUseCase`
- `ListPendingInvitationsUseCase`

## Design do Domínio `Playlist`

### Resources
- `PlaylistResource`: `/playlists`
- `PlaylistSongResource`: `/playlists/{id}/songs`

### Use Cases
- `CreatePlaylistUseCase`
- `DeletePlaylistUseCase`
- `GetPlaylistUseCase`
- `AddSongToPlaylistUseCase`
- `RemoveSongFromPlaylistUseCase`
- `UpdatePlaylistSongPositionUseCase`

## Design do Domínio `Song`

### Resources
- `SongResource`: `/songs`

### Use Cases
- `CreateSongUseCase`
- `DeleteSongUseCase`
- `UpdateSongUseCase`
- `GetSongUseCase`
- `ListSongsUseCase`

## Design do Domínio `User`

### Resources
- `UserPreferenceResource`: `/users/me/preferences`

### Use Cases
- `UpdateUserPreferenceUseCase`
- `GetUserPreferenceUseCase`
