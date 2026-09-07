# PLAN-LANDSCAPE-COLUMNS-01: Arquitetura Técnica & Implementação

## 1. Análise Técnica & Decisões de Arquitetura

### 1.1 Renderização em 2 Colunas no `ChordSheet`
Para suportar 2 colunas com fluidez, estabilidade visual e alta performance:
- Utilizaremos uma estrutura de blocos/seções com CSS Columns e quebras protegidas:
  - Container com classes: `columns-1 ${columns === 2 ? 'md:columns-2 gap-8' : ''}`.
  - Cada estrofe / grupo de linhas ou linha de seção com `break-inside-avoid` e `inline-block w-full` para que versos/estrofes não sejam partidos ao meio na transição de colunas.
  - A altura compacta de linhas vazias (12px) e o alinhamento de acordes (`whitespace-pre`) continuam intactos.

### 1.2 Controle de Largura do Container (Standard vs Full-Width)
- O container de rolagem em `SongViewPage` e `TheaterModePage` envolverá o `ChordSheet` com classes dinâmicas:
  - Standard: `max-w-4xl mx-auto`
  - Full-Width: `max-w-none w-full px-2 sm:px-6 md:px-12`
- O estado de `isFullWidth` e `columns` (1 ou 2) será mantido via state local e persistido no `localStorage` com chaves:
  - `cifras_theater_columns`: `'1' | '2'`
  - `cifras_theater_fullwidth`: `'true' | 'false'`
  - `cifras_songview_columns`: `'1' | '2'`
  - `cifras_songview_fullwidth`: `'true' | 'false'`

### 1.3 Controles de UI
- Em `TheaterControls.tsx`:
  - Adicionar botões com ícones Lucide:
    - Colunas: `Columns` ou `Columns2` (ou toggle entre 1 e 2 colunas).
    - Expansão: `Maximize2` / `Minimize2` (largura total vs largura contida).
  - Alvo de toque $\ge 44\times 44\text{px}$, suporte a teclado e labels i18n.
- Em `SongViewPage.tsx`:
  - Adicionar botões na barra de ferramentas superior com os mesmos controles para consistência de UX.

### 1.4 Testes Automatizados & Cobertura
- Testes unitários para `ChordSheet.tsx` cobrindo:
  - Renderização com 1 coluna (padrão)
  - Renderização com 2 colunas (`columns={2}`)
  - Combinações com `singerMode={true}`
  - Prevenção de quebra de seções (`break-inside-avoid`)
- Testes para `TheaterControls.tsx` cobrindo toggles de colunas e full-width.
- Testes para `SongViewPage.tsx` e `TheaterModePage.tsx` cobrindo persistência e alternância de classes de layout.

---

## 2. Nível de Impacto Consolidado
- **Nível de Impacto:** **I1**
- **Sem impactos em Backend / Banco de Dados / APIs.**
- **Makers:** Frontend Staff.
- **Checker:** QA Lead.
