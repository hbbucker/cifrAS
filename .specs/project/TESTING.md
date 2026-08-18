# CifrAS — Política de Testes 🧪

Este documento registra formalmente a política de testes do projeto **CifrAS** sob o framework Startup OS.
Para detalhes técnicos de implementação, consulte a **seção §5 do [`AGENTS.md`](file:///home/bucker/Documentos/Projecsts/cifrAS/AGENTS.md)**.

---

<!-- startupos-testing-policy:start -->
## Política de Testes do Startup OS

**Status:** Definida
**Suítes obrigatórias:** Unitários, Integração e E2E
**Cobertura mínima global:** 90% no diff (linhas novas/alteradas pelo PR)
**Cadência da suíte completa:** execução noturna e obrigatória no candidato a release

### Matriz de impacto

| Nível | Sinais | Gate da entrega | Exigência no candidato a release |
|---|---|---|---|
| **I0 — Local** | Mudança local e reversível, sem regra, contrato, persistência, segurança, integração ou componente compartilhado. | Checagens estáticas aplicáveis e verificação focada. | Gate normal do candidato. |
| **I1 — Padrão** | Fluxo delimitado sem dados sensíveis, irreversibilidade, contrato público ou dependência externa alterada. | Checagens estáticas e testes focados no contorno público. | Suíte completa da baseline e regressão focada quando aplicável. |
| **I2 — Elevado** | Componente compartilhado, jornada multi-etapa, integração, contrato público, acessibilidade, desempenho percebido ou persistência sem migração destrutiva. | Gates I1, integração no contorno afetado e smoke, contrato ou E2E focado quando aplicável. | Regressão explícita dos contornos afetados, além da suíte completa. |
| **I3 — Crítico** | Autenticação, autorização, segurança, privacidade, dinheiro, obrigação legal, ação irreversível, risco de dados ou regra crítica. | Gates I2, testes negativos, recuperação ou rollback e suítes definidas. Não pode usar Fast-Track. | Suíte completa, caminhos críticos e rollback verificável. |

Classifique antes da implementação; CTO e CPO decidem seus sinais e o maior nível prevalece. Incerteza, divergência ou novo risco sobe ao maior nível plausível. Fast-Track só pode ser I0 ou I1.

Makers evidenciam os gates proporcionais. O QA Lead dá `PRONTA PARA INTEGRAÇÃO` ou `REJEITADA` para a entrega; isso não autoriza lançamento. No candidato a release, o QA Lead dá `CANDIDATO A RELEASE APROVADO` ou `REJEITADO` com evidência atual da suíte completa, regressões, E2E e rollback aplicáveis. O CEO/Orquestrador não autoriza release normal sem `CANDIDATO A RELEASE APROVADO`.

Hotfix só pode adiar a suíte completa diante de dano ativo, com incidente, urgência, escopo mínimo, risco residual, responsável e revalidação registrados.

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
