# CifrAS — Arquitetura

O projeto adota uma arquitetura full-stack moderna e unificada (monolítica), combinando um backend em Java Quarkus com um frontend em React + TypeScript.

## Visão Geral da Arquitetura

Para simplificar o desenvolvimento, deploy e CI/CD, o projeto foi migrado de repositórios/diretórios separados para um modelo unificado gerenciado pela extensão **Quarkus Quinoa**.

Isso significa que o Quarkus é responsável por compilar e servir não apenas a REST API, mas também os artefatos gerados pelo build do React.

```mermaid
graph TD
    Client[Browser / Mobile] -->|HTTP /| Quarkus[Quarkus Server :8080]
    
    subgraph "CifrAS Codebase"
        Quarkus -->|/| Quinoa[Quinoa Extension]
        Quinoa -->|Serves Static Files| React[React App - SPA]
        Quarkus -->|/api/*| JAXRS[JAX-RS / Resources]
        
        JAXRS --> UseCases[Application Use Cases / Services]
        UseCases --> Domain[Domain Models (POJOs)]
        UseCases --> Repositories[Repository Pattern]
        Repositories --> Mappers[Mappers]
        Mappers --> Panache[Hibernate Panache Entities]
    end
    
    Panache -->|JDBC| PostgreSQL[(Supabase PostgreSQL)]
    React -->|Token validation| SupabaseAuth[Supabase Auth REST]
    JAXRS -->|JWT Validation| JWT[SmallRye JWT]
```

## Padrão de Roteamento e Comunicação

1. **Frontend Assets:** O Quarkus Quinoa intercepta chamadas para caminhos não mapeados na API e serve o `index.html` gerado pelo build do Vite.
2. **API REST:** Todas as rotas do backend estão agora no prefixo `/api` (ex: `/api/songs`, `/api/groups`).
3. **Autenticação:** O React lida com login/registro diretamente com o Supabase Auth. Uma vez obtido o token JWT, ele é enviado nos cabeçalhos `Authorization: Bearer <token>` em todas as chamadas para a API Quarkus.
4. **Validação de Token:** O Quarkus verifica a validade do JWT e obtém os papéis (roles) e ID do usuário (`sub`) de forma stateless, confiando nas chaves públicas do Supabase configuradas no `application.properties`.

## Organização do Código (Monorepo/Unified)

Tudo reside na pasta `codebase/`:
- O código Java (backend) está em `src/main/java/`.
- O código React (frontend) está em `src/main/webui/`.
- Testes E2E (Playwright) vivem dentro da webui, mas testam o sistema rodando de ponta a ponta.

## Deploy Model

A aplicação gera um único executável/artefato (`.jar` ou binário nativo GraalVM se configurado). Quando executado, o processo escuta em uma única porta (`8080`) servindo as páginas web no root e os endpoints REST em `/api`. Isso remove a necessidade de gerenciar o deploy do frontend em uma CDN (como Vercel) e o backend em outro serviço, embora essa separação ainda seja possível caso se deseje desativar o Quinoa no futuro.
