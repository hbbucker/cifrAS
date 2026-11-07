# Tarefas de Implementação: Modo Tela Cheia e Live Preview Dividido

- **ID da Feature**: `song-editor-fullscreen-preview`
- **Classificação**: `I1` (Fast-Track)
- **Status**: Concluído

---

## Matriz de Tarefas

### Tarefa 1: Dicionários de Internacionalização (i18n)
- [x] **1.1** Adicionar chaves de tradução em `codebase/src/main/webui/src/locales/pt-BR.json` (`fullscreenBtn`, `restoreBtn`, `viewEditor`, `viewSplit`, `viewPreview`, `emptyPreview`, `escShortcut`, etc.).
- [x] **1.2** Adicionar chaves equivalentes em `codebase/src/main/webui/src/locales/en.json`.
- [x] **1.3** Adicionar chaves equivalentes em `codebase/src/main/webui/src/locales/es.json`.
- *Gate de Verificação*: Arquivos JSON válidos sem syntax errors e com chaves sincronizadas nos 3 idiomas. ✅

---

### Tarefa 2: Componente `SongEditorFullscreen`
- [x] **2.1** Criar `codebase/src/main/webui/src/components/music/SongEditorFullscreen.tsx` com overlay `fixed inset-0 z-50 bg-bg-card flex flex-col`.
- [x] **2.2** Implementar detecção inicial de breakpoint (`window.innerWidth >= 1280 ? 'split' : 'editor'`).
- [x] **2.3** Construir o cabeçalho maximizado contendo:
  - Botão Restaurar / Minimizar (`Minimize2`).
  - Título da música, artista e tom.
  - Botões de inserção rápida (`[Refrão]`, `[coluna]`, `---`, `Tablatura`).
  - Seletor segmentado de modo de visualização (`Editor`, `Dividido`, `Preview`).
  - Botão Salvar (`Save`) com indicador de atalho `Ctrl+S`.
- [x] **2.4** Implementar visualizações:
  - Modo `editor`: textarea em largura total com linha guia vertical (`song-editor-line-guide`).
  - Modo `preview`: container do `ChordSheet` em largura total.
  - Modo `split`: divisão 50/50 com scrolls independentes e linha divisória sutil.
- [x] **2.5** Suportar atalhos globais de teclado no overlay:
  - `Escape` para fechar/restaurar.
  - `Ctrl+S` / `Cmd+S` para salvar.
- *Gate de Verificação*: Componente renderiza sem erros no Storybook/Testes. ✅

---

### Tarefa 3: Integração no `SongFormPage`
- [x] **3.1** Importar `Maximize2` e `SongEditorFullscreen` em `SongFormPage.tsx`.
- [x] **3.2** Adicionar estado `isFullscreen` no `SongFormPage`.
- [x] **3.3** Inserir botão de alternância para tela cheia na barra de ferramentas do editor de cifras com `data-testid="btn-toggle-fullscreen"`.
- [x] **3.4** Renderizar o `<SongEditorFullscreen />` mantendo o bind com o estado `content`, `setTitle`, `handleSave` e `insertText`.
- *Gate de Verificação*: Clique no botão abre o modo tela cheia e sincroniza texto perfeitamente. ✅

---

### Tarefa 4: Testes Unitários e Cobertura (Vitest >= 90%)
- [x] **4.1** Criar suite de testes `SongEditorFullscreen.test.tsx` cobrindo:
  - Renderização inicial nos modos `split`, `editor` e `preview`.
  - Abertura com detecção de viewport `>= 1280` e `< 1280`.
  - Alternância de abas no seletor segmentado.
  - Sincronização em tempo real da digitação no preview (`ChordSheet`).
  - Ação dos botões de tags rápidas (`[Refrão]`, `[coluna]`, etc.).
  - Pressionamento de tecla `Esc` disparando `onClose`.
  - Pressionamento de tecla `Ctrl+S` / `Cmd+S` disparando `onSave`.
- [x] **4.2** Atualizar `SongFormPage.test.tsx` para cobrir o botão de maximizar e a abertura do editor tela cheia.
- [x] **4.3** Executar `npm test` e verificar cobertura `>= 90%` sobre as novas linhas (93.2% linhas, 92.6% branches).
- *Gate de Verificação*: Todos os testes passando com cobertura no diff >= 90%. ✅

---

### Tarefa 5: Verificação Final e Qualidade (Lint & Build)
- [x] **5.1** Executar `npm run lint` para garantir zero avisos de ESLint (0 errors, 0 warnings).
- [x] **5.2** Executar `npm run build` do frontend para certificar integridade do build Vite (`tsc -b && vite build` OK).
- *Gate de Verificação*: Sucesso sem warnings ou erros de tipagem TypeScript. ✅
