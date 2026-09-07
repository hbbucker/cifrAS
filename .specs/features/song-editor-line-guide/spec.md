# Microespecificação: Linha Guia no Editor de Cifras (Song Editor Line Guide)

- **ID da Feature**: `song-editor-line-guide`
- **Classificação de Impacto**: `I1` (Ajuste visual de frontend sem impacto de contrato ou persistência)
- **Modo**: Fast-Track

---

## 1. Objetivo
Adicionar uma linha guia vertical no editor de cifras (`SongFormPage`) para orientar o músico quanto ao limite recomendado de caracteres por linha antes da quebra indesejada na visualização/Modo Teatro.
- **Desktop (PC)**: Linha guia na posição de 40 caracteres (referência para visualização com fonte tamanho 31).
- **Mobile**: Linha guia na posição de 37 caracteres (referência para visualização com fonte tamanho 17).

---

## 2. Escopo e Requisitos

### 2.1 Requisitos Funcionais & Visuais
- **RF01 (Posicionamento Responsivo)**:
  - No mobile (`< 640px`): a linha guia deve ficar posicionada a `37ch` (37 caracteres em fonte monospace) a partir do início do texto.
  - No desktop (`>= 640px`): a linha guia deve ficar posicionada a `40ch` (40 caracteres em fonte monospace) a partir do início do texto.
- **RF02 (Design System & Não Intrusividade)**:
  - A linha deve ser visualmente sutil, com estilo tracejado ou linha suave (`border-r border-dashed border-border-main`).
  - A linha deve ter `pointer-events-none` e `absolute` para não interferir na digitação, cliques ou seleção de texto no `<textarea>`.
  - A altura deve cobrir a área visível do editor.
- **RF03 (Acessibilidade & Indicador)**:
  - Deve conter um rótulo sutil ou indicador de caracteres (ex: chip/rótulo discreto "37 caracteres (mobile) / 40 caracteres (desktop)" ou tooltip informativo) para fornecer clareza do parâmetro de quebra de linha.

### 2.2 Fora de Escopo
- Bloqueio forçado de digitação além do limite (a linha é estritamente uma guia visual/referência).
- Alteração em endpoints de backend ou persistência de dados.

---

## 3. Critérios de Aceite (ACs)
- **AC01**: Na tela de criação/edição de cifra (`SongFormPage`), a linha guia vertical é exibida no container do textarea.
- **AC02**: No viewport desktop (>= 640px), a posição da linha guia corresponde a 40 caracteres (`40ch`).
- **AC03**: No viewport mobile (< 640px), a posição da linha guia corresponde a 37 caracteres (`37ch`).
- **AC04**: O usuário consegue clicar e digitar livremente sobre a área da linha guia sem qualquer interceptação de eventos de clique/foco (`pointer-events-none`).
- **AC05**: Testes unitários do frontend (`Vitest`) cobrem a renderização da linha guia com cobertura >= 90% no diff.
