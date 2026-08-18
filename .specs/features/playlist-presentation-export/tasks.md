# Tasks — Playlist Presentation Export (.pptx)

- [x] **Task 1: Backend DTO Enrichment**
  - **What**: Atualizar `PlaylistSongDTO` para incluir o campo `LyricsStructure lyrics` e refletir o valor em `PlaylistSongDTO.from(ps)`.
  - **Where**: `codebase/src/main/java/br/com/cifras/playlist/dto/PlaylistSongDTO.java` e testes em `PlaylistResourceTest.java`.
  - **Done criteria**: Testes de backend executados e passando com o campo lyrics presente (162 testes OK).

- [x] **Task 2: Frontend Dependency & Types**
  - **What**: Instalar dependência `pptxgenjs` no `webui` e atualizar tipagens TypeScript de `PlaylistSong`.
  - **Where**: `codebase/src/main/webui/package.json` e `codebase/src/main/webui/src/utils/presentationGenerator.ts`.
  - **Done criteria**: `npm install pptxgenjs` e build limpo.

- [x] **Task 3: Presentation Generator Utility**
  - **What**: Implementar `presentationGenerator.ts` com funções `generatePlaylistPresentation` e `exportCleanLyricsText`.
  - **Where**: `codebase/src/main/webui/src/utils/presentationGenerator.ts`.
  - **Done criteria**: Suíte de testes unitários `presentationGenerator.test.ts` cobrindo 100% dos cenários.

- [x] **Task 4: Export Presentation Modal Component**
  - **What**: Criar o componente `ExportPlaylistPresentationModal.tsx` com seleção de músicas, seletor de tema, checkboxes de abertura/título e ações de download/cópia.
  - **Where**: `codebase/src/main/webui/src/components/modals/ExportPlaylistPresentationModal.tsx`.
  - **Done criteria**: Testes com Vitest/React Testing Library `ExportPlaylistPresentationModal.test.tsx` cobrindo 100% dos fluxos.

- [x] **Task 5: Integration in PlaylistViewPage & i18n Translations**
  - **What**: Adicionar o botão *"Gerar Slides"* em `PlaylistViewPage.tsx` e incluir as chaves de tradução em `pt-BR`, `en`, `es`.
  - **Where**: `codebase/src/main/webui/src/pages/PlaylistViewPage.tsx` e `codebase/src/main/webui/src/locales/`.
  - **Done criteria**: Botão visível para playlists privadas e colaborativas com integração fluida ao modal.

- [x] **Task 6: QA Verification & Release Handoff**
  - **What**: Executar suíte completa de testes no backend (`./mvnw test`) e frontend (`npm run test && npm run lint`), verificando cobertura $\ge 90\%$ no diff.
  - **Where**: `codebase/`.
  - **Done criteria**: QA Lead aprovou com relatório formal de release (`validation-report.md`).
