# Consultas Técnicas & Governança: Modo Tela Cheia e Live Preview Dividido

- **ID da Feature**: `song-editor-fullscreen-preview`
- **Classificação de Impacto**: `I1` (Fast-Track aprovado)

---

## 1. Parecer do CTO (Arquitetura Técnica)

### Viabilidade e Estrutura Técnica
- **Aprovação**: Plena viabilidade. A funcionalidade é estritamente de apresentação e interação de frontend (React + TailwindCSS + Vitest), sem qualquer impacto colateral no backend Quarkus, nas entidades JPA ou nos endpoints REST.
- **Diretriz de Componentização**:
  - Para evitar inflar o arquivo `SongFormPage.tsx` com lógica de layout complexa e facilitar a testabilidade unitária isolada, a experiência de tela cheia deve ser encapsulada em um componente dedicado:
    - `codebase/src/main/webui/src/components/music/SongEditorFullscreen.tsx`
  - Reutilização do `ChordSheet` (`codebase/src/main/webui/src/components/music/ChordSheet.tsx`):
    - O painel de Live Preview deve instanciar diretamente o componente `<ChordSheet content={content} transparent={true} />`, garantindo que os acordes, quebras de linha, stanzas e cores sejam 100% idênticos à renderização oficial da música.
  - **Detecção de Breakpoint**:
    - Ponto de corte: `1280px` (`xl` no Tailwind).
    - No momento de abertura (`openFullscreen`), inicializar `viewMode`:
      - `window.innerWidth >= 1280 ? 'split' : 'editor'`.
    - Permitir que o usuário alterne livremente entre `'editor'`, `'split'` e `'preview'` a qualquer momento.
  - **Tratamento de Atalhos e Eventos**:
    - Registrar listener de `keydown` no container ou em `window` enquanto o modo maximizado estiver montado/aberto:
      - `Escape`: chama `onClose()`.
      - `(e.ctrlKey || e.metaKey) && e.key === 's'`: previne comportamento padrão do navegador (`e.preventDefault()`) e invoca `onSave()`.
    - Ao fechar, o foco e a seleção devem ser restaurados de forma transparente.
- **Veredicto Técnico**: **Aprovado para execução Fast-Track (I1)**.

---

## 2. Parecer do CPO / UX (Design & Produto)

### Experiência do Usuário e Design System
- **Alinhamento ao Design System**:
  - O overlay deve usar `fixed inset-0 z-50 bg-bg-card flex flex-col` com fundo limpo e contrastes suaves, sem sombras excessivas.
  - **Segmented Control**: No centro do cabeçalho maximizado, um seletor em pílula (`bg-bg-main p-1 rounded-full border border-border-main flex items-center gap-1`) para alternar entre `Editor`, `Dividido` e `Preview`, com abas ativas destacadas e ícones (`Edit3`, `Columns`, `Eye`).
  - **Scrolls Independentes**: No modo dividido, tanto a coluna de edição quanto a coluna de pré-visualização devem possuir `overflow-y-auto` independente, para que o usuário possa rolar a cifra no preview sem perder a posição do cursor no textarea e vice-versa.
  - **Linha Guia de Caracteres**: Manter a linha guia (`song-editor-line-guide`) presente no textarea do modo maximizado (`left-[40ch]` em desktop / `left-[37ch]` em mobile), com `pointer-events-none`.
  - **Feedback Visual de Atalhos**: Exibir badges ou tooltips discretos informando atalhos (`Ctrl+S` / `Esc`), conferindo agilidade para músicos e transcritores.
- **Veredicto de Produto**: **Aprovado com prioridade máxima de ergonomia**.

---

## 3. Parecer do QA Lead (Estratégia de Testes & Cobertura)

### Requisitos de Qualidade e Coverage Gate
- **Regra Inviolável**: Cobertura `>= 90%` sobre as novas linhas adicionadas no diff pelo PR (avaliado via Vitest).
- **Riscos e Casos Limite Mapeados**:
  1. *Perda de texto ou descompasso*: Garantir que digitar no modo maximizado atualize o mesmo estado `content` do formulário principal, e que fechar o modal não descarte alterações.
  2. *Atalho `Ctrl+S` duplo*: Garantir que `Ctrl+S` dentro do textarea do modo maximizado previna o evento nativo de salvar página do navegador e dispare apenas o `handleSave`.
  3. *Inserção de tags rápidas*: Validar que botões `[Refrão]`, `[coluna]`, etc., no modo maximizado inserem o texto na posição correta do cursor no textarea.
  4. *Responsividade de abertura*: Validar com mocks de `window.innerWidth` que `>= 1280` abre em `'split'` e `< 1280` abre em `'editor'`.
  5. *Internacionalização*: Conferir que nenhuma string hardcoded seja introduzida nos novos componentes, respeitando `t(...)`.
- **Plano de Testes Unitários Requerido**:
  - Criar testes unitários em `codebase/src/main/webui/src/tests/SongEditorFullscreen.test.tsx` e enriquecer `SongFormPage.test.tsx` cobrindo todos os ACs da especificação.
- **Veredicto de Qualidade**: **Aprovado para início de implementação mediante cumprimento do Coverage Gate (>= 90%)**.
