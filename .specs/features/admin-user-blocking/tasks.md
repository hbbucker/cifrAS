# Tasks: Bloqueio e Auditoria de Usuários na Administração (`admin-user-blocking`)

---

## Status da Feature: 📋 PLAN / READY FOR IMPLEMENTATION

---

## 1. Banco de Dados e Migrações (PostgreSQL)

- [ ] **DB-01:** Criar script Flyway de migração `V20260825_01__create_user_audit_logs.sql` em `codebase/src/main/resources/db/migration/` e atualizar `import.sql` em `codebase` e `codebase-admin`.
- [ ] **DB-02:** Adicionar índices `idx_user_audit_logs_user_id` e `idx_user_audit_logs_admin_id` para otimização de busca cronológica.
- [ ] **DB-03:** Validar compatibilidade do schema em DevServices/Testcontainers PostgreSQL.

---

## 2. Domínio Rico & DDD Tático (`codebase-admin`)

- [ ] **DOM-01:** Criar Enum `UserStatus` (`ACTIVE`, `BLOCKED`) com métodos utilitários em `br.com.cifras.admin.user.model`.
- [ ] **DOM-02:** Criar Enum `AuditAction` (`BLOCK`, `UNBLOCK`) em `br.com.cifras.admin.audit.model`.
- [ ] **DOM-03:** Enriquecer o modelo de domínio `AdminUser` com métodos de negócio (`block`, `unblock`, `isBlocked`, validações de invariantes).
- [ ] **DOM-04:** Criar modelo de domínio puro `UserAuditLog` com validações de invariantes obrigatórios.

---

## 3. Infraestrutura & Persistência (Hibernate Panache)

- [ ] **INF-01:** Criar entidade JPA `UserAuditLogEntity` mapeada para a tabela `user_audit_logs` com `@UuidGenerator(style = TIME)`.
- [ ] **INF-02:** Criar `UserAuditLogRepository` estendendo `PanacheRepositoryBase<UserAuditLogEntity, String>` com busca ordenada por `createdAt desc`.
- [ ] **INF-03:** Atualizar `AdminUserRepository` para ler e persistir `is_blocked`, `status` e `last_block_reason` nos metadados `auth.users`.
- [ ] **INF-04:** Criar `UserAuditLogMapper` para conversão bidirecional entre `UserAuditLogEntity`, `UserAuditLog` (Domínio) e `UserAuditLogDTO`.
- [ ] **INF-05:** Atualizar `AdminUserMapper` para incluir novos campos (`status`, `isBlocked`, `lastBlockReason`, `updatedAt`).

---

## 4. Contratos de API & DTOs (Records com `@RegisterForReflection`)

- [ ] **DTO-01:** Criar record `BlockUserRequestDTO` com anotações `@NotBlank` e `@Size(min = 5, max = 1000)`.
- [ ] **DTO-02:** Criar record `UnblockUserRequestDTO` com anotação `@Size(max = 1000)`.
- [ ] **DTO-03:** Criar record `UserAuditLogDTO` com `@RegisterForReflection` para serialização JAX-RS / Native.
- [ ] **DTO-04:** Atualizar record `AdminUserDTO` para incluir `status`, `isBlocked`, `lastBlockReason` e `updatedAt`.

---

## 5. Camada de Aplicação (Use Cases)

- [ ] **APP-01:** Implementar `BlockUserUseCase`:
  - Validação de privilégios de Admin.
  - Proibição estrita de auto-bloqueio (`adminId != targetUserId`).
  - Validação do tamanho do motivo ($\ge 5$ e $\le 1000$ caracteres).
  - Atualização do status do usuário para `BLOCKED`.
  - Persistência do evento em `user_audit_logs`.
- [ ] **APP-02:** Implementar `UnblockUserUseCase`:
  - Validação de privilégios de Admin.
  - Restabelecimento do status do usuário para `ACTIVE`.
  - Persistência do evento `UNBLOCK` na auditoria.
- [ ] **APP-03:** Implementar `GetUserAuditLogsUseCase`:
  - Consulta da trilha de auditoria por `userId` em ordem cronológica decrescente.

---

## 6. Endpoints REST JAX-RS (`codebase-admin`)

- [ ] **API-01:** Expor endpoint `POST /admin/users/{id}/block` em `AdminUserResource`.
- [ ] **API-02:** Expor endpoint `POST /admin/users/{id}/unblock` em `AdminUserResource`.
- [ ] **API-03:** Expor endpoint `GET /admin/users/{id}/audit-logs` em `AdminUserResource`.
- [ ] **API-04:** Assegurar tratamento de exceções no `GlobalExceptionMapper` para `CANNOT_BLOCK_SELF` e `INVALID_REASON_LENGTH` com HTTP 400.

---

## 7. Interceptação de Segurança no Backend Principal (`codebase`)

- [ ] **SEC-01:** Criar `AccountBlockedException` mapeada para `HTTP 403 Forbidden` (`ACCOUNT_BLOCKED`) no `GlobalExceptionMapper` do `codebase`.
- [ ] **SEC-02:** Adicionar método `isUserBlocked(String userId)` em `UserService` com verificação em `auth.users` / metadata.
- [ ] **SEC-03:** Integrar a checagem de bloqueio no pipeline de autenticação (`JwtValidationFilter` / `SecurityUtils`) e no refresh de sessão em `AuthResource`.

---

## 8. Frontend do Painel Administrativo (`codebase-admin/src/main/webui`)

- [x] **FE-01:** Atualizar definições de tipos TypeScript em `src/types/admin.ts` (`UserAuditLog`, campos em `AdminUser`).
- [x] **FE-02:** Adicionar chamadas de API em `src/api/adminApi.ts` (`blockUser`, `unblockUser`, `getUserAuditLogs`).
- [x] **FE-03:** Implementar componente `BlockUserModal.tsx` (estilo Pinterest-inspired, raio de 32px, botão `#cc001f`, contador `0/1000`, validação $\ge 5$).
- [x] **FE-04:** Implementar componente `UnblockUserModal.tsx` (estilo Pinterest-inspired, botão `#aa3bff`, motivo opcional).
- [x] **FE-05:** Implementar componente `UserAuditHistoryModal.tsx` (timeline vertical cronológica com badges e identificação do admin).
- [x] **FE-06:** Atualizar tabela de `UsersPage.tsx` com badges de status (`Ativo` / `Bloqueado`), ações contextuais e desabilitação de auto-bloqueio com tooltip.
- [x] **FE-07:** Adicionar todas as chaves de tradução em `pt.json`, `en.json` e `es.json`.

---

## 9. Governança de Testes e Gate de Qualidade (Nível I3 - Cobertura $\ge 90\%$)

- [ ] **TEST-01 (Unitários - Domínio & Mappers):**
  - `AdminUserTest`: Invariantes de transição de estado e validação de auto-bloqueio.
  - `UserAuditLogTest`: Validação de preenchimento e imutabilidade.
  - `AdminUserMapperTest` & `UserAuditLogMapperTest`.
- [ ] **TEST-02 (Unitários - Use Cases):**
  - `BlockUserUseCaseTest` (sucesso, auto-bloqueio, motivo inválido, usuário não encontrado).
  - `UnblockUserUseCaseTest` (sucesso, usuário não encontrado).
  - `GetUserAuditLogsUseCaseTest` (listagem ordenada).
- [ ] **TEST-03 (Integração JAX-RS / Testcontainers - `codebase-admin`):**
  - `AdminUserResourceTest`:
    - Bloqueio com sucesso (200 OK + log persistido).
    - Tentativa de auto-bloqueio (400 Bad Request).
    - Motivo menor que 5 caracteres (400 Bad Request).
    - Desbloqueio com sucesso (200 OK).
    - Obtenção do histórico de auditoria (200 OK).
    - Bloqueio por usuário não-admin (403 Forbidden).
- [ ] **TEST-04 (Integração de Segurança - `codebase`):**
  - `BlockedUserInterceptionTest`: Verificação de rejeição 403 (`ACCOUNT_BLOCKED`) para usuário bloqueado.
- [x] **TEST-05 (Frontend Component Tests):**
  - Testes Vitest/Testing Library para `BlockUserModal`, `UnblockUserModal`, `UserAuditHistoryModal` e `UsersPage`.
- [ ] **TEST-06 (E2E Flow):**
  - Teste Playwright cobrindo fluxo completo: Admin loga -> Localiza usuário -> Bloqueia com motivo -> Confere badge e log de auditoria -> Desbloqueia.
