# Especificação Funcional — Classificação de Músicas por Tags 🏷️🎸

## 1. Resumo Funcional
A funcionalidade de **Tags para Músicas** permite que os músicos categorizem suas cifras com marcadores dinâmicos, livres e reutilizáveis (ex: `Gospel`, `Rock`, `Missa`, `Acústico`, `Casamento`, `Fácil`), permitindo:
1. **Cadastro e Edição Ágeis:** Inserção e remoção rápida de tags durante a criação ou edição de uma música, com sugestões de autocompletar baseadas nas tags previamente usadas pelo próprio usuário.
2. **Filtro Rápido na Biblioteca de Músicas:** Visualização de uma barra de chips/pílulas de tags na tela principal de músicas (`SongsListPage`), permitindo filtrar por uma ou mais tags e combinar com a busca textual existente.
3. **Seleção por Tags no Modal de Playlists:** No fluxo de adicionar músicas a uma playlist (`PlaylistViewPage`), o usuário pode selecionar tags para filtrar e adicionar músicas específicas com rapidez.
4. **Exibição Visual Elegante:** Exibição de chips de tags nos cards de música (`MusicCard`), harmonizados com o design system do CifrAS.

---

## 2. Jornadas do Usuário (UX Flows)

### Jornada 1: Cadastro e Edição de Músicas com Tags
1. O usuário acessa a tela de criação de música (`/songs/new`) ou de edição (`/songs/:id/edit`).
2. Abaixo dos campos principais (Título, Artista, Tom), o usuário encontra o campo de entrada **Tags** (`TagInput`).
3. O usuário digita o nome de uma tag:
   - Se já existirem tags com prefixo coincidente no seu catálogo, um dropdown de sugestões é exibido.
   - Pressionar `Enter`, vírgula (`,`) ou selecionar uma sugestão converte o texto em um chip de tag dentro do campo.
4. O usuário pode remover tags clicando no ícone `×` do chip ou pressionando `Backspace` quando o campo de digitação estiver vazio.
5. Ao salvar a música, as tags são persistidas e normalizadas (em minúsculas/aparadas de espaços em branco, sem duplicatas).

### Jornada 2: Filtragem por Tags na Lista de Músicas
1. O usuário acessa a página de Músicas (`/songs`).
2. Abaixo da barra de pesquisa ou integrado a ela, é exibida uma barra horizontal de filtros com chips de tags:
   - O primeiro chip é `[Todas]` (selecionado por padrão).
   - Seguem os chips das tags mais frequentes do usuário com indicador de contagem (ex: `[Rock (12)]`, `[Missa (8)]`).
3. Ao clicar em um chip de tag, a listagem de músicas é filtrada instantaneamente via requisição paginada para o backend (`GET /api/songs?tags=rock`).
4. É possível combinar a busca textual com o filtro de tags (ex: termo de busca "Glória" + tag "Missa").
5. Ao clicar novamente no chip selecionado ou em `[Todas]`, o filtro é desativado.

### Jornada 3: Filtro por Tags ao Adicionar Músicas a uma Playlist
1. O usuário acessa a visualização de uma Playlist (`/playlist/:id`) e clica em **"Adicionar Músicas"**.
2. No modal de seleção de músicas, além do campo de busca textual, é exibida uma lista/carrossel de chips com as tags disponíveis no repertório do usuário.
3. Ao selecionar uma tag, o catálogo do modal é filtrado imediatamente para exibir apenas as músicas com aquela tag que ainda não estejam na playlist.
4. O usuário adiciona as músicas desejadas com um clique no botão `+`.

---

## 3. Regras de Negócio e Validações

1. **Escopo por Usuário:** As tags pertencem ao escopo do usuário autenticado. Um usuário não visualiza nem altera as tags de outros usuários.
2. **Normalização de Tags:**
   - As tags devem ser armazenadas em formato normalizado (aparadas de espaços no início/fim, sem duplicatas na mesma música).
   - Comprimento máximo de 30 caracteres por tag.
   - Máximo de 20 tags por música.
3. **Busca e Filtros:**
   - O filtro de tags aceita uma ou múltiplas tags.
   - Ao filtrar por múltiplas tags, a busca retorna músicas que possuam **todas** as tags informadas (interseção) ou qualquer uma delas conforme parâmetro. Por padrão, adota-se correspondência estrita (todas as tags fornecidas).
4. **Soft Delete:** Músicas deletadas logicamente (`deletedAt IS NOT NULL`) não contabilizam na contagem de tags nem são retornadas nas buscas por tags.

---

## 4. Requisitos de UI/UX e Design System

- **Design System Pinterest-inspired:**
  - Chips de tags em formato de pílula (`rounded-full`), fundo suave (`#8629cc/10` ou superfície neutra) e texto em tom de destaque (`#8629cc` ou `#33332e`).
  - Chip ativo com destaque primário Purple (`#aa3bff`) e texto branco/contraste alto.
  - Rolagem horizontal fluida na barra de chips para telas mobile (com suporte a toque e touch-scroll).
  - Componente `TagInput` com altura mínima acessível de 44px.
- **Internacionalização (i18n):**
  - Chaves de tradução em `src/locales/` (`pt-BR`, `en`, `es`) para rótulos como "Tags", "Todas", "Adicionar tag...", "Nenhuma tag encontrada", etc.

---

## 5. Critérios de Aceite (ACs)

- **AC-01 (Persistência de Tags):** Ao criar ou editar uma música com tags `["Rock", "Nacional"]`, as tags devem ser salvas e recuperadas corretamente no payload do endpoint `/api/songs/{id}`.
- **AC-02 (Listagem de Tags do Usuário):** O endpoint `GET /api/songs/tags` deve retornar todas as tags únicas do usuário com suas respectivas contagens de músicas ativas, ordenadas da mais frequente para a menos frequente.
- **AC-03 (Filtro por Tag no Backend):** O endpoint `GET /api/songs?tags=Rock` deve retornar apenas músicas ativas do usuário que contenham a tag `Rock`.
- **AC-04 (Combinação FTS + Tags):** O endpoint `GET /api/songs?q=Legiao&tags=Rock` deve filtrar por texto e por tag simultaneamente.
- **AC-05 (Componente TagInput):** O formulário de música deve permitir adicionar tags com `Enter`/vírgula, exibir sugestões existentes e remover tags com `×`.
- **AC-06 (Barra de Tags na Lista):** A tela `SongsListPage` deve exibir os chips de tags e filtrar as músicas ao clicar em uma tag.
- **AC-07 (Filtro de Tags no Modal da Playlist):** O modal de adicionar músicas na playlist deve permitir filtrar as músicas por tag antes de adicioná-las.
- **AC-08 (Cobertura de Testes):** Cobertura de testes unitários e de integração no diff ≥ 90% (backend e frontend).
