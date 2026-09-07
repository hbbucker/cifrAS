# Parecer de Release: THEATER-PERSISTENT-HEADER (Cabeçalho Persistente e Badges de Tom no Modo Teatro)

## Status: RELEASE INTEGRADA E CONCLUÍDA ✅

### 1. Escopo da Entrega
- **Cabeçalho Persistente:** Título da música e nome do artista permanecem visíveis de forma ininterrupta no topo da tela no Modo Teatro, mesmo após ocultamento automático de controles por inatividade ou rolagem da cifra.
- **Badge de Tom Atual e Original:**
  - Em tom padrão: exibe badge compacta com o tom em execução (`Tom: G`).
  - Em tom transposto: exibe o tom em execução acompanhado do tom original como referência (`Tom: A | Orig. G`).
- **Controles Efêmeros:** Botão de sair (X), controles de bloqueio, tela cheia e docks lateral e inferior mantêm o comportamento de ocultar suavemente e reaparecer com toque na tela.
- **Internacionalização (i18n):** Adicionadas chaves de tradução em `pt-BR`, `en` e `es`.
- **Compatibilidade e Testes:** Testes unitários do frontend e testes ponta a ponta (Playwright E2E) passando 100%.

### 2. Evidências de Validação
- **Pull Request:** #35 (Squash & Merge realizado na branch `main`).
- **Pipeline Remota (CI/CD GitHub Actions):** 5/5 checks aprovados (Build & Testes Main App, Build & Testes Admin App, CodeQL Java/Kotlin, CodeQL JS/TS).
- **Testes Unitários:** 47 arquivos de teste, 255 testes passando 100%.
- **Linter:** 0 erros / 0 warnings.
- **Build de Produção:** Concluído com sucesso (Quarkus + Vite + PWA).

### 3. Decisão
- **Veredicto:** Funcionalidade integrada com sucesso à branch `main`. Branch de feature e worktree local removidas.
