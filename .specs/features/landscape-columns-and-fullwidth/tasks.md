# TASKS: Divisão em Colunas e Expansão de Largura

- [x] **Task 1: Atualização de Traduções (i18n)**
  - Adicionar chaves para colunas (1 vs 2 colunas) e largura total (expandir / recolher) em `pt.json`, `en.json` e `es.json`.

- [x] **Task 2: Refatoração do `ChordSheet.tsx` para Suporte a Múltiplas Colunas**
  - Adicionar prop `columns?: 1 | 2` (default `1`).
  - Agrupar seções ou estrofes com `break-inside-avoid` e classes de `columns-1 md:columns-2 gap-8`.
  - Garantir compatibilidade com `singerMode`, tablaturas e acordes.

- [x] **Task 3: Atualização do `TheaterControls.tsx`**
  - Adicionar botões/toggles de colunas (`columns: 1 | 2`) e largura total (`isFullWidth: boolean`).
  - Incluir ícones Lucide (`Columns`, `Maximize2` / `Minimize2`).
  - Alvos de toque $\ge 44\times 44\text{px}$ e ARIA labels acessíveis.

- [x] **Task 4: Atualização de `TheaterModePage.tsx`**
  - Integrar estados `columns` e `isFullWidth` com persistência em `localStorage`.
  - Ajustar container de rolagem para alternar entre `max-w-4xl mx-auto` e `max-w-none w-full px-4 sm:px-8`.
  - Passar `columns` para o `ChordSheet`.

- [x] **Task 5: Atualização de `SongViewPage.tsx`**
  - Adicionar controles rápidos de colunas e largura total no header.
  - Integrar `columns` e `isFullWidth` com persistência em `localStorage`.
  - Passar `columns` para o `ChordSheet`.

- [x] **Task 6: Testes Automatizados Frontend & Cobertura $\ge 90\%$**
  - Escrever testes em `src/tests/` para `ChordSheet`, `TheaterControls`, `TheaterModePage` e `SongViewPage`.
  - Executar linter (`npm run lint`) e suite de testes (`npm test`).

- [x] **Task 7: Validação e Homologação Independente pelo QA Lead**
  - Verificação de cobertura no diff e emissão do parecer em `qa/verdict.md`.
