# Migração de IDs numéricos para UUIDv7 Specification

## Problem Statement

Atualmente, o sistema utiliza IDs numéricos sequenciais para identificar registros no banco de dados e nas APIs. Isso abre vulnerabilidades para ataques de enumeração (IDOR), permitindo que agentes mal-intencionados descubram o número total de registros ou acessem recursos não autorizados apenas incrementando os IDs. Para mitigar esse risco de segurança e melhorar a distribuição global de identificadores, é necessário migrar todos os IDs numéricos para UUIDv7, que mantém a ordenação temporal enquanto garante imprevisibilidade.

## Goals

- [ ] Substituir todos os identificadores primários numéricos (ex: Long, Integer) por UUIDv7 no banco de dados.
- [ ] Atualizar todas as entidades e DTOs no backend (Quarkus) para utilizar o tipo UUID.
- [ ] Ajustar todos os endpoints REST para aceitar e retornar UUIDs ao invés de números.
- [ ] Atualizar o frontend (React) para lidar corretamente com identificadores em formato string/UUID nas rotas e componentes.
- [ ] Garantir que os relacionamentos de chave estrangeira no banco de dados sejam migrados corretamente sem perda de dados.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Implementação de UUIDv4 | O UUIDv7 foi escolhido explicitamente por manter a ordenabilidade temporal, o que beneficia a performance do banco de dados em inserções. |
| Refatoração de autenticação/autorização | A migração foca apenas nos identificadores. Regras de acesso não devem ser alteradas nesta feature. |

---

## User Stories

### P1: IDs Imprevisíveis nas APIs e Banco de Dados ⭐ MVP

**User Story**: Como um administrador do sistema, eu quero que todos os registros utilizem UUIDv7 como identificador, para que nossa aplicação esteja protegida contra ataques de enumeração.

**Why P1**: É a essência de segurança que motiva esta funcionalidade, prevenindo o acesso indevido ou a coleta não autorizada de informações por enumeração.

**Acceptance Criteria**:

1. WHEN um novo registro é criado THEN system SHALL gerar um UUIDv7 como chave primária.
2. WHEN um cliente consulta um recurso por ID THEN system SHALL exigir um UUID válido na requisição.
3. WHEN um cliente tenta usar um ID numérico antigo THEN system SHALL retornar erro 404 (Not Found) ou 400 (Bad Request).
4. WHEN tabelas com chaves estrangeiras são consultadas THEN system SHALL manter a integridade referencial usando o novo formato UUIDv7.

**Independent Test**: Tentar acessar uma URL com um ID numérico (ex: `/api/songs/1`) e verificar que a API não o aceita. Acessar com um UUIDv7 recém-criado e verificar sucesso.

---

## Edge Cases

- WHEN um ID no formato UUIDv4 ou outra versão for enviado THEN system SHALL processá-lo normalmente, caso seja compatível e já exista na base de dados, mas todas as novas gerações devem ser restritas à versão 7 (se aplicável ao padrão de criação).
- WHEN houver links salvos externamente contendo IDs numéricos THEN esses links quebrarão após a migração, o que é um comportamento esperado em favor da segurança.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story       | Phase   | Status  |
| -------------- | ----------- | ------- | ------- |
| UUID-01        | P1: Migrate primary keys | Pending | Pending |
| UUID-02        | P1: Update API endpoints | Pending | Pending |
| UUID-03        | P1: Update frontend models | Pending | Pending |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 3 total, 0 mapped to tasks, 3 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Security: Não é mais possível prever o próximo ID do banco de dados ou adivinhar URLs de recursos válidos.
- [ ] Compatibility: A aplicação frontend continua funcional, realizando chamadas corretamente com strings UUID.
- [ ] Database: A migração dos dados existentes ocorre sem quebra de integridade referencial.
