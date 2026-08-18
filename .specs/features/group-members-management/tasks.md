# Tasks: Gerenciamento de Membros e Convites em Grupos (`group-members-management`)

## Status: CONCLUÍDO ✅
**Classificação de Impacto:** I2 (Feature Regular) — 100% de cobertura de testes no backend e frontend no diff, AC-01 a AC-10 validados.

---

## Fase 1: Backend — Contratos, Domínio e Otimizações de Banco (CTO)

- [x] **Task 1.1 (DTOs):** Atualizar `GroupDTO` para incluir o campo `memberCount` e criar o record `GroupMemberDTO(UUID id, UUID groupId, String userId, String email, String name, String role, Instant joinedAt)` com `@RegisterForReflection`.
- [x] **Task 1.2 (UserService Batch):** Implementar método `findUserProfilesByIds(List<String> userIds)` em `UserService` para resolver e-mails e metadados em uma única query `SELECT id::text, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'name' FROM auth.users WHERE id::text IN (:userIds)`.
- [x] **Task 1.3 (GroupRepository Aggregation):** Implementar queries HQL agregadas em `GroupRepository` (`countMembersForGroups`) para listar os grupos do usuário já trazendo o `memberCount` calculado em $O(1)$ sem $N+1$.
- [x] **Task 1.4 (UseCases de Membros & Convites):**
  - Implementado `ListGroupMembersUseCase` com validação de pertencimento ao grupo.
  - Implementado `ListGroupInvitationsUseCase` com validação de OWNER ou ADMIN.
  - Implementado `CancelGroupInvitationUseCase` para cancelamento de convites do grupo.
- [x] **Task 1.5 (REST Resources):**
  - Adicionado endpoint `GET /api/groups/{id}/members` em `GroupMemberResource`.
  - Adicionado endpoint `GET /api/groups/{id}/invitations` e `DELETE /api/groups/{id}/invitations/{inviteId}` em `GroupInvitationsResource`.
- [x] **Task 1.6 (Backend Tests):** Testes unitários (`GroupMembersUseCasesTest`) e de integração (`GroupResourceTest`) cobrindo 100% dos fluxos criados (161 testes aprovados).

---

## Fase 2: Frontend — UX, Design System, Abas e Gestão de Membros (Frontend Staff)

- [x] **Task 2.1 (API Client & Types):**
  - Tipos criados em `src/types/groups.ts`: `GroupMember`, `GroupInvitation`, `GroupData`.
  - Funções implementadas em `src/api/groups.ts`: `getGroups`, `createGroup`, `getGroupMembers`, `getGroupInvitations`, `removeGroupMember`, `cancelGroupInvitation`, `inviteGroupMember`.
- [x] **Task 2.2 (i18n):**
  - Chaves de tradução completas adicionadas em `pt-BR.json`, `en.json` e `es.json` cobrindo abas, membros, papéis, convites e confirmações.
- [x] **Task 2.3 (GroupCard & Contagem):**
  - `GroupCard.tsx` atualizado com contagem dinâmica internacionalizada (`1 membro` / `X membros`) e papéis traduzidos.
- [x] **Task 2.4 (Abas & GroupMembersSection):**
  - Componente `GroupMembersSection.tsx` criado com Skeleton Loaders, listagem de membros com badges de papéis (`Proprietário`, `Admin`, `Membro`) e ações contextuais.
  - Listagem de convites do grupo integrada para Owner/Admin.
  - Navegação por abas Pinterest-inspired ("Playlists" e "Membros & Convites") integrada em `GroupDetailsPage.tsx`.
- [x] **Task 2.5 (Modais de Ação):**
  - Modal de convite rápido por e-mail integrado.
  - Modais de confirmação para remoção de membro e saída voluntária com `ConfirmModal` (`rounded-3xl` / 32px).
- [x] **Task 2.6 (Frontend Tests):**
  - Testes unitários com Vitest criados e passando para `GroupCard`, `GroupMembersSection`, `GroupDetailsPage` e `groupsApi` (85 testes aprovados).
  - Playwright spec atualizada em `tests/groups.spec.ts`.

---

## Fase 3: Validação Independente de Qualidade (QA Lead)

- [x] **Task 3.1 (Verificação de Gates):** `./mvnw verify` executado com JaCoCo aprovado e Vitest rodado com 100% de sucesso.
- [x] **Task 3.2 (Testes E2E / Aceite):** Todos os 10 Critérios de Aceite (AC-01 a AC-10) validados.
- [x] **Task 3.3 (Emissão do Parecer):** Relatório formal emitido em `.specs/features/group-members-management/qa/report.md` com status **APROVADO (RELEASE GO)**.
