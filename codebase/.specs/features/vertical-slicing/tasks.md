# Tarefas de Implementação: Fatiamento Vertical

Este documento contém as tarefas atômicas planejadas para implementar o fatiamento vertical e a adoção de Strict Use Cases, conforme especificado em `spec.md` e `design.md`.

### [x] Task 1: Refatorar Domínio `Group` (Piloto)
- **What:** Fatiar `GroupService` em Strict Use Cases (ex: `CreateGroupUseCase`, `AddGroupMemberUseCase`) e `GroupResource` em resources menores. Deletar `GroupService`.
- **Where:** Pacotes `br.com.cifras.group.application.usecase.*` e `br.com.cifras.group.resource.*`. E testes associados.
- **Depends on:** N/A
- **Done when:** `GroupService` não existir mais. O `GroupResourceTest` e `GroupServiceTest` (que será renomeado/desmembrado) continuarem passando. Todas as rotas de grupo (`/groups/*`) delegarem para os novos Use Cases isolados.
- **Gate:** `mvn clean test -Dtest=GroupResourceTest,Group*Test` (PASSOU)

### [x] Task 2: Refatorar Domínio `Playlist`
- **What:** Fatiar `PlaylistService` em Use Cases isolados (`CreatePlaylistUseCase`, `AddSongToPlaylistUseCase`, etc) e fatiar o REST em `PlaylistResource` e `PlaylistSongResource`. Deletar `PlaylistService`.
- **Where:** Pacotes `br.com.cifras.playlist.application.usecase.*` e `br.com.cifras.playlist.resource.*`.
- **Depends on:** Task 1 (para validação do modelo piloto).
- **Done when:** `PlaylistService` não existir mais e os testes `PlaylistServiceTest` (ou equivalentes re-escritos) e `PlaylistCollaborationTest` continuarem verdes.
- **Gate:** `mvn clean test -Dtest=Playlist*Test` (PASSOU)

### [x] Task 3: Refatorar Domínio `Song`
- **What:** Fatiar `SongService` em Use Cases isolados. Diferente dos anteriores, `SongResource` não possui sub-recursos profundos no momento, mas ainda assim os Use Cases devem ser fatiados em `CreateSongUseCase`, `DeleteSongUseCase`, etc.
- **Where:** Pacotes `br.com.cifras.song.application.usecase.*` e `br.com.cifras.song.resource.*`.
- **Depends on:** N/A (pode ser paralelo à Task 2).
- **Done when:** `SongService` for apagado e os métodos do resource consumirem apenas Strict Use Cases.
- **Gate:** `mvn clean test -Dtest=Song*Test` (PASSOU)

### [x] Task 4: Refatorar Domínio `User` (Preferences)
- **What:** Remover a injeção indevida e anêmica de `UserPreferenceService` (corrigindo a manipulação indevida de setters), movendo a atualização para `UpdateUserPreferenceUseCase`. Fatiar o `UserResource` separando `/users/me/preferences` para um `UserPreferenceResource`.
- **Where:** Pacote `br.com.cifras.user.*`.
- **Depends on:** N/A
- **Done when:** Lógica de manipulação de tema/linguagem for estrita via domínio e exposta via `UpdateUserPreferenceUseCase`.
- **Gate:** `mvn test` geral para validar todos os módulos integrados. (PASSOU)
