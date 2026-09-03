# Design Arquitetural: Onboarding Guiado de Grupos, Membros e Playlists

## 1. Arquitetura de Estado e Componentes

### 1.1 Sequenciamento de Tours e Identificadores

1. **Tour 1: Criação de Grupo (`group-create`)**
   - **Local:** `GroupsPage.tsx` (`/groups`).
   - **Gatilho:** `useEffect` com timeout de 800ms disparando `startTour('group-create')`.
   - **Elemento Destacado:** Botão "+ Novo Grupo" (`data-testid="create-group-btn"`).
   - **Comportamento:** Balão de dica contextual explicando o benefício da colaboração em grupo para bandas e ministérios.
   - **Empty State:** Substitui a mensagem de texto simples por `<EducationalEmptyState>` com 3 passos e botão para abrir o modal de criação.

2. **Tour 2: Convite de Integrantes (`group-invite-members`)**
   - **Local:** `GroupDetailsPage.tsx` (`/groups/:id`).
   - **Gatilho:** `useEffect` disparando `startTour('group-invite-members')` se o usuário for Admin (`group.role === 'Admin'`).
   - **Elemento Destacado:** Botão de convite no cabeçalho (`data-testid="header-invite-btn"`).
   - **Sequenciamento:** `nextTourId="group-share-playlist"`, permitindo avançar para o próximo passo através do botão "Próximo" (`common.next`).

3. **Tour 3: Compartilhamento de Playlist (`group-share-playlist`)**
   - **Local:** `GroupPlaylistsSection.tsx` dentro de `GroupDetailsPage.tsx`.
   - **Elemento Destacado:** Botão "+ Compartilhar Playlist" (`data-testid="share-playlist-btn"`).
   - **Comportamento:** Explica a sincronização de repertório com os integrantes. Botão de conclusão "Entendi" (`common.gotIt`).
   - **Empty State:** Quando `playlists.length === 0` e `role === 'Admin'`, renderiza `<EducationalEmptyState>` orientando os 3 passos de colaboração de repertório e botão de ação direto `onLinkNew`.

---

## 2. Dicionário de Chaves de Internacionalização (i18n)

### `pt-BR` (`locales/pt-BR.json`)
```json
"groups": {
  "tourCreateTitle": "Crie seu Grupo Musical",
  "tourCreateDesc": "Reúna sua banda, ministério de louvor ou amigos para compartilhar cifras e playlists colaborativas em tempo real.",
  "educationalEmptyTitle": "Organize e compartilhe seu repertório em equipe",
  "educationalEmptyStep1": "1. Crie seu grupo musical ou ministério",
  "educationalEmptyStep2": "2. Convide os integrantes com um link rápido",
  "educationalEmptyStep3": "3. Compartilhe playlists e cifras com a equipe"
},
"group": {
  "tourInviteTitle": "Convide integrantes para o Grupo",
  "tourInviteDesc": "Gere um link de convite instantâneo para que músicos e vocalistas acessem as músicas do grupo.",
  "tourSharePlaylistTitle": "Compartilhe Playlists com o Grupo",
  "tourSharePlaylistDesc": "Vincule suas playlists existentes para que todos os membros do grupo tenham acesso sincronizado ao repertório.",
  "educationalEmptyPlaylistsTitle": "Nenhuma playlist compartilhada ainda",
  "educationalEmptyPlaylistsStep1": "1. Crie ou selecione suas playlists de repertório",
  "educationalEmptyPlaylistsStep2": "2. Compartilhe com os membros do grupo",
  "educationalEmptyPlaylistsStep3": "3. Toquem juntos no Modo Teatro sincronizado"
}
```

### `en` (`locales/en.json`)
```json
"groups": {
  "tourCreateTitle": "Create your Music Group",
  "tourCreateDesc": "Gather your band, worship team, or friends to share chords and collaborative playlists in real time.",
  "educationalEmptyTitle": "Organize and share your repertoire as a team",
  "educationalEmptyStep1": "1. Create your music group or ministry",
  "educationalEmptyStep2": "2. Invite members with a quick link",
  "educationalEmptyStep3": "3. Share playlists and chord charts with the team"
},
"group": {
  "tourInviteTitle": "Invite members to the Group",
  "tourInviteDesc": "Generate an instant invite link so musicians and singers can access group songs.",
  "tourSharePlaylistTitle": "Share Playlists with the Group",
  "tourSharePlaylistDesc": "Link your existing playlists so all group members have synchronized access to the repertoire.",
  "educationalEmptyPlaylistsTitle": "No shared playlists yet",
  "educationalEmptyPlaylistsStep1": "1. Create or select your repertoire playlists",
  "educationalEmptyPlaylistsStep2": "2. Share them with group members",
  "educationalEmptyPlaylistsStep3": "3. Play together with synchronized Theater Mode"
}
```

### `es` (`locales/es.json`)
```json
"groups": {
  "tourCreateTitle": "Crea tu Grupo Musical",
  "tourCreateDesc": "Reúne a tu banda, ministerio de alabanza o amigos para compartir acordes y playlists colaborativas en tiempo real.",
  "educationalEmptyTitle": "Organiza y comparte tu repertorio en equipo",
  "educationalEmptyStep1": "1. Crea tu grupo musical o ministerio",
  "educationalEmptyStep2": "2. Invita a los integrantes con un enlace rápido",
  "educationalEmptyStep3": "3. Comparte playlists y acordes con el equipo"
},
"group": {
  "tourInviteTitle": "Invita a integrantes al Grupo",
  "tourInviteDesc": "Genera un enlace de invitación instantáneo para que músicos y cantantes accedan a las canciones del grupo.",
  "tourSharePlaylistTitle": "Comparte Playlists con el Grupo",
  "tourSharePlaylistDesc": "Vincula tus playlists existentes para que todos los miembros del grupo tengan acceso sincronizado al repertorio.",
  "educationalEmptyPlaylistsTitle": "Ninguna playlist compartida aún",
  "educationalEmptyPlaylistsStep1": "1. Crea o selecciona tus playlists de repertorio",
  "educationalEmptyPlaylistsStep2": "2. Compártelas con los miembros del grupo",
  "educationalEmptyPlaylistsStep3": "3. Toquen juntos con el Modo Teatro sincronizado"
}
```

---

## 3. Estratégia de Testes

- **Testes Unitários e de Integração Frontend (`src/tests/`):**
  1. `GroupsPage.test.tsx`:
     - Testar disparo do `CoachMark` (`group-create`) ao montar.
     - Testar renderização de `EducationalEmptyState` quando lista vazia de grupos.
     - Testar acionamento do modal ao clicar na ação do empty state.
  2. `GroupDetailsPage.test.tsx`:
     - Testar renderização do `CoachMark` no botão de convite (`header-invite-btn`) para Admin.
     - Testar transição de tour via `nextTourId`.
  3. `GroupPlaylistsSection.test.tsx`:
     - Testar renderização do `CoachMark` no botão de compartilhar playlist (`share-playlist-btn`).
     - Testar renderização do `EducationalEmptyState` quando não há playlists e o usuário é Admin.
- **Cobertura de Código:** Garantir ≥ 90% de cobertura sobre as linhas alteradas/adicionadas.

---

## 4. Estratégia de Rollback
Reversão pura dos arquivos frontend modificados em `src/pages/` e `src/components/`, sem qualquer impacto em banco ou backend.
