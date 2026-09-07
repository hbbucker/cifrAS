# SPEC-LANDSCAPE-COLUMNS-01: Divisão em Colunas e Expansão de Largura (Modo Teatro)

## 1. Visão Geral & Proposta de Valor
Músicos utilizando tablets em suporte/pedestal no modo paisagem (landscape) ou telas widescreen de computador frequentemente encontram grandes espaços vazios nas laterais e necessidade de rolagem vertical constante durante apresentações ao vivo.

Esta especificação define a funcionalidade no **Modo Teatro**:
1. **Divisão em Múltiplas Colunas (1 vs 2 Colunas):** Permitir que a cifra seja disposta em 2 colunas balanceadas em telas médias e grandes / paisagem, reduzindo drasticamente a rolagem necessária durante apresentações e ensaios.
2. **Expansão de Largura (Contido vs. Largura Total / Full-Width):** Permitir que o usuário expanda a visualização da cifra para ocupar 100% da largura útil da tela (removendo a restrição de `max-w-4xl`) ou mantenha a visualização centralizada contida.
3. **Ativação Automática Conjugada:** Ao ativar o modo de 2 colunas, o modo de expansão (Full Width) é automaticamente ativado junto para maximizar o aproveitamento da tela.

---

## 2. Personas e Cenários de Uso
- **Músico de Palco / Igreja com Tablet no Pedestal:** Posiciona o iPad/Galaxy Tab na horizontal e entra no Modo Teatro. Ao clicar em 2 colunas, a tela se expande em 100% e divide a cifra em 2 colunas, permitindo ver a música quase inteira sem precisar rolar durante a execução.
- **Cantor / Vocalista no Modo Palco:** Em Modo Cantor (`SingerMode`), ativa 2 colunas e visualiza a letra com excelente tamanho e leitura fluida em toda a extensão do display.

---

## 3. Critérios de Aceite (Acceptance Criteria)

### AC-01: Divisão em 2 Colunas no ChordSheet
- O componente `ChordSheet` suporta a propriedade `columns: 1 | 2`.
- Quando `columns === 2`, o conteúdo é renderizado em 2 colunas balanceadas com espaçamento adequado (`md:columns-2 gap-8`).
- As seções e estrofes evitam quebras indesejadas no meio de uma linha de acorde/letra (`break-inside-avoid`).

### AC-02: Expansão de Largura (Full-Width vs. Standard Container) no Modo Teatro
- Na `TheaterModePage`, é possível alternar entre largura padrão (`max-w-4xl mx-auto`) e largura total (`max-w-none w-full`).
- A `SongViewPage` mantém seu layout focado e padrão, reservando controles de performance para o Modo Teatro.

### AC-03: Controles Intuitivos no Modo Teatro (`TheaterControls`)
- Na barra lateral/dock de controles do Modo Teatro:
  - Botão de alternância de colunas (ícone `Columns`).
  - Botão de alternância de largura total (ícones `Maximize2` / `Minimize2`).
- Alvos de toque $\ge 44\times 44\text{px}$, tooltips e `aria-label` acessíveis em `pt`, `en`, `es`.

### AC-04: Ativação Automática Conjugada
- Ao alternar para o modo de 2 colunas (`columns = 2`), a largura total (`isFullWidth = true`) é ativada automaticamente de forma instantânea e persistida.
- O usuário pode, se desejar, ajustar a largura individualmente posteriormente.

### AC-05: Compatibilidade com Recursos do Modo Teatro
- **Modo Cantor (Singer Mode):** Funciona harmoniosamente com 2 colunas e largura total.
- **Auto-Scroll & Transposição:** Auto-scroll suave e transposição de acordes instantânea em ambas as colunas.
- **Tablaturas:** Alinhamento monoespaçado e fidelidade estrutural preservados.

---

## 4. Classificação de Impacto
- **Nível de Impacto:** **I1** (Frontend / UI Feature - sem alterações no banco de dados ou backend).
