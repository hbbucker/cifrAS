# CifrAS — Testing Infrastructure

## Test Frameworks

A estratégia de testes acompanha a arquitetura unificada Quarkus + Quinoa:

**Backend (Unit & Integration):** JUnit 5 + REST Assured + Testcontainers
**Frontend (E2E):** Playwright

## Test Organization

**Location:** 
- `codebase/src/test/java/` (Backend Unit & Integration)
- `codebase/src/main/webui/e2e/` (Frontend E2E via Playwright)

**Structure:**
- `src/test/java/br/com/cifras/resource/`: Testes de integração JAX-RS com REST Assured.
- `src/test/java/br/com/cifras/service/`: Testes unitários das regras de negócio (ex: Transposição).
- `src/main/webui/e2e/`: Testes de interface garantindo que o app React interage corretamente com a API Quarkus e banco de dados real.

## Testing Patterns

### Backend Tests (JUnit + Testcontainers)
- Testes que interagem com banco estendem classes que sobem instâncias isoladas do PostgreSQL via Testcontainers.
- Mockamos dependências não-críticas e garantimos a validade do JWT enviando cabeçalhos Authorization estáticos para usuários de teste.
- O `@QuarkusTest` sobe toda a aplicação e injeção de dependências automaticamente.

### E2E Tests (Playwright)
- Testes full-flow executados no navegador rodando os scripts localizados em `webui/e2e`.
- Eles acessam a porta de desenvolvimento ou produção (ex: `http://localhost:8080`) para testar o sistema completo (banco, api e tela).
- Os fluxos incluem autenticação, criação de músicas e transposição na interface (Modo Teatro).

## Test Execution

A execução pode ocorrer de forma unificada ou individual:

**Commands (a partir de `codebase/`):**
- Testes completos do backend: `./mvnw test` ou `./mvnw verify`
- Testes locais do Playwright: 
  ```bash
  cd src/main/webui
  npx playwright test
  ```

## Test Coverage Matrix

| Code Layer | Required Test Type | Location Pattern | Run Command |
| --- | --- | --- | --- |
| Quarkus Services | unit | `codebase/src/test/java/.../service/*Test.java` | `./mvnw test` |
| Quarkus REST API | integration | `codebase/src/test/java/.../resource/*Test.java` | `./mvnw test` |
| Full Flows (Frontend) | e2e | `codebase/src/main/webui/e2e/*.spec.ts` | `npx playwright test` |

## Gate Check Commands

| Gate Level | Quando Usar | Comando (na pasta `codebase`) |
| --- | --- | --- |
| Backend Core | Após refatorar serviços/APIs | `./mvnw test` |
| Full Stack | Antes do PR ou deploy | `./mvnw verify` |
| E2E Isolation | Modificações exclusivas na UI | `cd src/main/webui && npx playwright test` |
