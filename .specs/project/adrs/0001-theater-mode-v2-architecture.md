# ADR 0001: Theater Mode v2 Architecture

**Date:** 2026-07-29
**Status:** Accepted

## Context
O aplicativo requer que o estado da apresentação de um músico no palco seja persistido de forma resiliente, permitindo que a sessão seja recuperada em caso de falha de bateria ou fechamento acidental da página (THEATER-01). Além disso, a navegação precisará de controles em modo tela cheia e trava de toques indesejados.

## Decisions

### 1. Sincronização de Estado via Debounced PATCH (em vez de WebSockets)
- **Decision:** O frontend usará chamadas HTTP `PATCH` com debounce (ex: 3-5 segundos) para salvar o estado da sessão no backend, ao invés de abrir uma conexão contínua (WebSocket ou Server-Sent Events).
- **Rationale:** A necessidade é de **resiliência** e recuperação de sessão, não de co-browsing em tempo real entre dois dispositivos simultaneamente. HTTP PATCHs debounced poupam custos de infraestrutura no Fly.io, simplificam o backend e são mais robustos contra falhas de conexão de rede de baixa qualidade (comuns em palcos/igrejas).

### 2. Chave Primária da Sessão (`user_id`)
- **Decision:** A tabela `performance_sessions` no banco de dados usará o `user_id` como sua chave primária, garantindo que um usuário possua apenas **uma** sessão ativa globalmente por vez.
- **Rationale:** Músicos não "apresentam dois shows ao mesmo tempo". Limitar a 1:1 simplifica drasticamente a lógica de banco de dados (UPSERT via REPLACE/ON CONFLICT), a interface de usuário (não há necessidade de escolher qual sessão retomar) e a limpeza (garbage collection) de sessões mortas.

### 3. Implementação de Gestos Nativos
- **Decision:** O uso de swipes (deslizamentos) para navegação será feito através da API nativa do DOM de toques (`onTouchStart`, `onTouchEnd`) ou listeners embutidos no React, dispensando o uso de bibliotecas de animação de gestos como `framer-motion` ou `react-use-gesture`.
- **Rationale:** Mantém o tamanho do pacote frontend o mais enxuto possível, uma vez que o Epic 6 impõe limites rigorosos de tempo de carregamento e Core Web Vitals (LCP, TBT).

## Consequences
- O fluxo HTTP exige implementação explícita de `retry` silencioso no frontend caso a requisição falhe.
- Caso o usuário abra duas abas diferentes simultaneamente logadas na mesma conta, elas vão sobrepor o estado na mesma linha do banco de dados (corrida), o que é um trade-off aceitável para o caso de uso principal.
