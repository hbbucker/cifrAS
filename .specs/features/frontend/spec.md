# CifrAS — Frontend Specification (React + TypeScript)

## Problem Statement

Músicos precisam de uma interface multi-dispositivo (web, mobile, tablet) que seja intuitiva para gerenciar cifras em momentos de calma (edição, organização) e extremamente eficiente em momentos de pressão (performance ao vivo, Modo Teatro). O design já está definido no Design System e os assets visuais (ícones, paleta, tipografia) estão estabelecidos.

## Goals

- [ ] Interface responsiva (mobile-first) cobrindo todos os fluxos do PRD e do Design System
- [ ] Transposição de tom exibida em tempo real (< 100ms após clique)
- [ ] Modo Teatro funcional com rolagem automática suave e controles de toque grandes
- [ ] Acessibilidade WCAG 2.1 AA: contraste mínimo 4.5:1, navegação por teclado, ARIA labels
- [ ] Tempo de carregamento inicial < 3s em conexão 3G (LCP)

## Design System Reference

O Design System define:
- **Paleta:** Primária `#8B5CF6` (roxo), Secundária `#EC4899` (rosa), Sucesso `#10B981`, Aviso `#F59E0B`, Erro `#EF4444`
- **Tipografia:** Inter (corpo), Courier New (cifras/acordes)
- **Componentes:** Botões (Primary/Secondary/Tertiary/Danger), Cards de Música/Playlist/Grupo, Modais, Navigation (Sidebar desktop, Bottom Nav mobile)
- **Breakpoints:** Mobile ≤640px, Tablet 641–1024px, Desktop ≥1025px
- **Animações:** Fade 200–300ms, Hover 150ms

## Out of Scope

| Feature | Reason |
|---|---|
| App nativo iOS/Android | v2 — React Native |
| Modo offline / PWA avançado | v2 |
| Gravação/reprodução de áudio | Fora do produto |
| Diagrama interativo de acorde (fretboard) | v2 |
| i18n / internacionalização | Apenas PT-BR no MVP |

---

## User Stories

### P1: Autenticação — Telas de Login e Registro ⭐ MVP

**User Story**: Como músico, quero uma tela de login e registro clara para acessar minha conta de forma segura.

**Why P1**: Portão de entrada de todas as funcionalidades.

**Acceptance Criteria**:

1. WHEN usuário acessa `/login` THEN sistema SHALL exibir formulário com campos `Email` e `Senha` e botão `Entrar` (Primary Button roxo)
2. WHEN usuário acessa `/register` THEN sistema SHALL exibir formulário com `Nome`, `Email`, `Senha` e `Confirmar Senha`
3. WHEN usuário envia formulário inválido (campo vazio, email malformado, senhas não coincidem) THEN sistema SHALL exibir mensagem de erro inline abaixo do campo afetado (cor `#EF4444`)
4. WHEN login é bem-sucedido THEN sistema SHALL armazenar JWT no localStorage/cookie e redirecionar para `/dashboard`
5. WHEN JWT expirar THEN sistema SHALL redirecionar automaticamente para `/login` com mensagem "Sessão expirada"
6. WHEN usuário clica em "Sair" THEN sistema SHALL limpar tokens e redirecionar para `/login`

**Design spec:**
- Tela centralizada, fundo `#111827` (Neutro 900)
- Logo + ícone de violão ao topo
- Card de formulário com `border-radius: 16px`, fundo `#1F2937`
- Link "Ainda não tem conta? Registre-se" em roxo `#8B5CF6`

**Independent Test**: Abrir `/login` → preencher credenciais erradas (ver erro inline) → preencher corretas → redirecionar para dashboard.

---

### P1: Dashboard — Lista de Músicas ⭐ MVP

**User Story**: Como músico, quero ver todas as minhas músicas em um grid/lista para navegar rapidamente pelo meu repertório.

**Why P1**: Tela principal do app; ponto de partida de todos os fluxos.

**Acceptance Criteria**:

1. WHEN usuário acessa `/dashboard` ou `/songs` THEN sistema SHALL exibir header com busca, sidebar (desktop) ou bottom nav (mobile) e grid de Music Cards
2. WHEN lista está carregando THEN sistema SHALL exibir skeleton cards (3 colunas desktop, 2 tablet, 1 mobile)
3. WHEN lista está vazia THEN sistema SHALL exibir empty state: ícone de violão + "Nenhuma música ainda. Adicione sua primeira!" + botão "Adicionar Música"
4. WHEN usuário clica em Music Card THEN sistema SHALL navegar para `/songs/{id}`
5. WHEN usuário clica em ⋮ (menu contextual) no Card THEN sistema SHALL exibir opções: Editar, Compartilhar, Deletar
6. WHEN usuário clica em "Deletar" no menu contextual THEN sistema SHALL exibir modal de confirmação antes de deletar

**Music Card spec (baseado no Design System):**
- Thumbnail com ícone de violão roxo (`#8B5CF6`) em fundo `#EDE9FE`
- Título em Inter Semibold 16px, Artista em Inter Regular 14px `#6B7280`
- Chips de tom (ex: `Em`) e categoria/tag (ex: `Rock`, `Worship`)
- Ícone de coração (favorito) e botão de menu `⋮`
- Hover: elevação de sombra + border `#8B5CF6` (150ms)

**Independent Test**: Logar → acessar dashboard → confirmar skeleton aparece → músicas carregam → clicar em uma música → navegar para detalhes.

---

### P1: Visualização de Música com Transposição ⭐ MVP

**User Story**: Como músico, quero visualizar a cifra de uma música com acordes e letra em formato claro, e transpor o tom com um clique.

**Why P1**: Funcionalidade principal — é o que músicos usam durante prática e ensaio.

**Acceptance Criteria**:

1. WHEN usuário acessa `/songs/{id}` THEN sistema SHALL exibir título, artista, tom atual e a cifra com acordes alinhados acima da letra em fonte monospace (Courier New 18–24px)
2. WHEN usuário clica em `Tom +` THEN sistema SHALL incrementar tom, chamar API e re-renderizar acordes em < 200ms
3. WHEN usuário clica em `Tom -` THEN sistema SHALL decrementar tom e re-renderizar acordes
4. WHEN acordes são transpostos THEN sistema SHALL exibir o tom atual atualizado (ex: "Tom: G → Am")
5. WHEN usuário clica em "Modo Teatro" THEN sistema SHALL navegar para `/theater/{songId}` ou entrar em fullscreen
6. WHEN usuário clica em "Adicionar a Playlist" THEN sistema SHALL abrir modal de seleção de playlist

**Layout (baseado no Design System — Layout 7.3):**
```
Header
Breadcrumb: Minhas Músicas > [Título]
[Título] | [Artista] | Tom: [X]
[Tom -] [Tom Atual] [Tom +] | [Editar] [Compartilhar]
─────────────────────────────────────
Cifra em Courier New (monospace)
Am          E
Letra...
─────────────────────────────────────
[Modo Teatro] [Adicionar a Playlist]
```

**Transpose Button Pair:** Seguindo `button_states.png` — trio `[-] [Tom] [+]` com fundo escuro `#1F2937`, bordas arredondadas, texto do tom em roxo `#8B5CF6`.

**Independent Test**: Abrir música em G → clicar Tom+ 2x → tom vira A → acordes re-renderizados corretamente.

---

### P1: Adicionar / Editar Música ⭐ MVP

**User Story**: Como músico, quero um editor para adicionar novas músicas e editar cifras existentes de forma intuitiva.

**Why P1**: Sem entrada de dados o app é somente leitura.

**Acceptance Criteria**:

1. WHEN usuário clica em "Adicionar Música" THEN sistema SHALL navegar para `/songs/new` com formulário em branco
2. WHEN usuário preenche e salva formulário válido THEN sistema SHALL chamar `POST /songs`, exibir toast "Música salva!" e navegar para `/songs/{id}`
3. WHEN usuário acessa `/songs/{id}/edit` THEN sistema SHALL pré-preencher formulário com dados existentes
4. WHEN usuário cancela edição THEN sistema SHALL exibir modal de confirmação se houver alterações não salvas
5. WHEN usuário digita cifra no campo de texto THEN sistema SHALL aceitar formato livre com acordes entre colchetes (ex: `[Am]Letra [E]da música`)
6. WHEN formulário tem erros de validação THEN sistema SHALL destacar campos inválidos com borda vermelha e mensagem

**Campos do formulário:**
- Título (obrigatório), Artista (obrigatório), Tom Original (Select com 12 tons), Letra + Cifras (Textarea grande, monospace)
- Botões: `Salvar` (Primary/roxo), `Cancelar` (Tertiary)

**Independent Test**: Clicar "Adicionar Música" → preencher campos → salvar → ver música no dashboard.

---

### P1: Playlists — Criar e Visualizar ⭐ MVP

**User Story**: Como músico, quero criar playlists e visualizar as músicas em sequência para usar em apresentações.

**Why P1**: Playlists são o fluxo de trabalho de performance.

**Acceptance Criteria**:

1. WHEN usuário acessa `/playlists` THEN sistema SHALL exibir grid de Playlist Cards com nome, número de músicas e ícone de colaboração (se aplicável)
2. WHEN usuário clica em "Criar Playlist" THEN sistema SHALL abrir modal com campos: Nome, Tipo (Pessoal/Colaborativa), Grupo (se colaborativa)
3. WHEN usuário abre playlist THEN sistema SHALL exibir músicas em sequência numerada, com drag-and-drop para reordenar (desktop) ou botões ↑↓ (mobile)
4. WHEN usuário clica em música na playlist THEN sistema SHALL navegar para visualização da música mantendo contexto de playlist (breadcrumb: Playlists > [Nome] > [Música])
5. WHEN playlist é colaborativa THEN sistema SHALL exibir badge "Colaborativa" e lista de membros/avatares

**Independent Test**: Criar playlist → adicionar 3 músicas → reordenar via drag → confirmar nova ordem ao reabrir.

---

### P1: Modo Teatro (Performance Mode) ⭐ MVP

**User Story**: Como músico em apresentação ao vivo, quero um modo de tela cheia minimalista com rolagem automática para performar sem tocar no celular.

**Why P1**: Diferencial central do produto para o público de músicos de eventos.

**Acceptance Criteria**:

1. WHEN usuário entra no Modo Teatro THEN sistema SHALL exibir tela cheia (fullscreen API) apenas com título, artista, cifra e barra de controles
2. WHEN Modo Teatro inicia THEN sistema SHALL iniciar rolagem automática com velocidade padrão (pré-definida por música ou global)
3. WHEN usuário toca/clica em `Tom +` ou `Tom -` THEN sistema SHALL transpor acordes da música atual sem sair do modo
4. WHEN usuário toca/clica em `►` (próxima) ou `◄` (anterior) THEN sistema SHALL carregar próxima/anterior música da playlist
5. WHEN usuário toca em `⏸` THEN sistema SHALL pausar rolagem automática
6. WHEN usuário toca em `⊙ Velocidade` THEN sistema SHALL exibir slider de velocidade de rolagem (1–10)
7. WHEN usuário toca em `✕ Sair` THEN sistema SHALL sair do fullscreen e retornar à playlist

**Layout (baseado no Design System — Layout 7.2):**
```
[Tela cheia — fundo #111827]

[Título - Artista]

[Cifra com rolagem automática]
Am          E
Letra...

[Tom -] [Tom: Am] [Tom +]
[◄ Anterior] [► Próxima]
[⏸ Pause] [⊙ Speed] [✕ Sair]
```

**Botões:** Grandes (min 48px touch target), fundo semitransparente `rgba(0,0,0,0.6)` na barra de controles.

**Independent Test**: Iniciar Modo Teatro em playlist de 3 músicas → verificar rolagem automática → clicar próxima (muda música) → clicar Tom+ (acordes transpostos) → sair (volta à playlist).

---

### P1: Busca Global ⭐ MVP

**User Story**: Como músico, quero buscar músicas pelo nome, artista ou trecho da cifra de qualquer tela.

**Why P1**: Repositórios grandes tornam a busca essencial.

**Acceptance Criteria**:

1. WHEN usuário foca na barra de busca (header) THEN sistema SHALL exibir dropdown com histórico recente
2. WHEN usuário digita ≥ 2 caracteres THEN sistema SHALL exibir resultados em tempo real (debounce 300ms) com título, artista e tom
3. WHEN usuário seleciona resultado THEN sistema SHALL navegar para `/songs/{id}`
4. WHEN busca retorna vazio THEN sistema SHALL exibir "Nenhuma música encontrada para '[termo]'"
5. WHEN usuário pressiona Enter THEN sistema SHALL navegar para `/search?q={termo}` com página completa de resultados

**Independent Test**: Digitar "Hall" → ver "Hallelujah - Leonard Cohen" no dropdown → clicar → ir para a música.

---

### P2: Grupos e Colaboração

**User Story**: Como músico líder de banda, quero criar grupos, convidar membros e compartilhar playlists colaborativas.

**Why P2**: Importante mas requer que playlists e autenticação funcionem primeiro.

**Acceptance Criteria**:

1. WHEN usuário acessa `/groups` THEN sistema SHALL exibir lista de grupos com nome, número de membros e playlists associadas
2. WHEN usuário cria grupo THEN sistema SHALL abrir modal com Nome e convite por email
3. WHEN usuário adiciona membro THEN sistema SHALL exibir campo de email com autocomplete de usuários da plataforma
4. WHEN playlist colaborativa é editada por qualquer membro THEN sistema SHALL exibir badge "Editada por [Nome]" com timestamp

---

### P2: Favoritos / Músicas Compartilhadas Comigo

**User Story**: Como músico, quero favoritar músicas e ver o que foi compartilhado comigo para organizar meu repertório.

**Why P2**: Complementa o fluxo de colaboração.

**Acceptance Criteria**:

1. WHEN usuário clica no ícone de coração em qualquer Music Card THEN sistema SHALL salvar como favorito e mudar ícone para preenchido (cor `#EC4899`)
2. WHEN usuário acessa `/shared` THEN sistema SHALL exibir músicas e playlists compartilhadas com ele, com nome do autor

---

### P3: Configurações de Usuário

**User Story**: Como músico, quero configurar preferências como velocidade padrão de rolagem, convenção de tom (# vs b) e tema visual.

**Why P3**: Nice-to-have; não bloqueia uso do app.

**Acceptance Criteria**:

1. WHEN usuário acessa `/settings` THEN sistema SHALL exibir opções: velocidade padrão de rolagem, convenção enarmônica (# ou b), fonte das cifras, tamanho da fonte
2. WHEN configuração é salva THEN sistema SHALL persistir no perfil do usuário via API e aplicar imediatamente

---

## Edge Cases

- WHEN conexão cai durante Modo Teatro THEN sistema SHALL continuar exibindo a música carregada (cache local) sem error screen
- WHEN cifra é muito longa (> 500 linhas) THEN sistema SHALL usar virtualização de lista para manter performance de scroll
- WHEN usuário gira o dispositivo no Modo Teatro THEN sistema SHALL reajustar layout sem interromper rolagem automática
- WHEN botão de transposição é clicado rapidamente (< 100ms entre cliques) THEN sistema SHALL debounce chamadas à API mas atualizar UI otimisticamente
- WHEN token expira durante o uso THEN sistema SHALL fazer silent refresh antes de redirecionar para login
- WHEN playlist não tem músicas THEN sistema SHALL exibir empty state ao invés de tela em branco no Modo Teatro

---

## Rotas da Aplicação

| Rota | Componente | Auth | Descrição |
|---|---|---|---|
| `/login` | `LoginPage` | Pública | Login |
| `/register` | `RegisterPage` | Pública | Registro |
| `/dashboard` | `DashboardPage` | JWT | Dashboard com músicas recentes |
| `/songs` | `SongsListPage` | JWT | Todas as músicas |
| `/songs/new` | `SongFormPage` | JWT | Criar música |
| `/songs/{id}` | `SongViewPage` | JWT | Visualizar música + transposição |
| `/songs/{id}/edit` | `SongFormPage` | JWT | Editar música |
| `/playlists` | `PlaylistsPage` | JWT | Listar playlists |
| `/playlists/{id}` | `PlaylistViewPage` | JWT | Visualizar playlist |
| `/theater/{playlistId}` | `TheaterModePage` | JWT | Modo Teatro (fullscreen) |
| `/groups` | `GroupsPage` | JWT | Grupos |
| `/search` | `SearchPage` | JWT | Resultados de busca |
| `/shared` | `SharedWithMePage` | JWT | Compartilhado comigo |
| `/settings` | `SettingsPage` | JWT | Configurações |

---

## Componentes Core

| Componente | Descrição | Design System Ref |
|---|---|---|
| `MusicCard` | Card de música no grid | DESING_SYSTEM §6.3 |
| `PlaylistCard` | Card de playlist | DESING_SYSTEM §6.3 |
| `GroupCard` | Card de grupo | DESING_SYSTEM §6.3 |
| `TransposePad` | Trio [-][Tom][+] | `button_states.png` |
| `ChordSheet` | Renderiza cifra com acordes alinhados | DESING_SYSTEM §5.2 |
| `TheaterControls` | Barra de controles do Modo Teatro | DESING_SYSTEM §7.2 |
| `AutoScrollEngine` | Hook de rolagem automática | — |
| `SearchBar` | Busca global com dropdown | DESING_SYSTEM §6.2 |
| `Sidebar` | Navegação desktop | DESING_SYSTEM §6.5 |
| `BottomNav` | Navegação mobile | DESING_SYSTEM §6.5 |
| `ConfirmModal` | Modal de confirmação de ações destrutivas | DESING_SYSTEM §6.4 |
| `SkeletonCard` | Loading state para cards | DESING_SYSTEM §12.3 |
| `ToastNotification` | Feedback de ações (salvar, erro) | DESING_SYSTEM §12.1 |

---

## Requirement Traceability

| Requirement ID | Story | PRD Ref | DS Ref | Status |
|---|---|---|---|---|
| FE-AUTH-01 | P1: Login | RF019 | — | Pending |
| FE-AUTH-02 | P1: Registro | RF019 | — | Pending |
| FE-AUTH-03 | P1: Proteção de rotas / JWT | RNF003 | — | Pending |
| FE-SONG-01 | P1: Dashboard / lista de músicas | RF003 | §7.1 | Pending |
| FE-SONG-02 | P1: Visualização de música + cifra | RF003, RF004 | §7.3 | Pending |
| FE-SONG-03 | P1: Criar música (formulário) | RF001 | — | Pending |
| FE-SONG-04 | P1: Editar música | RF002 | — | Pending |
| FE-TRANSP-01 | P1: Botões de transposição | RF006 | §6.1 | Pending |
| FE-TRANSP-02 | P1: Atualização em tempo real | RF006 | — | Pending |
| FE-PLAYLIST-01 | P1: Lista de playlists | RF008, RF011 | §7.1 | Pending |
| FE-PLAYLIST-02 | P1: Criar playlist (modal) | RF008 | §6.4 | Pending |
| FE-PLAYLIST-03 | P1: Reordenar músicas (DnD/botões) | RF010 | — | Pending |
| FE-THEATER-01 | P1: Tela cheia Modo Teatro | RF015 | §7.2 | Pending |
| FE-THEATER-02 | P1: Rolagem automática | RF018 | §11.3 | Pending |
| FE-THEATER-03 | P1: Transposição no Modo Teatro | RF016 | §7.2 | Pending |
| FE-THEATER-04 | P1: Navegação prev/next | RF017 | §7.2 | Pending |
| FE-SEARCH-01 | P1: Busca global (header) | RF005 | §6.5 | Pending |
| FE-GROUP-01 | P2: Grupos + membros | RF013 | §6.3 | Pending |
| FE-COLLAB-01 | P2: Playlists colaborativas | RF012, RF014 | — | Pending |
| FE-FAV-01 | P2: Favoritos | — | §6.3 | Pending |
| FE-SETTINGS-01 | P3: Configurações de usuário | — | — | Pending |

**Coverage:** 21 total, 17 mapeados para Design (P1), 4 unmapped (P2/P3) ⚠️

---

## Success Criteria

- [ ] Todas as rotas P1 renderizam sem erros em Chrome, Firefox e Safari (últimas 2 versões)
- [ ] Modo Teatro funciona em modo fullscreen em Android Chrome e iOS Safari
- [ ] Transposição atualiza UI em < 200ms após clique (medido no devtools)
- [ ] Skeleton loaders aparecem em todos os estados de carregamento (sem tela em branco)
- [ ] Formulários exibem validação inline sem recarregar a página
- [ ] Contraste de todos os textos ≥ 4.5:1 verificado com ferramentas de acessibilidade
- [ ] LCP < 3s em conexão simulada 3G (Lighthouse)
- [ ] Nenhuma rota protegida acessível sem JWT válido
