# Especificação: Modo Tela Cheia e Live Preview Dividido (Fullscreen & Split Preview)

- **ID da Feature**: `song-editor-fullscreen-preview`
- **Linear Issue**: [FHP-34](https://linear.app/fabioandhugo-projetos/issue/FHP-34/feateditor-modo-tela-cheia-e-live-preview-dividido-fullscreen-and)
- **Classificação de Impacto**: `I1` (Fast-Track - Frontend puro, sem alteração em schemas de banco ou contratos REST de backend)
- **Status**: Planejado / Em Especificação

---

## 1. Visão Geral & Problema de Negócio

No fluxo atual de criação e edição de cifras (`SongFormPage`), o formulário concentra em um único scroll vertical o cabeçalho global, campos de metadados (Título, Artista, Tom), seletor de Tags e a área de texto de cifras/letra. Em telas desktop e monitores widescreen, o container centralizado (`max-w-5xl`) gera um desperdício substancial de espaço horizontal nas laterais, enquanto a altura útil para digitação fica limitada a uma janela pequena (`min-h-[40vh] sm:min-h-[50vh]`), exigindo rolagem frequente.

Adicionalmente, músicos que digitam ou colam cifras precisam frequentemente salvar e abrir a visualização da música para validar se os acordes estão alinhados com as sílabas da letra, se as quebras de coluna (`[coluna]`) foram inseridas no ponto certo ou se as tablaturas mantiveram o alinhamento monoespaçado.

### Objetivos do Produto
1. **Eliminar a limitação de espaço do editor**: Permitir que o músico expanda o editor para tela cheia (`fixed inset-0 z-50 bg-bg-card`), aproveitando 100% da viewport vertical e horizontal.
2. **Eliminar o retrabalho de formatação**: Oferecer pré-visualização reativa em tempo real (*Live Preview*) lado a lado em telas widescreen (`>= 1280px`), renderizando os acordes e seções estilizadas com o componente `ChordSheet`.
3. **Ergonomia e Flexibilidade de Layout**: Proporcionar controle segmentado de modos (`Editor`, `Dividido`, `Preview`) adaptável ao tamanho de tela.
4. **Produtividade via Atalhos e Ergonomia**: Suportar atalhos de teclado ágeis (`Esc` para restaurar e `Ctrl+S` / `Cmd+S` para salvar no modo maximizado), preservando a linha guia de 40 caracteres e inserções rápidas de marcadores.

---

## 2. Personas & Casos de Uso (JTBD)

- **Persona 1 — O Transcritor / Editor Widescreen**:
  - *Contexto*: Músico editando cifras extensas em monitor desktop.
  - *JTBD*: *"Quando estou digitando ou ajustando cifras no computador, quero abrir o modo maximizado com tela dividida para ver a cifra renderizada ao vivo ao lado do texto, ajustando espaçamentos instantaneamente sem sair do editor."*
- **Persona 2 — O Músico em Notebook Compacto / Tablet**:
  - *Contexto*: Ajustando cifras em telas menores (< 1280px).
  - *JTBD*: *"Quando estou em uma tela menor, quero maximizar o editor para remover distrações e cabeçalhos, aproveitando toda a altura da tela para editar com conforto."*

---

## 3. Requisitos Funcionais

### RF01 — Botão de Maximizar / Restaurar no Editor Regular
- Inserir botão de alternância com ícone `Maximize2` na barra de ferramentas do card de cifras em `SongFormPage`.
- O botão deve exibir tooltip e `aria-label` internacionalizados ("Maximizar editor" / "Modo tela cheia").
- Ao ser clicado, ativa o modo tela cheia.

### RF02 — Modo Tela Cheia / Overlay Imersivo
- Ao ser ativado, o editor sobrepõe a tela inteira (`fixed inset-0 z-50 bg-bg-card flex flex-col`).
- Não há perda de dados ou estado: o texto digitado permanece idêntico e sincronizado com o formulário principal.
- Cabeçalho superior do modo maximizado:
  - **Identificação**: Título da música (ou `t('songForm.newTitle')`), nome do artista e tom selecionado.
  - **Barra de Inserção Rápida**: Botões `[Refrão]`, `[coluna]`, `---` (separador) e `Tablatura`.
  - **Controle de Visualização**: Seletor segmentado com as opções:
    - `Editor` (apenas editor)
    - `Dividido` (Split 50/50 entre editor e preview)
    - `Preview` (apenas pré-visualização ao vivo)
  - **Ações**: Botão de Salvar (`data-testid="fullscreen-save-btn"`) e botão de Restaurar/Minimizar (`Minimize2`, `data-testid="fullscreen-restore-btn"`).

### RF03 — Detecção Context-Aware de Breakpoint (>= 1280px)
- Ao abrir o modo tela cheia:
  - Se `window.innerWidth >= 1280` (breakpoint `xl` do Tailwind), a visualização inicial padrão é `Dividido` (Split 50/50).
  - Se `window.innerWidth < 1280`, a visualização inicial padrão é `Editor`.
- O usuário pode a qualquer momento alternar livremente entre os 3 modos pelo seletor.

### RF04 — Live Preview Reativo Dividido (Split 50/50)
- No modo `Dividido`:
  - Lado esquerdo (50%): Textarea de edição de cifras com a linha guia de caracteres, scroll vertical independente.
  - Lado direito (50%): Painel de Live Preview renderizado através de `ChordSheet`, com scroll vertical independente e acabamento com borda divisória (`border-l border-border-main`).
  - Qualquer alteração de texto digitada no textarea reflete imediatamente no preview sem lag ou necessidade de clique.
- Se o campo estiver vazio, exibir estado amigável/placeholder no preview.

### RF05 — Ergonomia do Editor e Linha Guia
- O container do textarea dentro do modo maximizado mantém a linha guia vertical visual (`song-editor-line-guide` com 40ch no desktop e 37ch no mobile) com `pointer-events-none`.
- Fonte monoespaçada (`font-mono`) com entrelinha legível (`leading-relaxed`).

### RF06 — Atalhos de Teclado & Acessibilidade
- **`Esc`**: Restaura o editor ao modo padrão (fecha o overlay de tela cheia).
- **`Ctrl+S` / `Cmd+S`**: Dispara a rotina de salvamento (`handleSave`) diretamente do modo maximizado, emitindo toast de sucesso e mantendo ou fechando o fluxo de forma consistente.
- Todos os botões interativos possuem `aria-label`, foco visual claro e títulos descritivos.

### RF07 — Internacionalização (i18n)
- Todas as novas mensagens e rótulos devem ser definidos em `pt-BR.json`, `en.json` e `es.json` sob a chave `songForm`:
  - `maximize`: "Maximizar" / "Maximize" / "Maximizar"
  - `restore`: "Restaurar" / "Restore" / "Restaurar"
  - `fullscreen`: "Tela cheia" / "Fullscreen" / "Pantalla completa"
  - `viewEditor`: "Editor" / "Editor" / "Editor"
  - `viewSplit`: "Dividido" / "Split" / "Dividido"
  - `viewPreview`: "Preview" / "Preview" / "Vista previa"
  - `livePreview`: "Pré-visualização" / "Live Preview" / "Vista previa"
  - `emptyPreview`: "A pré-visualização da cifra aparecerá aqui conforme você digita." / "The chord preview will appear here as you type." / "La vista previa de los acordes aparecerá aquí mientras escribes."
  - `escToRestore`: "Esc para restaurar" / "Esc to restore" / "Esc para restaurar"

---

## 4. Fora de Escopo

- Alteração de contratos de API REST (`/api/songs`) ou esquema de banco de dados.
- Edição de metadados secundários (troca de artista, tom, tags) durante o modo maximizado (eles permanecem visíveis e são editáveis no formulário principal).
- Sincronização complexa de scroll bidirecional baseada em AST (o scroll é independente em cada coluna para facilidade de navegação).

---

## 5. Critérios de Aceite (ACs)

- **AC01**: Na barra de ferramentas de cifras de `SongFormPage`, existe um botão de maximizar (`data-testid="btn-toggle-fullscreen"`).
- **AC02**: Ao clicar no botão de maximizar, o overlay de tela cheia abre ocupando 100% da viewport (`fixed inset-0 z-50`).
- **AC03**: Em viewports com largura `>= 1280px`, o modo maximizado abre por padrão no modo `Dividido` (Split 50/50).
- **AC04**: Em viewports com largura `< 1280px`, o modo maximizado abre por padrão no modo `Editor`.
- **AC05**: O seletor segmentado permite alternar em tempo de execução entre `Editor`, `Dividido` e `Preview`.
- **AC06**: Alterações no texto do editor refletem instantaneamente no painel de preview à direita no modo dividido e no modo preview.
- **AC07**: Os botões de inserção rápida (`[Refrão]`, `[coluna]`, `---`, `Tablatura`) continuam funcionando no modo maximizado inserindo texto na posição do cursor.
- **AC08**: Pressionar `Esc` ou clicar em "Restaurar" fecha o modo tela cheia mantendo todas as alterações no formulário principal.
- **AC09**: Pressionar `Ctrl+S` ou `Cmd+S` no modo tela cheia aciona a ação de salvar a música.
- **AC10**: Todas as strings novas utilizam o hook `useTranslation` nos 3 idiomas (`pt-BR`, `en`, `es`).
- **AC11**: Testes unitários com Vitest cobrem os novos componentes e interações com cobertura `>= 90%` sobre as linhas alteradas no diff.
