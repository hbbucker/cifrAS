# Decomposição de Tarefas: FE-ONBOARDING-06 (Tour de Grupos, Membros e Playlists)

## 1. Matriz de Tarefas

| ID | Tarefa | Responsável | Arquivos Permitidos | Dependências |
|---|---|---|---|---|
| **TASK-01** | Adicionar chaves de tradução i18n | Frontend Staff | `codebase/src/main/webui/src/locales/pt-BR.json`<br>`codebase/src/main/webui/src/locales/en.json`<br>`codebase/src/main/webui/src/locales/es.json` | Nenhuma |
| **TASK-02** | Atualizar `GroupsPage.tsx` com `CoachMark` e `EducationalEmptyState` | Frontend Staff | `codebase/src/main/webui/src/pages/GroupsPage.tsx` | TASK-01 |
| **TASK-03** | Atualizar `GroupDetailsPage.tsx` com disparador de tour e `CoachMark` no botão de convite | Frontend Staff | `codebase/src/main/webui/src/pages/GroupDetailsPage.tsx` | TASK-01 |
| **TASK-04** | Atualizar `GroupPlaylistsSection.tsx` com `CoachMark` e `EducationalEmptyState` | Frontend Staff | `codebase/src/main/webui/src/components/groups/GroupPlaylistsSection.tsx` | TASK-01 |
| **TASK-05** | Atualizar e adicionar testes unitários com Vitest | Frontend Staff | `codebase/src/main/webui/src/tests/GroupsPage.test.tsx`<br>`codebase/src/main/webui/src/tests/GroupDetailsPage.test.tsx`<br>`codebase/src/main/webui/src/tests/GroupPlaylistsSection.test.tsx` | TASK-02, TASK-03, TASK-04 |
| **TASK-06** | Execução de linters e suite de testes com verificação de cobertura (≥ 90%) | Frontend Staff / QA Lead | Toda a base frontend | TASK-05 |

---

## 2. Gates e Evidências
- **Gate 1:** `npm run lint` sem erros ou avisos.
- **Gate 2:** `npm run test` com 100% de aprovação.
- **Gate 3:** Cobertura de diff ≥ 90%.
