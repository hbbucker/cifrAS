# Group Shared Playlists Design

**Spec**: `.specs/features/group-shared-playlists/spec.md`
**Status**: Approved

---

## Architecture Overview

A funcionalidade utiliza a estrutura existente da entidade `Playlist`, que já possui o campo `group_id` (ManyToOne com `Group`). 
O relacionamento será 1:N (um grupo tem várias playlists, mas uma playlist só pode ser vinculada a um grupo por vez - aceitável para MVP). 

```mermaid
graph TD
    A[Admin] -->|Vincular Playlist Pessoal| B(GroupResource)
    B --> C{GroupService}
    C -->|Update playlist.group_id| D[(Database)]
    E[Membro] -->|GET /groups/{id}/playlists| B
    B --> C
    C -->|Fetch playlists| D
    E -->|GET /playlists/{id}| F(PlaylistResource)
    F --> G{PlaylistService}
    G -->|Permite leitura se membro| D
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --- | --- | --- |
| `Playlist` Entity | `backend/.../playlist/domain/Playlist.java` | Já possui o relacionamento com `Group`. Apenas preencher o `group`. |
| `PlaylistService` | `backend/.../playlist/service/PlaylistService.java` | Atualizar métodos de validação de acesso (permitir leitura para membros do grupo). |
| `PlaylistCard` | `frontend/src/components/...` | Reutilizar para listar as playlists dentro da página do grupo. |
| `PlaylistViewPage` | `frontend/src/pages/PlaylistViewPage.tsx` | Já existe, só precisa de renderização condicional para esconder botões de edição se o usuário não for o dono. |
| `TheaterMode` | `frontend/src/pages/TheaterModePage.tsx` | A ser acionado a partir da playlist (já está integrado em partes ou precisa do botão exposto na `PlaylistViewPage`). |

### Integration Points

| System | Integration Method |
| --- | --- |
| Backend Endpoints | Novos endpoints no `GroupResource` para gerenciar as playlists do grupo. |

---

## Components

### Backend: `GroupResource` & `GroupService`
- **Purpose**: Gerenciar a associação de playlists ao grupo.
- **Location**: `backend/src/main/java/br/com/cifras/group/`
- **Interfaces**:
  - `POST /groups/{id}/playlists` -> Recebe `PlaylistId`.
  - `GET /groups/{id}/playlists` -> Retorna lista de playlists vinculadas.
  - `DELETE /groups/{id}/playlists/{playlistId}` -> Desvincula.
- **Dependencies**: `PlaylistRepository`, `GroupRepository`, `GroupMemberRepository`.
- **Reuses**: Validação de owner do grupo no `GroupService`.

### Backend: `PlaylistService`
- **Purpose**: Adaptar segurança de leitura.
- **Location**: `backend/src/main/java/br/com/cifras/playlist/service/PlaylistService.java`
- **Interfaces**:
  - Modificar `getById` para permitir o retorno se o usuário for membro do `group` associado à playlist.
  - Modificar `addSong`, `removeSong`, `reorder` para garantir que apenas o `userId` (dono original) consiga editar, mesmo que a playlist seja colaborativa.

### Frontend: `GroupPlaylistsSection`
- **Purpose**: Componente para exibir as playlists na página do grupo e o botão de vincular.
- **Location**: `frontend/src/features/groups/components/GroupPlaylistsSection.tsx`

### Frontend: `LinkPlaylistModal`
- **Purpose**: Modal para o admin selecionar uma de suas playlists e vincular ao grupo.
- **Location**: `frontend/src/features/groups/components/LinkPlaylistModal.tsx`

### Frontend: `PlaylistViewPage` (Atualização)
- **Purpose**: Exibir a playlist de forma read-only para não-donos.
- **Location**: `frontend/src/pages/PlaylistViewPage.tsx`
- **Modifications**:
  - Habilitar condicional `isOwner = playlist.userId === currentUser.id`.
  - Esconder "Adicionar Música" e Drag-and-drop se `!isOwner`.
  - Garantir que o botão "Modo Teatro" (Performar) está visível para todos.

---

## Data Models

Nenhuma alteração de schema necessária! O campo `group_id` na entidade `Playlist` já existe.

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| --- | --- | --- |
| Membro (não-admin) tenta vincular playlist | Retornar `403 Forbidden` | UI não exibe o botão. Se forçada via API, erro amigável. |
| Membro (não-dono) tenta editar playlist compartilhada | Retornar `403 Forbidden` no `PlaylistService` | UI bloqueia. Se forçado, erro "Apenas o criador pode editar". |
| Playlist vinculada é deletada pelo dono | JPA Cascade ou remoção via Service | Playlist some automaticamente do grupo. |
