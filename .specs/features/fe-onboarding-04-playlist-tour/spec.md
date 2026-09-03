# FE-ONBOARDING-04: Onboarding Guiado de Playlists (Criação e Inclusão de Músicas)

## 1. Visão Geral (Specify)
- **Problema:** Usuários novos ou existentes muitas vezes não exploram o potencial de organização de repertório por não conhecerem o fluxo de criação de Playlists e de inclusão de músicas para seus ensaios e apresentações.
- **Objetivo:** Fornecer uma experiência de onboarding guiada através do sistema de **Coach Marks** e **Tour Context**, instruindo o usuário passo a passo sobre:
  1. Como criar sua primeira Playlist na tela de Playlists (`/playlists`).
  2. Como buscar e adicionar músicas a uma Playlist criada (`/playlists/:id`).
  3. Apresentar um Empty State Educativo na listagem de playlists vazia.

---

## 2. Jornadas do Usuário e Requisitos

### 2.1 Jornada 1: Descoberta e Criação de Playlist (`/playlists`)
1. Ao acessar `/playlists` pela primeira vez (sem `tour_seen_playlist-create` no `localStorage`):
   - O `CoachMark` com `tourId="playlist-create"` é ativado com delay suave (ex: 600ms a 800ms) destacando o botão "+ Nova Playlist" (`data-testid="create-playlist-btn"`).
   - O balão exibe título e descrição explicativa sobre como organizar o repertório.
2. Se a lista de playlists estiver vazia (`playlists.length === 0`):
   - É exibido o componente `EducationalEmptyState` com 3 passos simples (1. Crie sua playlist, 2. Adicione músicas, 3. Toque no Modo Teatro) e botão de ação ("Criar Playlist") que abre o modal de criação.

### 2.2 Jornada 2: Adição de Músicas à Playlist (`/playlists/:id`)
1. Ao entrar na página de uma playlist (`PlaylistViewPage`), caso o usuário seja o proprietário e ainda não tenha visto o tour (`tour_seen_playlist-add-song`):
   - O `CoachMark` com `tourId="playlist-add-song"` é ativado sobre o botão "+ Adicionar Música" no cabeçalho.
   - O balão explica como buscar cifras e incluí-las na playlist.
2. Quando a playlist não contiver músicas (`songs.length === 0`):
   - O estado vazio da playlist apresenta um botão de ação direto ("Adicionar Músicas") que abre o modal de seleção/busca de músicas.

### 2.3 Jornada 3: Fechamento e Persistência
1. Clicar no botão de confirmação ("Entendi") ou no 'X' encerra o tour ativo e persiste `tour_seen_<tourId> = 'true'` no `localStorage`.
2. O tour não volta a incomodar o usuário nos acessos subsequentes.

---

## 3. Critérios de Aceite Binários (ACs)

- **AC-01**: Na página `/playlists`, quando o usuário não tiver visto o tour `playlist-create`, o `CoachMark` correspondente é disparado destacando o botão de criação de playlist.
- **AC-02**: Na página `/playlists`, quando a lista de playlists estiver vazia, deve ser renderizado o `EducationalEmptyState` contendo os 3 passos educativos e ação que abre o modal de criação.
- **AC-03**: Na página `/playlists/:id`, quando o usuário proprietário não tiver visto o tour `playlist-add-song`, o `CoachMark` correspondente é disparado destacando o botão de adicionar músicas.
- **AC-04**: Na página `/playlists/:id`, quando a playlist estiver vazia, deve haver um botão de ação no empty state permitindo abrir a busca/adição de músicas diretamente.
- **AC-05**: Todas as mensagens, títulos, passos e botões adicionados/alterados utilizam chaves i18n (`react-i18next`) em Português (`pt-BR.json`), Inglês (`en.json`) e Espanhol (`es.json`).
- **AC-06**: O componente `CoachMark` não possui strings hardcoded e traduz seu botão de ação ("Entendi") via `t('common.gotIt', 'Entendi')` ou prop customizável.
- **AC-07**: Os testes unitários e de integração frontend cobrem os novos fluxos com cobertura ≥ 90% no diff.

---

## 4. Classificação de Impacto e Contorno

- **Classificação de Impacto de Produto (CPO):** **I1 — Padrão** (Fluxo delimitado de interface do usuário, sem alteração de contratos públicos de API, regras financeiras, segurança ou persistência destrutiva).
- **Classificação de Impacto Técnico (CTO):** **I1 — Padrão** (Client-side React/TypeScript, novos Coach Marks, i18n, estados locais e TourContext).
- **Nível Consolidado:** **I1**
- **Gatilhos de Reclassificação:** Qualquer necessidade de alterar schemas do Supabase ou contratos REST do backend eleva para I2.
