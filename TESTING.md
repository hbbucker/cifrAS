# CifrAS — Política de Testes 🧪

Este documento registra formalmente a política de testes do projeto **CifrAS** sob o framework Startup OS.
Para detalhes técnicos de implementação, consulte a **seção §5 do [`AGENTS.md`](./AGENTS.md)**.

---

<!-- startupos-testing-policy:start -->
## Política de Testes do Startup OS

**Status:** Definida

**Suítes obrigatórias:** Unitários, Integração e E2E

**Cobertura mínima global:** 90% **no diff** (linhas novas/alteradas pelo PR — não no código legado)

Makers devem executar as suítes aplicáveis e evidenciar a cobertura antes de entregar ao QA.
O QA Lead deve verificar ambas antes de aprovar a entrega.
<!-- startupos-testing-policy:end -->

---

## Resumo por Camada

| Camada | Ferramenta | Tipo | Threshold no Diff |
|--------|------------|------|-------------------|
| `model/`, `application/` | JaCoCo + JUnit 5 | Unitários | ≥ 90% |
| `resource/` | JaCoCo + REST Assured + Testcontainers | Integração | ≥ 90% |
| `infra/` | JaCoCo + Testcontainers | Integração | ≥ 90% |
| `components/`, `hooks/`, `utils/` | Vitest + Testing Library | Unitários | ≥ 90% |
| `pages/` | Playwright | E2E | 1 cenário por AC |

---

## Comandos de Verificação Local

```bash
# Backend — rodar testes e gerar relatório JaCoCo
cd codebase && ./mvnw verify

# Backend — verificar cobertura no diff vs main
diff-cover codebase/target/site/jacoco/jacoco.xml --compare-branch=origin/main --fail-under=90

# Frontend — rodar testes com relatório de cobertura
cd codebase/src/main/webui && npm run coverage

# E2E — rodar Playwright
cd codebase/src/main/webui && npm run e2e
```

---

## Exceções Documentadas

As seguintes situações dispensam os 90% no diff, mas **exigem justificativa explícita no PR**:

- Código de configuração puro (`config/`, `application.properties`) sem lógica de negócio
- Migrações de banco de dados (arquivos `.sql`)
- Arquivos de tipagem pura TypeScript (`.d.ts`, interfaces sem lógica)
- Mocks e factories de teste (código dentro de `src/test/`)

---

## Responsabilidades

**Makers (CTO e Frontend Staff)**
- Rodar os comandos de cobertura localmente antes de abrir o PR
- Garantir que cada linha nova do diff esteja coberta por pelo menos um teste
- Para pages/fluxos: mapear cada AC da spec a um cenário Playwright correspondente

**QA Lead (Checker)**
- ✅ Verificar cobertura do diff como **primeiro critério de rejeição**
- Rejeitar imediatamente se < 90% em qualquer camada, com comentário indicando o percentual atual
- Validar o mapeamento AC → Cenário E2E antes de aprovar
- Nunca aprovar entrega sem evidência de cobertura

---

*Política inicializada via `startupos-init` em 2026-08-15. Atualizar este arquivo ao alterar as regras.*
