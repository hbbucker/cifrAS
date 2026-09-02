# Tarefas: Links de Compartilhamento (Share Links)

**Status:** Concluído e Aprovado

## Dependências
- Backend liberou DTOs e endpoints iniciais.
- Frontend finalizou integração de UI e testes.

## Backend (CTO)
1. [x] **[Backend] Criar modelo e migração para ShareLinkEntity**
   - Entidade Panache e script Flyway (`ShareLinkEntity`).
   - Gate: Diff coverage ≥ 90%.

2. [x] **[Backend] Implementar endpoints de gerenciamento de ShareLink**
   - DTOs implementados. Endpoints `POST /api/share-links` (criação) e `GET /api/share-links/{token}` (consulta pública).
   - Gate: Diff coverage ≥ 90% (Testes de integração).

3. [x] **[Backend] Implementar endpoint de aceite de ShareLink**
   - Endpoint `POST /api/share-links/{token}/accept` com checagem de expiração, adição de usuário ao grupo ou clonagem de música.
   - Gate: Testes de token expirado e diff coverage ≥ 90%.

## Frontend (Frontend Staff)
4. [x] **[Frontend] Atualizar interface de compartilhamento**
   - Remoção de campo de e-mail dos modais/botões de share de música e grupo (GroupsPage e GroupDetailsPage).
   - Chamada a `POST /api/share-links` e exibição do link para cópia.
   - Gate: Diff coverage ≥ 90%.

5. [x] **[Frontend] Implementar Rota e Página `/invite/:token`**
   - UI de convite lendo dados do `GET /api/share-links/{token}`.
   - Fluxos logado e deslogado tratados. Se deslogado, salva token no `localStorage` e envia para Auth.
   - Gate: Diff coverage ≥ 90%.

6. [x] **[Frontend] Interceptar e Processar Pending Share Token após Login**
   - No fluxo de retorno do login OAuth (`AuthCallbackPage`), verificação do `pendingShareToken`, chamada a `POST /api/share-links/{token}/accept` e redirecionamento correto.
   - Gate: Fluxo de aceite automático validado.

## Validação (QA Lead)
7. [x] **[QA] Validação E2E e Aprovação**
   - Parecer de integração e parecer de release emitidos com aprovação.
