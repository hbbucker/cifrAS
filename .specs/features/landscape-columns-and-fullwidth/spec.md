# SPEC-LANDSCAPE-COLUMNS-01: Divisão em Colunas e Expansão de Largura (ChordSheet & Modo Teatro)

## 1. Visão Geral & Proposta de Valor
Músicos utilizando tablets em suporte/pedestal no modo paisagem (landscape) ou telas widescreen de computador frequentemente encontram grandes espaços vazios nas laterais e necessidade de rolagem vertical constante. 

Esta especificação define a funcionalidade de:
1. **Divisão em Múltiplas Colunas (1 vs 2 Colunas):** Permitir que a cifra seja disposta em 2 colunas balanceadas em telas médias e grandes / paisagem, reduzindo drasticamente a rolagem necessária durante apresentações e ensaios.
2. **Expansão de Largura (Contido vs. Largura Total / Full-Width):** Permitir que o usuário expanda a visualização da cifra para ocupar 100% da largura útil da tela (removendo a restrição de `max-w-4xl`) ou mantenha a visualização centralizada contida.

---

## 2. Personas e Cenários de Uso
- **Músico de Palco / Igreja com Tablet no Pedestal:** Posiciona o iPad/Galaxy Tab na horizontal. Deseja ver a música inteira em duas colunas sem precisar rolar durante a execução.
- **Músico em Desktop / Notebook:** Deseja expandir a tela ao máximo e usar duas colunas para praticar músicas longas ao lado de outros programas ou em tela cheia.
- **Cantor / Vocalista:** Em Modo Cantor (`SingerMode`), deseja visualizar a letra em 2 colunas ocupando a tela toda.

---

## 3. Critérios de Aceite (Acceptance Criteria)

### AC-01: Divisão em 2 Colunas no ChordSheet
- O componente `ChordSheet` deve suportar a propriedade `columns: 1 | 2`.
- Quando `columns === 2` e a tela permitir ($\ge$ breakpoint md/lg ou quando ativado), o conteúdo é renderizado em 2 colunas balanceadas com espaçamento adequado entre colunas (`gap-8`).
- As seções e estrofes devem evitar quebras indesejadas no meio de uma linha de acorde/letra (`break-inside-avoid`).
- Quando `columns === 1`, o comportamento linear tradicional em coluna única é mantido.

### AC-02: Expansão de Largura (Full-Width vs. Standard Container)
- Na `SongViewPage` e na `TheaterModePage`, deve ser possível alternar entre largura padrão (`max-w-4xl mx-auto`) e largura total (`max-w-none w-full px-4`).
- A transição visual deve ser fluida e não desalinhar acordes nem quebrar tablaturas.

### AC-03: Controles Intuitivos no Modo Teatro (`TheaterControls`)
- Na barra flutuante de controles do Modo Teatro, deve haver:
  - Botão de alternância de colunas (ícone de 1 coluna vs 2 colunas).
  - Botão de alternância de largura total (ícone de Expandir/Recolher largura).
- Ambos os botões devem ter tamanho de toque $\ge 44\times 44\text{px}$ para fácil acionamento em telas de toque.
- Tooltips e `aria-label` acessíveis com traduções completas.

### AC-04: Controles na Página de Visualização de Música (`SongViewPage`)
- No cabeçalho/barra de ferramentas da `SongViewPage`, disponibilizar os botões de alternância rápida de colunas (1 / 2) e expansão de largura.
- Manter persistência local da preferência do usuário no `localStorage` para que a escolha seja lembrada entre execuções.

### AC-05: Compatibilidade com Recursos Existentes
- **Modo Cantor (Singer Mode):** Deve funcionar perfeitamente com 2 colunas e largura total.
- **Auto-Scroll:** O auto-scroll deve continuar funcionando suavemente na visualização de 2 colunas.
- **Transposição de Tom:** A transposição imediata deve atualizar ambas as colunas instantaneamente.
- **Tablaturas:** Tablaturas preservam fonte monoespaçada e alinhamento visual em ambas as colunas.

### AC-06: Internacionalização & Acessibilidade
- 100% dos textos e labels devem estar nos arquivos de tradução (`pt`, `en`, `es`).
- Elementos com `aria-label`, suporte a navegação por teclado e sem avisos de lint.

---

## 4. Classificação de Impacto
- **Nível de Impacto:** **I1** (Frontend / UI Feature - sem alterações no banco de dados ou backend).
