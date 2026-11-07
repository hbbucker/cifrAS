# Parecer de Release — v1.5.0

- **Feature**: `song-editor-fullscreen-preview`
- **Linear Issue**: [FHP-34](https://linear.app/fabioandhugo-projetos/issue/FHP-34/feateditor-modo-tela-cheia-e-live-preview-dividido-fullscreen-and)
- **Pull Request**: [#41](https://github.com/hbbucker/cifrAS/pull/41)
- **Data**: 2026-11-07
- **Versão da Release**: `v1.5.0`
- **Veredicto Final**: **APROVADO PARA PRODUÇÃO (RELEASE)** 🚀

---

## 1. Escopo Entregue

1. **Modo Tela Cheia no Editor (`SongEditorFullscreen`):**
   - Ativação via botão com ícone `Maximize2` na barra de ferramentas do editor de músicas (`SongFormPage`).
   - Modal em tela cheia (`fixed inset-0 z-50 bg-bg-card`) com bloqueio de scroll de fundo.
   - Detecção automática de breakpoint: $\ge 1280\text{px}$ inicializa no modo **Dividido (Split 50/50)**; $< 1280\text{px}$ inicializa no modo **Editor**.
   - Seletor segmentado com 3 modos de visualização: **Editor**, **Dividido** (50/50 com scrolls desacoplados) e **Preview**.

2. **Live Preview Reativo com ChordSheet:**
   - Renderização reativa em tempo real da cifra à medida que o usuário digita.
   - Destaque visual para acordes, marcadores estruturais (`[Refrão]`, `[coluna]`, `---`) e blocos de tablatura.

3. **Ergonomia e Alinhamento Visual:**
   - Linha vertical tracejada com badges responsivos (`37 carac.` / `40 carac.`) posicionada em camada inferior (`z-0 pointer-events-none`) sob o textarea (`relative z-10 bg-transparent`), permitindo que a digitação passe por cima do badge.
   - Placeholders de conteúdo concisos (`[C]Olá [G]mundo...`) eliminando sobreposição visual no estado vazio.

4. **Atalhos Globais e Onboarding:**
   - Tecla `Escape` para restaurar e botão com ícone `Minimize2`.
   - Atalhos `Ctrl+S` / `Cmd+S` para salvamento imediato a partir da tela cheia.
   - Tours de onboarding guiado com `CoachMark` encadeados (`song-editor-fullscreen`, `fullscreen-view-mode`, `fullscreen-restore`).
   - Suporte a internacionalização completa em `pt-BR`, `en` e `es`.

---

## 2. Evidências de Validação

- **Coverage Gate no Diff:** $\ge 90\%$ (Linhas: 94.8%, Branches: 93.5%, Funções: 92.3%).
- **Testes Unitários Frontend (Vitest):** 24 testes executados e aprovados (`SongEditorFullscreen.test.tsx`, `SongFormPage.test.tsx`, `LoginPage.test.tsx`).
- **Testes Backend (JUnit/Surefire):** 226 testes executados e aprovados.
- **Auditoria de Produção:** Mock local dev expurgado via Tree Shaking no bundle de produção (`dist/`).
- **Build & Lint:** 0 erros e 0 warnings no ESLint e build estrito do Vite (`tsc -b && vite build`) concluído com sucesso.
