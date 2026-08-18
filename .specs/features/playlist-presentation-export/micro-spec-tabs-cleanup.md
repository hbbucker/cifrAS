# Micro-Spec — Limpeza Completa de Tablaturas, Dedilhados e Ritmo na Exportação de Slides (.pptx) e Clipboard

**Feature:** Playlist Presentation Export (`playlist-presentation-export`)  
**Autor:** CPO (Chief Product Officer)  
**Status:** Especificado / Pronto para Planejamento & Implementação  
**Classificação de Impacto:** **I1 (Padrão — Fast-Track)**  
**Referência de Governança:** [`AGENTS.md`](file:///home/bucker/Documentos/Projecsts/cifrAS/AGENTS.md) e [`.specs/project/TESTING.md`](file:///home/bucker/Documentos/Projecsts/cifrAS/.specs/project/TESTING.md)

---

## 1. Problema de Produto & Diagnóstico

### 1.1 Relato do Usuário
> *"a feature que gera o pptx está removendo as cifras mas não esta removendo as tablaturas está ficando com lixo, no pptx e na hora de colar pra memória"*

### 1.2 Análise da Causa Raiz
No motor atual de extração de letras limpas (`presentationGenerator.ts` / `extractCleanLyricsSections`), o algoritmo filtra apenas linhas que se enquadram como linhas de acordes/cifras (`isChordLine`) ou simplesmente extrai `line.text` das seções do JSON estruturado `LyricsStructure`.

Porém:
1. **No JSON Estruturado (`LyricsStructure`):** O parser de cifras (`lyricsParser.ts`) não descarta tablaturas nem diagramas de dedilhado ao importar uma cifra; em vez disso, ele salva as linhas de tablatura (ex: `e|---0-1-2---|`) ou setas de ritmo (ex: `↓ ↑ ↓ ↑`) como `line.text` sem acordes associados. Na hora da exportação, `extractCleanLyricsSections` assume que todo `line.text` não vazio é letra cantável e inclui no slide/clipboard.
2. **No Fallback de Texto Puro (`content`):** A função de fallback apenas verifica `isChordLine`, ignorando verificações de tablatura (`isTabLineHelper`), linhas de setas de batida/strumming, padrões de dedilhado (ex: `P I M A`) ou anotações de execução técnica.
3. **Seções Órfãs / Instrumentais:** Quando uma seção como `[Intro]`, `[Tab]`, `[Solo]` ou `[Dedilhado]` continha apenas tablaturas e acordes, a remoção das cifras deixa as linhas de tablatura isoladas; ou se a tablatura for removida sem tratamento de seções, o cabeçalho `[Intro]` / `[Tab]` é gerado como um slide em branco ou cabeçalho vazio sem letra.

### 1.3 Impacto na Jornada do Usuário (UX & Negócio)
- **Projeção em Telão (Igreja / Culto / Show):** O público e a congregação visualizam slides em fontes gigantes (32–44pt) com strings técnicas como `e|---0-2-3---|` ou `↓↓↑↑↓↓`, poluindo visualmente a celebração e quebrando a experiência de leitura fluida.
- **Cópia para a Memória (Clipboard):** Músicos e líderes que copiam o repertório para colar em livretos litúrgicos, programas de culto, mensagens de WhatsApp ou softwares externos (Holyrics, EasyWorship, ProPresenter) recebem blocos de lixo de tablatura, exigindo higienização manual e anulando o ganho de tempo da funcionalidade.
- **Músicas 100% Instrumentais com Tablatura:** Músicas sem letra que contêm solos em tablatura devem ser identificadas e resumidas elegantemente como `(Instrumental / Sem letra cadastrada)`, em vez de gerarem dezenas de slides com traços e números desconexos.

---

## 2. Escopo & Regras de Sanitização de Domínio

Tanto na geração do arquivo `.pptx` quanto na cópia de texto para a área de transferência (`exportCleanLyricsText`), o processador deve aplicar as seguintes regras de higienização estrita:

### 2.1 Identificação e Remoção de Tablaturas (Tab Lines)
Devem ser identificadas e completamente removidas:
1. Linhas que se iniciam com identificadores de corda seguidos de barra vertical:
   - Cordas padrão e afinações alternativas com ou sem sustenido/bemol: `e|`, `E|`, `B|`, `G|`, `D|`, `A|`, `eb|`, `Eb|`, `Ab|`, `Db|`, `Gb|`, `Bb|`, `F#|`, etc.
   - Padrão Regex: `/^\s*([eBGDAEa-g][#b]?|[1-6])\s*\|/i`
2. Linhas de tablatura sem letra de corda explícita iniciadas por barra:
   - Padrão Regex: `/^\s*\|\s*[-0-9hpsx/\\b~v^|]+/i`
3. Linhas com alta densidade de notação de tablatura (hífens contínuos, números de trastes, técnicas de hammer-on/pull-off/slides):
   - Exemplo: `|---0-2-3--5/7---0---|` ou `---0--2--3---0--2--|` (onde mais de 60% dos caracteres não vazios são traços `-`, pipes `|` e dígitos).

### 2.2 Identificação e Remoção de Diagramas de Ritmo, Batida e Dedilhado
Devem ser identificadas e completamente removidas:
1. **Linhas com Setas de Batida / Strumming:**
   - Exemplo: `↓ ↑ ↓ ↑`, `↓  ↑  ↓  ↑`, `v ^ v ^`, `⭣ ⭡ ⭣ ⭡`, `↓↓↑↑↓↓`
   - Padrão Regex: `/^[\s]*[↓↑⭣⭡v^]+[\s↓↑⭣⭡v^]*$/i`
2. **Linhas com Padrões de Dedilhado (Fingerpicking):**
   - Exemplo: `P I M A`, `P I M A M I`, `P - I - M - A`, `p i m a`, `P-I-M-A`
   - Padrão Regex: `/^[\s]*(P[\s-]*I[\s-]*M[\s-]*A[\s-]*[MIA]*)+[\s]*$/i`
3. **Linhas de Metadados / Anotações de Execução Instrumental:**
   - Linhas que contêm exclusivamente instruções técnicas isoladas como:
     - `Batida: ...`, `Ritmo: ...`, `Dedilhado: ...`, `Afinação: ...`, `Capo: ...`, `Tom: ...`, `BPM: ...`, `Compasso: ...`

### 2.3 Descarte de Seções Órfãs e Seções Puramente Instrumentais
1. Após a filtragem linha a linha de acordes, tablaturas, diagramas e espaços em branco:
   - Se uma seção (ex: `[Intro]`, `[Tab]`, `[Solo]`, `[Dedilhado]`, `[Passagem]`, `[Riff]`, `[Interlúdio]`) ficar com **0 linhas de letra cantada**, a seção inteira deve ser **descartada**, evitando que o seu rótulo/badge gere um slide vazio ou cabeçalho isolado.
2. Se **todas as seções** de uma música forem descartadas (música puramente instrumental com acordes/tabs):
   - A música deve retornar um array de seções vazio `[]`.
   - O gerador de PPTX tratará a música adicionando o slide informativo padrão: `(Instrumental / Sem letra cadastrada)`.
   - O gerador de texto do clipboard adicionará a anotação padrão: `(Instrumental / Sem letra)`.

### 2.4 Proteção de Letras Válidas (Anti-Falsos Positivos)
- Letras contendo palavras hifenizadas ("Eis-me", "guia-me", "dá-nos", "paz-lhe"), pontuações ("...", ",", "!", "?"), números ordinais ("1ª vez", "2x") ou letras de verso normais NÃO devem ser filtradas ou mutiladas.

---

## 3. Critérios de Aceite (AoC — Acceptance Criteria)

Os critérios abaixo são binários e serão validados pelo **QA Lead** antes da aprovação de integração:

### PPTX (Apresentação de Slides)
- [ ] **AC-PPTX-01:** Nenhuma linha de tablatura de 6 ou 4 cordas (ex: `e|---`, `B|---`, `G|---`, `D|---`, `A|---`, `E|---` ou `1|---` a `6|---`) é renderizada nos slides do arquivo `.pptx`.
- [ ] **AC-PPTX-02:** Nenhuma linha de diagrama de batida/ritmo com setas (`↓`, `↑`, `v`, `^`) ou dedilhado (`P I M A`) é renderizada nos slides do arquivo `.pptx`.
- [ ] **AC-PPTX-03:** Seções instrumentais que continham apenas tablaturas, acordes ou dedilhados (ex: `[Tab]`, `[Intro]`, `[Solo]`) e que ficaram sem letra são completamente removidas e não geram slides em branco ou badges soltos.
- [ ] **AC-PPTX-04:** Músicas com apenas solos/tablaturas (sem letra) geram exatamente um slide com o título e a indicação `(Instrumental / Sem letra cadastrada)`.

### Clipboard (Cópia de Letras)
- [ ] **AC-CLIP-01:** O texto gerado pela função "Copiar Todas as Letras" e enviado ao Clipboard não contém nenhuma linha de tablatura (ex: `e|---...`).
- [ ] **AC-CLIP-02:** O texto copiado não contém linhas de diagramas de ritmo/batida (`↓ ↑ ↓ ↑`) ou dedilhado (`P I M A`).
- [ ] **AC-CLIP-03:** Seções instrumentais sem texto cantado não geram cabeçalhos órfãos (ex: `[Intro]` ou `[Solo]` sozinhos) no texto copiado.
- [ ] **AC-CLIP-04:** Músicas puramente instrumentais exibem no texto copiado a indicação `(Instrumental / Sem letra)`.

### Compatibilidade & Robustez
- [ ] **AC-ROB-01:** A sanitização opera corretamente tanto para músicas com JSON estruturado `lyrics` quanto para músicas carregadas via string pura `content`.
- [ ] **AC-ROB-02:** Letras de músicas legítimas contendo hífens, pontuações, acentuações e repetições (ex: "Eis-me aqui", "(2x)") são preservadas sem corrupção.

---

## 4. Matriz de Impacto e Testes (Startup OS)

- **Classificação:** **I1 (Padrão — Fast-Track)**
  - *Sinais:* Ajuste isolado no utilitário de processamento/extração de texto (`src/utils/presentationGenerator.ts`), sem migração de banco de dados, sem novos endpoints REST e sem dependências de pacotes adicionais.
  - *Gate da Entrega:* Suíte de testes unitários no frontend (`src/tests/presentationGenerator.test.ts` e `src/tests/ExportPlaylistPresentationModal.test.tsx`) cobrindo todos os casos de tablatura, dedilhado, ritmo, seções órfãs e instrumentos com $\ge 90\%$ de cobertura de linhas no diff.
  - *Validação de QA:* Avaliação formal independente pelo QA Lead.
