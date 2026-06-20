# Tasks - Epic 1: Advanced Search (PostgreSQL FTS)

Status do Epic: 🏗️ In Progress

## Tasks de Planejamento & Especificação

- [ ] **Task 1: Detalhar Especificação Técnica (Spec)**
    - **Responsável:** Product Owner (Lucas Silva)
    - **Descrição:** Criar o arquivo `spec.md` na pasta `advanced-search/` detalhando user stories, regras de negócio para ranking de busca e critérios de aceitação.
    - **Requisito:** Colaboração com Maya Rivers (UX) para definir o comportamento visual do "Quick Search".
    - **Status:** ⏳ Pendente

## Tasks de Implementação Backend

- [ ] **Task 2: Migração de Banco de Dados (PostgreSQL FTS)**
    - **Responsável:** CTO
    - **Descrição:** Adicionar colunas `tsvector` e criar índices GIN nas tabelas `songs`. Implementar triggers ou lógica de atualização.
    - **Requisito:** SQL puro ou migração Flyway.
    - **Status:** ⏳ Pendente

- [ ] **Task 3: Implementar SearchService com TDD**
    - **Responsável:** CTO
    - **Descrição:** Lógica de busca abstrata usando Hibernate/JPA para integrar com PostgreSQL FTS.
    - **Requisitos de Qualidade:**
        - TDD (Test-Driven Development).
        - Testes integrados com Testcontainers.
        - Cobertura de testes > 80%.
    - **Status:** ⏳ Pendente

## Tasks de Implementação Frontend

- [ ] **Task 4: Componente Quick Search UI**
    - **Responsável:** CTO / Alex J. Code
    - **Descrição:** Implementar a barra de busca rápida com feedback visual e realce de termos (highlighting).
    - **Requisitos de Qualidade:**
        - TDD no React (Vitest).
        - Testes E2E (Playwright).
    - **Status:** ⏳ Pendente

---

## Fluxo de Trabalho Obrigatório
1. **Branching:** Cada task deve ser desenvolvida em uma branch separada (ex: `feature/advanced-search-backend`).
2. **Pull Requests:** Todo código deve passar por PR no GitHub.
3. **CI/CD:** O PR só pode ser mergeado se a pipeline de CI passar integralmente.
