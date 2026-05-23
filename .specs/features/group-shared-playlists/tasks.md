# Group Shared Playlists Tasks

**Design**: `.specs/features/group-shared-playlists/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Backend Core (Parallel OK)

```
  ┌→ T1 (Group Endpoints) ─┐
──┼────────────────────────┼──→
  └→ T2 (Playlist Security)┘
```

### Phase 2: Frontend API (Sequential)

```
T1, T2 ──→ T3 (Frontend API)
```

### Phase 3: Frontend Components (Parallel OK)

```
       ┌→ T4 (Modal) ──→ T5 (Section) ┐
T3 ────┼──────────────────────────────┼──→ DONE
       └→ T6 (Playlist View Updates) ─┘
```

---

## Task Breakdown

### T1: Add Group Playlist Endpoints (Backend) [P]

**What**: Adicionar endpoints POST, GET e DELETE em `GroupResource` e lógica no `GroupService` para vincular/desvincular playlists.
**Where**: `backend/src/main/java/br/com/cifras/group/resource/GroupResource.java` e `backend/src/main/java/br/com/cifras/group/service/GroupService.java`
**Depends on**: None
**Reuses**: Padrões de endpoints existentes no `GroupResource`.
**Requirement**: GRP-PLAY-01, GRP-PLAY-02, GRP-PLAY-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] Endpoints `/groups/{id}/playlists` criados e integrados ao Service.
- [x] `GroupService` verifica se usuário é dono do grupo antes de vincular/desvincular.
- [x] Gate check passes: `mvn test`
- [x] Test count: testes passam sem quebrar build.

**Tests**: unit
**Gate**: `mvn test` no backend

**Status**: ✅ Complete

---

### T2: Update Playlist Security (Backend) [P]

**What**: Alterar `PlaylistService` para permitir que membros do grupo leiam a playlist, mas apenas o criador possa editar (add/remove song, reorder).
**Where**: `backend/src/main/java/br/com/cifras/playlist/service/PlaylistService.java`
**Depends on**: None
**Reuses**: `GroupMemberRepository` para validar se usuário está no grupo.
**Requirement**: GRP-PLAY-02, GRP-PLAY-05

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] `getById` retorna a playlist caso ela tenha `group_id` e o `userId` logado seja membro desse grupo.
- [x] `addSong`, `removeSong`, `reorder` lançam Forbidden se o usuário não for o dono (`playlist.userId != userId`).
- [x] Gate check passes: `mvn test`
- [x] Test count: testes passam sem quebrar build.

**Tests**: unit
**Gate**: `mvn test` no backend

**Status**: ✅ Complete

---

### T3: Create Frontend API wrappers

**What**: Criar as funções no arquivo de API para gerenciar playlists do grupo.
**Where**: `frontend/src/api/groups.ts` (ou equivalente)
**Depends on**: T1, T2
**Reuses**: Instância do axios configurada.
**Requirement**: GRP-PLAY-01, GRP-PLAY-02, GRP-PLAY-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] Funções `linkPlaylist`, `unlinkPlaylist` e `getGroupPlaylists` exportadas corretamente.
- [x] Nomes de rota compatíveis com T1.
- [x] Gate check passes: `npm run lint` ou build rápido

**Tests**: none
**Gate**: quick

**Status**: ✅ Complete

---

### T4: Create LinkPlaylistModal Component [P]

**What**: Modal para listar playlists pessoais do usuário logado e permitir selecionar uma para vincular ao grupo.
**Where**: `frontend/src/features/groups/components/LinkPlaylistModal.tsx`
**Depends on**: T3
**Reuses**: Componentes de Modal/Dialog e listagem do Chakra/Tailwind usados no app.
**Requirement**: GRP-PLAY-01

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] Renderiza lista de playlists do usuário e chama `linkPlaylist` na seleção.
- [x] Gate check passes: `npm run test`
- [x] Test count: testes não foram deletados.

**Tests**: unit
**Gate**: quick

**Status**: ✅ Complete

---

### T5: Create GroupPlaylistsSection Component

**What**: Seção na página do grupo para listar playlists vinculadas, com opção de remover e adicionar (se admin).
**Where**: `frontend/src/features/groups/components/GroupPlaylistsSection.tsx` e atualização em `GroupDetailsPage`.
**Depends on**: T4
**Reuses**: `PlaylistCard` existente.
**Requirement**: GRP-PLAY-02, GRP-PLAY-04

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] Listagem de playlists compartilhadas consumindo `getGroupPlaylists`.
- [x] Modal do T4 renderizado e acionado por um botão "Compartilhar Playlist".
- [x] Funcionalidade de desvincular funcionando.
- [x] Gate check passes: `npm run test`

**Tests**: unit
**Gate**: quick

**Status**: ✅ Complete

---

### T6: Update PlaylistViewPage [P]

**What**: Alterar a visualização da playlist para ocultar botões de edição de quem não é o dono e focar no Modo Teatro.
**Where**: `frontend/src/pages/PlaylistViewPage.tsx`
**Depends on**: T3
**Reuses**: Renderização condicional padrão (`isOwner = ...`).
**Requirement**: GRP-PLAY-03, GRP-PLAY-05

**Tools**:
- MCP: `filesystem`
- Skill: NONE

**Done when**:
- [x] Botões de Drag & Drop desabilitados ou ocultos para não-donos.
- [x] Botão "Adicionar música" oculto para não-donos.
- [x] Botão de "Performar / Modo Teatro" continua visível.
- [x] Gate check passes: `npm run test`

**Tests**: integration
**Gate**: quick

**Status**: ✅ Complete

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | Endpoints GroupResource | ✅ Granular |
| T2 | Lógica PlaylistService | ✅ Granular |
| T3 | API definitions | ✅ Granular |
| T4 | LinkPlaylistModal component | ✅ Granular |
| T5 | GroupPlaylistsSection component | ✅ Granular |
| T6 | PlaylistViewPage update | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | None | ✅ Match |
| T2 | None | None | ✅ Match |
| T3 | T1, T2 | T1, T2 -> T3 | ✅ Match |
| T4 | T3 | T3 -> T4 | ✅ Match |
| T5 | T4 | T4 -> T5 | ✅ Match |
| T6 | T3 | T3 -> T6 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Backend Endpoint | unit (backend) | unit | ✅ OK |
| T2 | Backend Service | unit (backend) | unit | ✅ OK |
| T3 | Frontend API calls | none | none | ✅ OK |
| T4 | UI Component | unit | unit | ✅ OK |
| T5 | UI Component | unit | unit | ✅ OK |
| T6 | Page | integration | integration | ✅ OK |
