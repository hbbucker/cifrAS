# Spec — Geração e Exportação de Apresentações (.pptx) de Playlists

## 1. Resumo Funcional

A funcionalidade **Playlist Presentation Export** permite que músicos, líderes de ministério e operadores de multimídia/projeção gerem, em um único clique, apresentações de slides prontas no formato PowerPoint (`.pptx`) e copiem letras limpas a partir de qualquer Playlist (privada ou colaborativa/de grupo).

O sistema processa a estrutura de letras (`LyricsStructure`) de todas as músicas da playlist, removendo 100% dos acordes e cifras, e monta automaticamente uma sequência de slides widescreen 16:9 de alto contraste, com paginação inteligente por estrofes/refrão, slide de abertura e slides de transição por música.

---

## 2. Personas & Jobs To Be Done (JTBD)

- **Persona 1 — O Músico/Líder Litúrgico:** Organiza o repertório da missa/culto em uma playlist e precisa disponibilizar os slides para a equipe do telão sem gastar 40 minutos editando arquivos manualmente.
- **Persona 2 — O Operador de Projeção/Telão (Membro de Grupo):** Acessa a playlist compartilhada pelo líder no computador da igreja e faz o download instantâneo do `.pptx` pronto para projetar na celebração.

> **JTBD:** *"Quando estou no dia do ensaio ou da celebração, quero gerar com 1 clique a apresentação em slides de todas as músicas da playlist, para que a assembleia acompanhe a letra com máxima legibilidade sem exigir edição manual de cifras e quebras de texto."*

---

## 3. Jornadas do Usuário (UX Flow)

### 3.1 Fluxo Principal: Exportação de Slides da Playlist
1. O usuário acessa a página de uma Playlist (`/playlists/:id`), seja ela **Privada** ou **Compartilhada/Colaborativa**.
2. Na barra superior de ações (ao lado do botão *Modo Teatro*), o usuário clica no botão **"Gerar Slides"** (ícone de apresentação `Presentation`).
3. O sistema abre o modal `ExportPlaylistPresentationModal`:
   - Exibe o nome da playlist e a quantidade de músicas.
   - Lista todas as músicas da playlist com suas ordens e caixas de seleção ativas por padrão.
   - Oferece seletor de tema de projeção:
     - 🌙 **Modo Telão / Alto Contraste (Dark - Padrão):** Fundo preto (`#000000`) com texto branco em negrito (`#FFFFFF`).
     - ☀️ **Modo Clean / Claro (Light):** Fundo branco com texto escuro.
     - ⛪ **Modo Litúrgico (Solene):** Fundo azul marinho profundo (`#0A1128`) com texto branco.
   - Opções de estrutura:
     - Checkbox: *Incluir slide de abertura da Playlist* (marcado por padrão).
     - Checkbox: *Incluir slide de título antes de cada música* (marcado por padrão).
4. O usuário clica em **"Baixar PowerPoint (.pptx)"**:
   - O sistema gera o arquivo binário `.pptx` em memória no navegador.
   - O download do arquivo `Nome_Da_Playlist.pptx` inicia automaticamente.
   - Um feedback visual de sucesso (Toast) é exibido: *"Apresentação gerada com sucesso!"*.
5. O modal é fechado automaticamente ou pelo usuário.

### 3.2 Fluxo Secundário: Copiar Todas as Letras (Área de Transferência)
1. No modal de exportação, o usuário clica em **"Copiar Todas as Letras"**.
2. O sistema compila o texto puro de todas as músicas selecionadas (título, artista e estrofes sem cifras).
3. O texto consolidado é gravado no Clipboard do dispositivo.
4. O sistema exibe um Toast: *"Letras copiadas para a área de transferência!"*.

### 3.3 Fluxos de Exceção
- **Playlist Vazia:** Se a playlist não possuir músicas, o botão "Gerar Slides" fica desabilitado com tooltip indicando *"Adicione músicas para gerar slides"*, ou ao clicar abre mensagem informativa.
- **Música Sem Letra:** Se alguma música tiver `lyrics` vazio ou nulo, o sistema gera o slide de título da música e segue para a próxima sem quebrar a geração.
- **Erro de Geração:** Caso ocorra falha na geração do arquivo, exibe Toast de erro amigável sem travar a interface.

---

## 4. Regras de Negócio e Permissões

1. **Permissões de Acesso:**
   - **Playlists Privadas:** Apenas o dono da playlist pode visualizar e gerar slides.
   - **Playlists Compartilhadas / de Grupo:** Qualquer membro autenticado do grupo associado à playlist pode visualizar e gerar slides.
2. **Desacoplamento de Cifras:**
   - As letras nos slides e no texto copiado NUNCA devem conter símbolos de acordes (`C`, `G/B`, `Am7`, etc.), barras de compasso soltas ou marcações estruturais que poluam a leitura da congregação.
3. **Paginação Inteligente por Slide:**
   - Cada seção (`[Verso]`, `[Refrão]`, `[Ponte]`) deve ser respeitada como unidade lógica.
   - Limite máximo de **4 a 6 linhas por slide** para garantir fonte grande (36 a 44pt) e legibilidade a distância.
   - Se uma estrofe contiver mais de 6 linhas, ela é dividida automaticamente em 2 slides contíguos sem cortar palavras no meio.
4. **Widescreen 16:9:**
   - Todo arquivo gerado deve estar na proporção padrão 16:9 (`LAYOUT_16x9`).

---

## 5. Requisitos de UI/UX & Design System

- **Padrão Estético:** Seguir rigorosamente o Design System do CifrAS (Pinterest-inspired, sem sombras, cantos arredondados de `16px` para botões/cards e `32px` para o modal).
- **Internacionalização (i18n):** 100% das mensagens, botões e labels devem estar nos arquivos de tradução (`pt-BR`, `en`, `es`).
- **Acessibilidade:** Elementos interativos com atributos `aria-label`, foco navegável por teclado e contraste AAA.

---

## 6. Critérios de Aceite (Checklist Binário para QA Lead)

- [ ] **AC-01:** O botão "Gerar Slides" está visível no cabeçalho da página `PlaylistViewPage` tanto para playlists privadas quanto colaborativas.
- [ ] **AC-02:** Clicar no botão abre o modal `ExportPlaylistPresentationModal` exibindo a lista de músicas, opções de tema e botões de ação.
- [ ] **AC-03:** Clicar em "Baixar PowerPoint (.pptx)" dispara o download de um arquivo `.pptx` válido na proporção 16:9.
- [ ] **AC-04:** Os slides gerados NÃO contêm cifras ou acordes musicais, exibindo apenas o texto das letras limpas.
- [ ] **AC-05:** Os slides respeitam a paginação com no máximo 6 linhas por slide e tamanho de fonte adequado para projeção ($\ge 36\text{pt}$).
- [ ] **AC-06:** Se o usuário desmarcar uma música na lista do modal, essa música não é incluída no `.pptx` gerado.
- [ ] **AC-07:** A ação "Copiar Todas as Letras" copia o texto puro de todas as músicas selecionadas para o Clipboard.
- [ ] **AC-08:** O layout e temas (Dark, Light, Litúrgico) aplicam corretamente as cores de fundo e texto configuradas.
- [ ] **AC-09:** A aplicação não quebra quando uma música possui letra vazia ou apenas introdução instrumental.
- [ ] **AC-10:** Todas as strings da interface utilizam hooks do `react-i18next` sem textos hardcoded.

---

## 7. Classificação de Impacto

- **Nível Consolidado:** **I1** (Feature de apresentação isolada sem migrações de banco destrutivas).
- **Sinais:** Inclusão de componente modal, utilitário client-side de geração de PowerPoint (`pptxgenjs`), enriquecimento do DTO de playlist se necessário, 100% coberto por testes unitários e de integração.
- **Gates Exigidos:** Suíte unitária do backend e frontend $\ge 90\%$ no diff, validação de renderização dos slides e lint/build 100% limpos.
