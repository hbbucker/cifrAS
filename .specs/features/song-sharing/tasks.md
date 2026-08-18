# Tarefas de Implementação — Song Sharing 📋

## Backend (CTO)

- [x] **BE-01: Domínio e Modelo Rico**
  - Criar `SongShareStatus.java` (Enum: PENDING, ACCEPTED, DECLINED).
  - Criar `SongShare.java` (POJO de domínio com métodos `accept()` e `decline()`).
  - Adicionar método `createCloneForUser(Song original, String newUserId)` em `Song.java` (ou equivalente).
- [x] **BE-02: Persistência e Repositório**
  - Criar `SongShareEntity.java` (entidade JPA Panache mapeando tabela `song_shares`).
  - Criar `SongShareMapper.java` para conversão entre `SongShare` e `SongShareEntity`.
  - Criar `SongShareRepository.java` (Panache) com métodos para buscar pendentes por email e buscar por id.
- [x] **BE-03: Records DTO**
  - Criar `ShareSongRequestDTO.java` com anotações de Bean Validation (`@NotBlank`, `@Email`) e `@RegisterForReflection`.
  - Criar `SongShareResponseDTO.java` e `PendingSongShareItemDTO.java` com `@RegisterForReflection`.
- [x] **BE-04: Casos de Uso (Application Services)**
  - Implementar `ShareSongUseCase.java` (validações de propriedade, destinatário, duplicidade e auto-compartilhamento).
  - Implementar `ListPendingSongSharesUseCase.java` (retorna DTOs de convites pendentes com dados da música).
  - Implementar `AcceptSongShareUseCase.java` (cria cópia em `SongEntity`/`SongRepository` e marca status `ACCEPTED`).
  - Implementar `DeclineSongShareUseCase.java` (marca status `DECLINED`).
- [x] **BE-05: REST Resource / Controladores JAX-RS**
  - Criar `SongShareResource.java` (endpoints `POST /api/songs/{id}/share`, `GET /api/songs/shares/pending`, `POST /api/songs/shares/{shareId}/accept`, `POST /api/songs/shares/{shareId}/decline`).
- [x] **BE-06: Testes Automatizados (Unitários e Integração)**
  - Testes unitários para `SongShare`, `ShareSongUseCase`, `AcceptSongShareUseCase`, `DeclineSongShareUseCase`.
  - Testes de integração para `SongShareResource` com REST Assured.
  - Garantir cobertura JaCoCo no diff ≥ 90%.

---

## Frontend (Frontend Staff)

- [x] **FE-01: Tipagem e Cliente de API**
  - Criar interfaces TypeScript em `src/types/` ou `src/api/songShares.ts` (`ShareSongRequest`, `SongShareResponse`, `PendingSongShareItem`).
  - Criar funções de API em `src/api/songShares.ts` (`shareSong`, `getPendingSongShares`, `acceptSongShare`, `declineSongShare`).
- [x] **FE-02: Internacionalização (i18n)**
  - Adicionar chaves de tradução em `src/locales/pt-BR.json`, `src/locales/en.json`, `src/locales/es.json` cobrindo títulos, botões, mensagens de erro e toasts.
- [x] **FE-03: Componente `ShareSongModal.tsx`**
  - Criar modal acessível seguindo o Design System Pinterest-inspired (raio de 32px, botões 16px, CTA Purple Primary `#aa3bff`, backdrop com 50% de opacidade).
  - Estados: normal, loading, feedback de erro e sucesso.
- [x] **FE-04: Integração nas Telas de Músicas**
  - Adicionar botão "Compartilhar" em `SongViewPage.tsx` e nas ações de card em `SongsListPage.tsx`.
  - Atualizar `SharedWithMePage.tsx` para exibir a seção "Músicas Recebidas" (com cards exibindo remetente, botões Aceitar/Recusar, loading e empty states) ao lado das playlists compartilhadas.
- [x] **FE-05: Testes Frontend (Unitários e E2E)**
  - Testes de componentes com Vitest para `ShareSongModal.tsx` e `SharedWithMePage.tsx`.
  - Testes E2E com Playwright cobrindo os Acceptance Criteria AC-01 a AC-08.
  - Garantir cobertura Vitest no diff ≥ 90%.
