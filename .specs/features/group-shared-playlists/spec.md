# Group Shared Playlists Specification

## Problem Statement

Músicos que tocam em bandas ou grupos de louvor precisam de um repertório unificado (playlist) para ensaios e apresentações. Atualmente, cada membro precisa buscar e gerenciar as músicas por conta própria. Precisamos permitir que líderes (admins) compartilhem suas playlists com o grupo, garantindo que todos tenham acesso ao mesmo setlist atualizado e possam utilizar o Modo Teatro individualmente.

## Goals

- [ ] Administradores de grupo podem vincular e desvincular suas playlists pessoais a um grupo.
- [ ] Membros do grupo podem visualizar e acessar playlists compartilhadas (somente leitura).
- [ ] Qualquer membro pode abrir as músicas da playlist compartilhada em seu próprio Modo Teatro.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Sincronização de Modo Teatro | O controle remoto de rolagem ou troca de música para outros membros exige WebSockets/estado em tempo real, sendo muito complexo para essa etapa. Cada usuário fará a rolagem no seu próprio ritmo. |
| Playlists nativas de Grupo | Para simplificar o modelo de dados e permitir que líderes preparem o repertório em privado antes de publicar, utilizaremos o vínculo de playlists pessoais do admin com o grupo. |
| Edição colaborativa | Apenas o dono da playlist (admin) pode adicionar ou remover músicas. Demais membros têm acesso apenas de leitura. |

---

## User Stories

### P1: Vincular Playlist ao Grupo ⭐ MVP

**User Story**: Como um Administrador de Grupo, eu quero vincular uma das minhas playlists pessoais ao grupo, para que todos os membros tenham acesso ao repertório.

**Why P1**: É a base do compartilhamento do repertório.

**Acceptance Criteria**:

1. WHEN o admin acessa a página do grupo THEN o sistema SHALL exibir uma opção para "Compartilhar Playlist".
2. WHEN o admin clica na opção THEN o sistema SHALL listar suas playlists pessoais disponíveis.
3. WHEN o admin seleciona uma playlist THEN o sistema SHALL vincular a playlist ao grupo e ela passará a ser exibida para todos os membros.

**Independent Test**: Admin vai no grupo, vincula a playlist e verifica se a requisição é bem sucedida e atualiza a UI.

---

### P1: Visualizar Playlists do Grupo ⭐ MVP

**User Story**: Como um Membro do Grupo, eu quero ver as playlists associadas ao meu grupo e suas músicas, para que eu saiba o que vamos tocar.

**Why P1**: Os membros precisam acessar a playlist que o admin compartilhou.

**Acceptance Criteria**:

1. WHEN um membro acessa a página do grupo THEN o sistema SHALL exibir a lista de playlists compartilhadas.
2. WHEN um membro acessa a playlist compartilhada THEN o sistema SHALL exibir a lista de músicas, mas não exibir opções de edição (adicionar/remover/reordenar) a menos que ele seja o dono.

**Independent Test**: Logar como membro normal, entrar no grupo e verificar se as playlists aparecem e se a visualização é restrita (read-only).

---

### P1: Modo Teatro no Grupo ⭐ MVP

**User Story**: Como um Membro do Grupo, eu quero abrir a playlist compartilhada no Modo Teatro, para poder tocar junto com o grupo no meu próprio ritmo.

**Why P1**: O Modo Teatro é o objetivo final do músico na hora de tocar.

**Acceptance Criteria**:

1. WHEN visualizando uma playlist do grupo THEN o sistema SHALL disponibilizar o botão de "Performar" (Modo Teatro).
2. WHEN clicado THEN o sistema SHALL abrir o Modo Teatro padrão contendo as músicas daquela playlist.

**Independent Test**: Membro abre a playlist do grupo, clica em performar e o visualizador inicia normalmente com as músicas corretas.

---

### P2: Desvincular Playlist do Grupo

**User Story**: Como um Administrador de Grupo, eu quero remover uma playlist do grupo, para limpar repertórios antigos que já não estamos usando.

**Why P2**: Necessário para manter a organização do grupo ao longo do tempo.

**Acceptance Criteria**:

1. WHEN o admin visualiza as playlists do grupo THEN o sistema SHALL exibir uma opção de "Desvincular do grupo" na playlist.
2. WHEN clicado THEN o sistema SHALL remover o vínculo com o grupo, mas manter a playlist original intacta na conta do usuário.

**Independent Test**: Admin remove a playlist do grupo, e ela deixa de aparecer para os membros, mas ainda existe nas playlists pessoais do admin.

---

## Edge Cases

- WHEN um admin deleta sua playlist pessoal (que estava vinculada) THEN o sistema SHALL apagar automaticamente o vínculo com o grupo.
- WHEN um não-admin tenta acessar o endpoint de vincular playlist THEN o backend SHALL retornar 403 Forbidden.
- WHEN um membro do grupo que não é admin/dono da playlist tenta modificar as músicas dela (via API) THEN o backend SHALL retornar 403 Forbidden.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| `GRP-PLAY-01` | P1: Vincular Playlist | - | Pending |
| `GRP-PLAY-02` | P1: Visualizar Playlists | - | Pending |
| `GRP-PLAY-03` | P1: Modo Teatro no Grupo | - | Pending |
| `GRP-PLAY-04` | P2: Desvincular Playlist | - | Pending |
| `GRP-PLAY-05` | Edge: Proteção de Edição (Read-only) | - | Pending |

---

## Success Criteria

- [ ] Admins conseguem compartilhar pelo menos uma playlist em um grupo com sucesso.
- [ ] Membros comuns conseguem ver as músicas da playlist e iniciar o Modo Teatro.
- [ ] Apenas o dono (admin) consegue alterar o conteúdo da playlist.
