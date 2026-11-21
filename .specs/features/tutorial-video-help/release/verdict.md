# Parecer de Release — `tutorial-video-help` (`v1.7.0`)

- **Data:** 2026-11-21
- **Pull Request:** [#46](https://github.com/hbbucker/cifrAS/pull/46) (commit `52c0f56` na `main`)
- **Veredicto:** `CANDIDATO A RELEASE APROVADO`

## Escopo Entregue
- Novo componente modal [`TutorialVideoModal.tsx`](../../../codebase/src/main/webui/src/components/modals/TutorialVideoModal.tsx) com embed responsivo `9:16` do YouTube Shorts (`https://www.youtube.com/embed/CenYFX8YfKM?rel=0`), fechamento por `Esc`/backdrop/botão e link externo para o YouTube.
- Botão de ajuda contextual `?` ("Como compartilhar?") integrado em `GroupsPage`, `GroupDetailsPage` e `PlaylistViewPage`.
- Internacionalização 100% em `pt-BR`, `en` e `es` (chaves `tutorial.*`).

## Evidências de Validação
- **Frontend ESLint (`npm run lint`):** 0 erros, 0 warnings.
- **TypeScript (`npx tsc --noEmit`):** 0 erros.
- **Vitest (`TutorialVideoModal.test.tsx`, `GroupsPage.test.tsx`, `GroupDetailsPage.test.tsx`, `PlaylistViewPage.test.tsx`):** 28/28 testes passando após a última edição (suíte completa 318/318 validada antes do ajuste final de i18n).
- **Backend (`pre-push` Checkstyle + Surefire):** 226/226 testes passando.
- **Validação Manual Local:** Testado pelo Fundador em `http://localhost:8080`.
