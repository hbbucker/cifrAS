# Specification: Milestone 3 Infra (Observability & CI/CD)

## Overview
Estruturar a infraestrutura do Milestone 3, compreendendo observabilidade (Health Checks e Logs no Quarkus para Fly.io) e um pipeline automatizado de CI/CD via GitHub Actions para a arquitetura unificada (Quarkus + Quinoa).

## Requirements

### Observability & Health Checks
- **REQ-INF-001**: Adicionar a extensão `smallrye-health` ao backend Quarkus.
- **REQ-INF-002**: Expor probes de Liveness (`/q/health/live`) e Readiness (`/q/health/ready`).
- **REQ-INF-003**: Adicionar extensão `quarkus-logging-json` para formatar os logs em JSON estruturado, adequado para Fly.io.
- **REQ-INF-004**: Garantir que endpoints de health check estejam acessíveis e testados.

### CI/CD (GitHub Actions)
- **REQ-INF-005**: Criar/Atualizar pipeline em `.github/workflows/ci.yml`.
- **REQ-INF-006**: O pipeline deve instalar dependências e rodar linters.
- **REQ-INF-007**: O pipeline deve rodar testes unitários (backend e frontend).
- **REQ-INF-008**: O pipeline deve realizar o build integrado da arquitetura monolítica (Quarkus + Quinoa).
- **REQ-INF-009**: O código deve manter cobertura local >= 95% (Gatekeeper).
