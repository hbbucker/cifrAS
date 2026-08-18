# Spec: Correção da Contagem de Músicas e i18n nas Playlists Compartilhadas de Grupo

**Feature ID:** `fix-group-shared-playlists-song-count`  
**Tipo:** Bugfix / Fast-Track  
**Nível de Impacto Consolidado:** **I1 (Padrão)**  

---

## 1. Resumo e Objetivo

Ao visualizar as playlists compartilhadas na tela de detalhes de um grupo (`GroupPlaylistsSection`), a quantidade de músicas exibida constava como "0 songs", e as strings estavam em inglês sem suporte adequado a i18n. O backend (`GroupPlaylistResource` / `PlaylistDTO`) retorna o campo numérico `songCount`, enquanto o componente frontend tentava acessar a propriedade inexistente `playlist.songs?.length` e concatenava a string hardcoded `" songs"`.

O objetivo desta entrega é corrigir a leitura do campo `songCount`, corrigir a exibição de músicas em `GroupPlaylistsSection` e `SharedWithMePage`, e eliminar todas as strings hardcoded adicionando as chaves de tradução necessárias nos três idiomas suportados (`pt-BR`, `en`, `es`).

---

## 2. Escopo

### No Escopo:
- `GroupPlaylistsSection.tsx`: Ler `songCount ?? songs?.length ?? 0` e usar `t('playlists.songsCount')`.
- `GroupPlaylistsSection.tsx`: Substituir strings hardcoded de erro/sucesso de toast, estado vazio e botões por chamadas `t(...)`.
- `SharedWithMePage.tsx`: Corrigir contagem de músicas para `songCount` e tradução de rótulos ("songs", "From:").
- `LinkPlaylistModal.tsx`: Substituir mensagens hardcoded por chaves de tradução i18n.
- `GroupMembersSection.tsx`: Garantir mensagens de erro e toasts internacionalizados.
- Arquivos de tradução (`pt-BR.json`, `en.json`, `es.json`): Adicionar chaves faltantes de `group`, `sharedWithMe` e `linkPlaylist`.
- Testes unitários no frontend (`GroupPlaylistsSection.test.tsx`, `GroupDetailsPage.test.tsx`, `SharedWithMePage.test.tsx`) cobrindo todos os cenários.

### Fora do Escopo:
- Alteração no esquema do banco de dados ou contratos de backend (o DTO `PlaylistDTO` já fornece `songCount`).
- Alteração nos fluxos de autenticação ou permissões de grupo.

---

## 3. Critérios de Aceite (AoC)

- [ ] **AC-1:** Ao renderizar uma playlist compartilhada no grupo com `songCount > 0`, a quantidade de músicas correta deve ser exibida (ex: "5 músicas" em pt-BR, "5 songs" em en, "5 canciones" em es).
- [ ] **AC-2:** Ao renderizar uma playlist sem músicas (`songCount === 0`), deve exibir "0 músicas" (pt-BR) de forma consistente.
- [ ] **AC-3:** O componente `GroupPlaylistsSection` não deve conter nenhuma string hardcoded voltada ao usuário (toasts, títulos, descrições, acessibilidade).
- [ ] **AC-4:** A página `SharedWithMePage` deve exibir a contagem de músicas correta via `songCount` e suporte a i18n nos rótulos de grupo e músicas.
- [ ] **AC-5:** Todos os testes unitários do frontend devem passar com cobertura de 100% sobre as linhas modificadas (threshold ≥ 90%).

---

## 4. Classificação de Impacto e Governança

- **Nível:** I1 (Padrão)
- **Sinais:** Correção pontual de UI e mapeamento de DTO, sem alteração de banco, sem alteração de contrato de backend, sem alteração de segurança.
- **Contornos Afetados:** Componentes `GroupPlaylistsSection`, `SharedWithMePage`, `LinkPlaylistModal`, arquivos de `locales/`.
- **Gates Exigidos:**
  - Checagens estáticas (Linter TypeScript sem warnings).
  - Testes unitários com Vitest cobrindo 100% do diff.
  - Validação independente pelo QA Lead (Read-only).
- **Gatilhos de Reclassificação:** Qualquer necessidade de alteração estrutural no banco ou API REST eleva para I2.

---

## 5. Consultas Obrigatórias de Governança

- **CPO / UX:** Aprovado. O texto deve respeitar a gramática dos três idiomas e as diretrizes do Design System sem quebrar layout em telas pequenas.
- **CTO:** Aprovado para Fast-Track I1. O backend já expõe `songCount` no `PlaylistDTO`, sendo uma correção puramente do consumo no cliente.
- **QA Lead:** Parecer preliminar recebido. Validação focada na exibição precisa do número de músicas, cobertura de testes do diff e inexistência de strings hardcoded.
