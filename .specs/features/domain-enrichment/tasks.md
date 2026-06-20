# Tasks: Refactoring to Rich Domain Model

Esta é a quebra detalhada para aplicar as regras da spec de enriquecimento em todo o backend.

## Task 1: O Agregado UserPreference e Enums Base
- **O quê:** Criar os Enums `Theme` e `Language` no pacote `user/model`. Alterar `UserPreference` para usar atributos privados, construtor-fábrica com regras de default e métodos como `updateTheme(Theme theme)`.
- **Depende de:** Nenhuma.
- **Artefatos afetados:** `Theme.java`, `Language.java`, `UserPreference.java`, `UserPreferenceService.java`, mappers associados (se existirem) e `UserPreferenceResource.java`.
- **Gate:** O backend deve compilar e o profile de usuário continuar funcionando.

## Task 2: O Agregado Song
- **O quê:** Encapsular as propriedades de `Song`. As preferências como `prefUseBb`, etc., devem ter métodos descritivos de alteração (`toggleFlatPreference(boolean useBb)`). 
- **Artefatos afetados:** `Song.java`, `SongService.java`, mappers, test suites.
- **Gate:** Compilação com sucesso e funcionalidade de Song preservada.

## Task 3: O Agregado Group e Convites
- **O quê:** O `Group` gerencia `GroupMember` e `GroupInvitation`. Tornar propriedades privadas. Criar métodos como `addMember(String userId, GroupRole role)`, `inviteUser(String email)`. Remover lógica de negócios do `GroupService`.
- **Artefatos afetados:** `Group.java`, `GroupMember.java`, `GroupInvitation.java`, `GroupService.java`, `GroupMapper.java` e possivelmente `InvitationMapper`.
- **Gate:** Os testes de integração de Groups (`GroupResourceTest`) devem continuar a passar após os ajustes.

## Task 4: O Agregado Playlist e Correção de Vazamento
- **O quê:** Resolver o vazamento de infraestrutura em `Playlist` removendo `GroupEntity` em favor de `Group` ou `UUID groupId`. Transformar propriedades de `Playlist` e `PlaylistSong` em privadas. Criar métodos `addSong(Song song, int position)`, `reorderSongs(...)`. Atualizar `PlaylistService`.
- **Artefatos afetados:** `Playlist.java`, `PlaylistSong.java`, `PlaylistService.java`, mappers associados.
- **Gate:** Compilação final e testes de ponta a ponta sem erros.
