# Feature Specification: Multi-Provider Song Import (Ultimate Guitar, LaCuerda, Chordie, e-Chords, Cifra Club)

**Feature Name:** `multi-provider-song-import`  
**Author:** CPO (Maya)  
**Impact Classification:** I2 (Adiciona novos provedores de scraping/importação de terceiros, novos parsers de cifra, enriquecimento de DTOs e suporte i18n no modal de importação)  
**Status:** SPECIFIED  

---

## 1. Visão Geral & Problema

O CifrAS atualmente suporta apenas a importação de músicas a partir de URLs do Cifra Club (`cifraclub.com.br`). Para atender os mercados em **inglês** e **espanhol**, é indispensável permitir que músicos importem cifras diretamente das principais referências mundiais e regionais:

1. **🇬🇧 Mercado em Inglês / Global:**
   - **Ultimate Guitar** (`ultimate-guitar.com`, `tabs.ultimate-guitar.com`): Maior catálogo mundial de cifras e tablaturas.
   - **Chordie** (`chordie.com`): Catálogo baseado no padrão ChordPro / texto limpo.
   - **e-Chords** (`e-chords.com`): Catálogo tradicional focado em violão e guitarra acústica.

2. **🇪🇸 Mercado em Espanhol / América Latina:**
   - **LaCuerda.net** (`lacuerda.net`): O maior acervo de música latina, rock em espanhol e música religiosa em espanhol.

3. **🇧🇷 Mercado em Português / Brasil:**
   - **Cifra Club** (`cifraclub.com.br`): Manter 100% de retrocompatibilidade com a funcionalidade existente.

---

## 2. Personas & Casos de Uso

- **Músico Internacional (EN):** Quer colar uma URL do Ultimate Guitar ou Chordie e ter a cifra instantaneamente formatada para o Modo Teatro do CifrAS com transposição e rolagem automática.
- **Músico Hispânico (ES):** Quer colar uma URL do LaCuerda.net de uma canção gospel/latina e obter a cifra limpa, sem caracteres corrompidos por encoding ISO-8859-1 e com seções estruturais reconhecidas (`[Coro]`, `[Verso]`, `[Estribillo]`).
- **Músico Brasileiro (PT):** Continua colando links do Cifra Club ou agora também de sites internacionais para seu repertório em inglês ou espanhol.

---

## 3. Critérios de Aceite (Acceptance Criteria)

### AC-01: Auto-detecção de Provedor via URL
- O sistema deve inspecionar a URL informada e rotear automaticamente para o scraper correspondente:
  - `*cifraclub.com.br*` -> Cifra Club
  - `*ultimate-guitar.com*` -> Ultimate Guitar
  - `*lacuerda.net*` -> LaCuerda.net
  - `*chordie.com*` -> Chordie
  - `*e-chords.com*` -> e-Chords
- Se a URL não for de nenhum provedor suportado ou for inválida, a API deve retornar erro HTTP 400 (`UNSUPPORTED_PROVIDER` ou `INVALID_URL`).

### AC-02: Importação do Ultimate Guitar
- Extrair título da música, artista, tom original (`tonality_name`, quando disponível) e conteúdo da cifra (`[ch]...[/ch]`, `[tab]...[/tab]`, seções como `[Verse]`, `[Chorus]`, `[Bridge]`).
- Converter tags `[ch]` para `ChordPosition` e `Line` preservando as posições e o alinhamento.
- Adicionar tag `["imported", "ultimate-guitar"]`.

### AC-03: Importação do LaCuerda.net
- Tratar corretamente o charset da resposta (`ISO-8859-1` / `UTF-8`) para evitar problemas com acentuação e caracteres em espanhol (`á`, `é`, `í`, `ó`, `ú`, `ñ`).
- Extrair título, artista e tom original (se presente no cabeçalho ou metadados).
- Reconhecer seções em espanhol: `[Intro]`, `[Verso]`, `[Coro]`, `[Estribillo]`, `[Puente]`, `[Solo]`, `[Final]`.
- Suportar notação de acordes anglo-saxônica (`A-G`) e converter notação latina (`Do, Re, Mi, Fa, Sol, La, Si` para `C, D, E, F, G, A, B`) quando aplicável.
- Adicionar tag `["imported", "lacuerda"]`.

### AC-04: Importação do Chordie (ChordPro)
- Processar formato ChordPro (`[Am]Letra...` ou tags `{title:...}`, `{artist:...}`).
- Converter anotações inline `[Acorde]` em posições exatas de acordes (`ChordPosition`) associadas à linha de letra.
- Adicionar tag `["imported", "chordie"]`.

### AC-05: Importação do e-Chords
- Extrair cifra do bloco `<pre>` ou `<pre id="core">`.
- Remover tags HTML internas (como `<u>`, `<a>`) mantendo o espaçamento e alinhamento de acordes.
- Adicionar tag `["imported", "e-chords"]`.

### AC-06: Retrocompatibilidade com Cifra Club
- Músicas importadas do Cifra Club continuam funcionando exatamente como antes, com tags `["imported", "cifraclub"]`.

### AC-07: Interface de Usuário & Modal de Importação (UX/i18n)
- O modal [`ImportSongModal.tsx`](file:///home/bucker/orca/workspaces/cifrAS/Importar-outros-sites/codebase/src/main/webui/src/components/modals/ImportSongModal.tsx) deve ser renomeado/generalizado para "Importar Cifra da Web".
- Exibir badges/chips visuais dos 5 sites suportados: `Cifra Club`, `Ultimate Guitar`, `LaCuerda.net`, `Chordie`, `e-Chords`.
- Quando o usuário digita/cola a URL, o modal reconhece e destaca dinamicamente o badge do site correspondente.
- Suporte a i18n completo em `pt-BR`, `en` e `es`.

---

## 4. Limitações e Fora de Escopo
- Não inclui login/autenticação em contas pagas do Ultimate Guitar Pro (apenas cifras públicas/gratuitas).
- Não inclui download de arquivos Guitar Pro (`.gp5`, `.gpx`).
