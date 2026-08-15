# Tasks: FE-ONBOARDING-02 - Feature Discovery

**Fase:** Tasks (tlc-spec-driven)
**Feature:** FE-ONBOARDING-02

## Task 1: Internacionalização (i18n)
- **Objetivo:** Adicionar as chaves de tradução referentes ao modal de novidades.
- **Arquivos impactados:** Arquivos JSON de tradução (ex: `pt-BR`, `en`).
- **Detalhes:** Criar chaves para o título "Novidades no CifrAS!", descrições de "Persistência de Tom" e "Modo Teatro", e texto do botão "Entendi!".

## Task 2: Componente `FeatureDiscoveryModal`
- **Objetivo:** Desenvolver o componente do modal seguindo o design visual estipulado.
- **Caminho:** `codebase/src/main/webui/src/components/FeatureDiscoveryModal.tsx` (ou pasta similar de features se aplicável).
- **Especificações de Design:** 
  - Overlay: `bg-black/50`
  - Container: `bg-white` ou surface `#fbfbf9`, `rounded-[32px]`, flat (sem sombras pesadas).
  - Header: Ícone `Sparkles` (Lucide) em círculo `rounded-full` de fundo `bg-[#8629cc]/10`.
  - Tipografia: Título Ink `#000000` (bold), Corpo Body `#33332e`.
  - Botão de Ação: `bg-[#8629cc]`, `rounded-2xl`, texto da Task 1. O clique no background *não* deve fechar o modal.

## Task 3: Integração no `SongPage.tsx`
- **Objetivo:** Renderizar o modal na tela de uma música.
- **Detalhes:** 
  - Consultar `localStorage` para a chave `feature_discovery_02_seen`.
  - Se não existir ou for `false`, aguardar 1 segundo (delay) e renderizar o `FeatureDiscoveryModal`.
  - Ao clicar no botão de fechar, atualizar o `localStorage` para `true` e remover o componente.

## Task 4: Testes E2E (Playwright)
- **Objetivo:** Garantir a cobertura da funcionalidade do modal e prevenir bloqueio em testes existentes.
- **Arquivos:** Testes na pasta `codebase/src/main/webui/e2e/`.
- **Detalhes:** 
  - Criar um teste E2E garantindo que o modal é exibido após 1 segundo se o state estiver vazio, e desaparece ao clicar no botão, persistindo a key.
  - Mockar o `localStorage` (definindo `feature_discovery_02_seen = true`) no setup dos testes que não dizem respeito ao onboarding, para evitar que o modal bloqueie cliques nas outras features de `SongPage`.

## Regras de Execução (para o CTO)
- Utilize a stack e siga os padrões estabelecidos no `AGENTS.md` (TDD, Playwright, React, Tailwind).
- Crie ou use branches adequadas.
- Certifique-se de executar linter, testes unitários, e Playwright.
- Abra o PR e aguarde o CI passar (`gh pr checks --watch`).
