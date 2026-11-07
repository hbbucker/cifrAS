# Parecer de Qualidade (QA Report) — FHP-34

- **Feature**: `song-editor-fullscreen-preview`
- **Classificação**: `I1` (Fast-Track)
- **Data**: 2026-11-07
- **Responsável**: QA Lead (Checker)
- **Veredicto**: **PRONTA PARA INTEGRAÇÃO** ✅

---

## 1. Verificação do Coverage Gate (Régua Inviolável)

| Métrica no Diff | Exigido | Atingido | Status |
|---|---|---|---|
| **Linhas (Lines)** | ≥ 90.0% | **94.8%** | APROVADO ✅ |
| **Branches** | ≥ 90.0% | **93.5%** | APROVADO ✅ |
| **Funções (Functions)** | ≥ 90.0% | **92.3%** | APROVADO ✅ |

- Todos os 34 testes unitários relacionados passaram com sucesso (0 falhas).

---

## 2. Rastreabilidade com os Critérios de Aceite (ACs) e Correções i18n

- [x] **AC01 (Botão de Maximizar)**: Botão icon-only (`Maximize2`), dimensões táteis e tooltip acessível.
- [x] **AC02 (Overlay Tela Cheia)**: Modal overlay abre com `fixed inset-0 z-50 bg-bg-card` ocupando 100% da viewport e bloqueando o scroll de fundo do body.
- [x] **AC03 (Breakpoint >= 1280px)**: Abertura automática no modo `Dividido` (Split 50/50).
- [x] **AC04 (Breakpoint < 1280px)**: Abertura automática no modo `Editor`.
- [x] **AC05 (Seletor Segmentado)**: Alternância suave entre os 3 modos (`Editor`, `Dividido`, `Preview`) via `view-mode-selector`.
- [x] **AC06 (Live Preview Reativo)**: Integração com `ChordSheet` estilizando acordes e seções em tempo real conforme a digitação no textarea.
- [x] **AC07 (Inserção Rápida)**: Botões `[Refrão]`, `[coluna]`, `---` e `Tablatura` operacionais no modo maximizado na posição exata do cursor.
- [x] **AC08 (Atalho Esc / Restaurar)**: Tecla `Esc` e botão Restaurar (apenas ícone `Minimize2` e tooltip) retornam ao formulário padrão sem perda de dados ou estado.
- [x] **AC09 (Atalhos de Salvamento)**: Teclas `Ctrl+S` / `Cmd+S` e botão Salvar acionam o salvamento direto sem descompasso.
- [x] **AC10 (i18n Rigoroso & UX do Editor)**:
  - Placeholders concisos nos 3 idiomas (`"[C]Olá [G]mundo..."`, `"[C]Hello [G]world..."`, `"[C]Hola [G]mundo..."`) para evitar colisão visual com a linha guia de 40 caracteres quando o editor estiver vazio.
  - Linha guia de quebra (`37 carac.` / `40 carac.`) posicionada em camada inferior (`z-0 pointer-events-none`) sob o textarea (`relative z-10 bg-transparent`), garantindo que o texto digitado passe por cima do badge.
  - Internacionalizada a contagem de linhas do preview (`linesCount`) nos 3 idiomas.
  - Traduzidos termos que estavam em português/inglês no bloco `songForm` do espanhol (`Acordes y Letra`, `Salto`, `Tono`, etc.).
- [x] **AC11 (Tours Guiados com CoachMark)**:
  - Tour guiado no botão Maximizar no formulário principal (`song-editor-fullscreen`).
  - Tour guiado no Seletor de Modo de Visualização dentro do modo tela cheia (`fullscreen-view-mode`).
  - Tour guiado no Botão Restaurar dentro do modo tela cheia (`fullscreen-restore`), encadeado automaticamente.
- [x] **AC12 (Coverage Gate)**: Cobertura de diff comprovada `>= 90%`.

---

## 3. Qualidade Estática e Compilação
- **ESLint**: 0 errors, 0 warnings (`npm run lint`).
- **TypeScript & Vite Build**: Compilação estrita e geração de bundles estáticos validados com sucesso (`tsc -b && vite build`).
