# FE-ONBOARDING-06: Onboarding Guiado de Grupos, Membros e Playlists Compartilhadas

## 1. Visão Geral (Specify)
- **Contexto:** Músicos, líderes de ministério de louvor e bandas frequentemente utilizam o CifrAS para ensaios e apresentações em conjunto. No entanto, novos usuários muitas vezes não descobrem o fluxo colaborativo de Grupos, convites de integrantes e compartilhamento de repertório/playlists.
- **Objetivo:** Fornecer uma experiência de onboarding guiada e contextual utilizando o ecossistema de **Coach Marks**, **TourContext** e **EducationalEmptyState**, conduzindo o usuário passo a passo através de:
  1. Criação do primeiro Grupo na tela de Grupos (`/groups`).
  2. Geração e envio de convites para novos membros (`group-invite-members`).
  3. Vinculação e compartilhamento de Playlists com o grupo (`group-share-playlist`).
  4. Apresentação de Empty States Educativos interativos na ausência de grupos ou playlists compartilhadas.

---

## 2. Jornadas do Usuário e Requisitos

### 2.1 Jornada 1: Descoberta e Criação de Grupo (`/groups`)
1. Ao acessar `/groups` pela primeira vez (sem `tour_seen_group-create` no `localStorage`):
   - O `CoachMark` com `tourId="group-create"` é ativado com delay suave (~800ms) destacando o botão "+ Novo Grupo" (`data-testid="create-group-btn"`).
   - O balão exibe título e descrição explicativa sobre reunir a banda/ministério para compartilhar cifras e repertório em equipe.
2. Quando a lista de grupos estiver vazia (`groups.length === 0` e `!loading`):
   - É exibido o componente `EducationalEmptyState` com 3 passos simples (1. Crie seu grupo musical ou ministério; 2. Convide integrantes com um link rápido; 3. Compartilhe playlists e cifras com a equipe) e botão de ação ("Novo Grupo") que abre o modal de criação de grupo.

### 2.2 Jornada 2: Convidar Membros para o Grupo (`/groups/:id`)
1. Ao entrar na página de detalhes de um grupo (`GroupDetailsPage`), caso o usuário seja Admin/Owner e ainda não tenha visto o tour (`tour_seen_group-invite-members`):
   - O `CoachMark` com `tourId="group-invite-members"` é disparado destacando o botão de convite (`data-testid="header-invite-btn"`).
   - O balão explica como gerar um link de convite instantâneo para vocalistas e instrumentistas.
   - Possui encadeamento `nextTourId="group-share-playlist"`, exibindo o botão "Próximo".

### 2.3 Jornada 3: Compartilhar Playlists com o Grupo (`/groups/:id`)
1. Na sequência do tour ou ao acessar a aba de Playlists do grupo, caso o tour `group-share-playlist` esteja ativo:
   - O `CoachMark` com `tourId="group-share-playlist"` é disparado destacando o botão "+ Compartilhar Playlist" (`data-testid="share-playlist-btn"`).
   - O balão explica como vincular playlists existentes para que todos os membros tenham acesso sincronizado ao repertório.
   - Botão final de confirmação ("Entendi").
2. Quando o grupo não possuir playlists compartilhadas (`playlists.length === 0` e `!loading`):
   - Para usuários com papel Admin, a seção exibe o `EducationalEmptyState` com 3 passos orientativos e ação direta para vincular/compartilhar uma playlist.

### 2.4 Jornada 4: Persistência e Acessibilidade
1. O fechamento de qualquer tour pelo botão de fechar (X) encerra a sequência sem travar a interface e persiste `tour_seen_<tourId> = 'true'`.
2. Todos os textos são internacionalizados em Português (`pt-BR`), Inglês (`en`) e Espanhol (`es`), sem strings fixas/hardcoded.

---

## 3. Critérios de Aceite Binários (ACs)

- [ ] **AC-01**: Na página `/groups`, quando o usuário não tiver visto o tour `group-create`, o `CoachMark` correspondente é disparado destacando o botão de criação de grupo (`data-testid="create-group-btn"`).
- [ ] **AC-02**: Na página `/groups`, quando a lista de grupos estiver vazia, deve ser renderizado o `EducationalEmptyState` contendo os 3 passos educativos e botão de ação para abrir o modal de criação.
- [ ] **AC-03**: Na página `/groups/:id`, quando o usuário for Admin e não tiver visto o tour `group-invite-members`, o `CoachMark` correspondente é disparado destacando o botão de convite (`data-testid="header-invite-btn"`), com transição `nextTourId="group-share-playlist"`.
- [ ] **AC-04**: Na página `/groups/:id` (ou seção de playlists do grupo), o `CoachMark` `group-share-playlist` destaca o botão de compartilhamento de playlist (`data-testid="share-playlist-btn"`).
- [ ] **AC-05**: Na seção de Playlists do Grupo (`GroupPlaylistsSection`), quando a lista estiver vazia e o usuário for Admin, exibe `EducationalEmptyState` com passos e botão de compartilhamento de playlist.
- [ ] **AC-06**: Todas as mensagens, títulos, passos e botões adicionados/alterados utilizam chaves i18n (`react-i18next`) em Português (`pt-BR.json`), Inglês (`en.json`) e Espanhol (`es.json`).
- [ ] **AC-07**: Os testes unitários e de integração cobrem os novos fluxos de tour de grupos, convites, empty states e compartilhamento de playlist com cobertura ≥ 90% no diff.

---

## 4. Classificação de Impacto e Contorno

- **Classificação de Impacto de Produto (CPO):** **I1 — Padrão** (Fluxo puramente de interface do usuário, novos Coach Marks, estados visuais e textos educativos, sem impacto em contratos de API ou autenticação).
- **Classificação de Impacto Técnico (CTO):** **I1 — Padrão** (Client-side React/TypeScript, integração com `TourContext`, `CoachMark`, `EducationalEmptyState` e arquivos de tradução i18n).
- **Nível Consolidado:** **I1**
- **Gatilhos de Reclassificação:** Qualquer necessidade de alterar schemas do PostgreSQL/Supabase ou contratos REST do backend eleva para I2.
