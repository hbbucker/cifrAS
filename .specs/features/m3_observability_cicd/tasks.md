# Tasks: Milestone 3 Infra (Observability & CI/CD)

## [x] Task 1: Observability Dependencies & Config
- **What**: Adicionar dependências `quarkus-smallrye-health` e `quarkus-logging-json` no `pom.xml`. Habilitar logs JSON no `application.properties` para o perfil de produção.
- **Where**: `codebase/pom.xml`, `codebase/src/main/resources/application.properties`
- **Depends on**: None
- **Reuses**: Padrões existentes do projeto Quarkus.
- **Done when**: O projeto compila com `mvn clean compile` e possui as novas extensões.
- **Gate**: Sucesso no build local sem quebrar dependências.

## [x] Task 2: Validate Health Checks & Coverage
- **What**: Garantir que as rotas `/q/health/live` e `/q/health/ready` estão acessíveis. O Quarkus já expõe as rotas com `smallrye-health`. Precisamos adicionar/atualizar testes unitários para validar o status 200 destas rotas (caso não cobertas automaticamente, criar `HealthCheckTest.java`) mantendo cobertura >= 95%.
- **Where**: `codebase/src/test/java/...` (criar pacote/classe se necessário)
- **Depends on**: Task 1
- **Done when**: Teste unitário verifica endpoints de health. Cobertura de código do projeto obedece ao limiar de 95%.
- **Gate**: `mvn test` no diretório `codebase` executado com sucesso e logs de coverage verificados.

## [x] Task 3: CI/CD Pipeline
- **What**: Criar pipeline de actions `.github/workflows/ci.yml`.
- **Where**: `.github/workflows/ci.yml` (na raiz do repositório)
- **Depends on**: Task 1, Task 2
- **Done when**: O arquivo `.github/workflows/ci.yml` está criado com steps de Checkout, Setup Java, Setup Node, Linters (backend/frontend), Testes Unitários e Build (Maven).
- **Gate**: Formato YAML válido.
