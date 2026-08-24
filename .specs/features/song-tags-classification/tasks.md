# Tarefas de Implementação — Classificação de Músicas por Tags 📋

## Fase 1: Backend & Banco de Dados (CTO)
- [x] **Task 1.1:** Criar script de migração `V20260824_01__add_song_tags_and_gin_index.sql` e atualizar `import.sql`.
- [x] **Task 1.2:** Atualizar `SongEntity`, `Song`, `SongMapper` para incluir o atributo `tags` (List<String>).
- [x] **Task 1.3:** Atualizar `SongDTO`, `SongSummaryDTO`, `CreateSongRequest`, `UpdateSongRequest` e criar `TagCountDTO`.
- [x] **Task 1.4:** Atualizar `SongRepository` para suportar filtros por tags (com GIN e queries nativas) e consulta de agregações de tags por usuário (`getUserTagsWithCount`).
- [x] **Task 1.5:** Criar Use Case `GetUserTagsUseCase` e atualizar `ListUserSongsUseCase`, `CreateSongUseCase`, `UpdateSongUseCase` com normalização de tags.
- [x] **Task 1.6:** Atualizar `SongResource` com o endpoint `GET /api/songs/tags` e parâmetro `@QueryParam("tags") List<String> tags` em `GET /api/songs`.
- [x] **Task 1.7:** Criar e atualizar testes unitários e de integração no backend para atingir ≥ 90% de cobertura no diff.

## Fase 2: Frontend & UX (Frontend Staff)
- [x] **Task 2.1:** Atualizar tipos TypeScript (`SongData`, `TagCount`) e cliente API `src/api/songs.ts` para suportar `tags` e `getUserTags`.
- [x] **Task 2.2:** Criar componente `TagInput` com suporte a autocomplete, criação por Enter/vírgula, remoção por Backspace/ícone e estilo Pinterest.
- [x] **Task 2.3:** Criar componente `TagFilterBar` com rolagem horizontal e chips de contagem de tags.
- [x] **Task 2.4:** Integrar `TagInput` no formulário de música (`SongFormPage`).
- [x] **Task 2.5:** Integrar `TagFilterBar` na listagem de músicas (`SongsListPage`).
- [x] **Task 2.6:** Atualizar `MusicCard` para exibir as tags com estilo e limite visual limpo.
- [x] **Task 2.7:** Adicionar filtro por tags no modal de adicionar músicas à playlist em `PlaylistViewPage`.
- [x] **Task 2.8:** Adicionar chaves de internacionalização i18n (`pt-BR`, `en`, `es`).
- [x] **Task 2.9:** Criar testes unitários com Vitest para `TagInput` e `TagFilterBar` cobrindo ≥ 90% no diff.

## Fase 3: Validação & Cobertura (QA Lead)
- [x] **Task 3.1:** Executar suite completa de testes de backend e frontend.
- [x] **Task 3.2:** Verificar relatório de cobertura (Diff Coverage ≥ 90%).
- [x] **Task 3.3:** Validar conformidade com todos os Acceptance Criteria (AC-01 a AC-08).
