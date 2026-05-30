# Exclusão de Playlist (Delete Playlist)

## Problem Statement
Usuários precisam de uma forma de excluir playlists que não desejam mais manter na tela `/playlists`. A exclusão deve garantir a integridade das músicas (não devem ser deletadas) e remover o acesso de qualquer usuário de grupo com quem a playlist tenha sido compartilhada.

## Goals
- [ ] Adicionar botão/ação de excluir playlist na interface (tela `/playlists`).
- [ ] Ao excluir, remover apenas o vínculo da playlist com as músicas, mas preservar os registros das músicas no banco de dados.
- [ ] Remover os compartilhamentos/vínculos da playlist com grupos.
- [ ] Garantir que usuários dos grupos que antes tinham acesso não consigam mais ver ou acessar a playlist excluída.

## User Stories

### P1: Exclusão de Playlist e Preservação de Músicas
**User Story**: Como usuário, na tela `/playlists`, desejo poder excluir uma playlist, mas as músicas da playlist não devem ser excluídas, apenas os vínculos.
**Acceptance Criteria**:
1. O usuário deve ver uma opção de "Excluir" em cada playlist na tela `/playlists`.
2. Ao confirmar a exclusão, a playlist deve ser removida do banco de dados.
3. Os vínculos entre a playlist e as músicas (tabela de junção) devem ser removidos.
4. Os registros das músicas na tabela de músicas devem permanecer intactos.

### P1: Descompartilhamento com Grupos
**User Story**: Como dono da playlist, ao excluir uma playlist, ela deve ser descompartilhada com usuários de grupos, e estes usuários não poderão mais ver ou acessar a playlist excluída.
**Acceptance Criteria**:
1. Ao excluir a playlist, todos os vínculos de compartilhamento entre a playlist e quaisquer grupos devem ser removidos (cascata ou remoção explícita).
2. Usuários que pertencem aos grupos com os quais a playlist estava compartilhada não devem mais ver a playlist listada.
3. Se um usuário tentar acessar a URL direta da playlist excluída, deve receber um erro 404 (Not Found).

## Requirement Traceability
| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DEL-PL-01 | Exclusão e Preservação | Execute | Verified |
| DEL-PL-02 | Descompartilhamento | Execute | Verified |

## Success Criteria
- [x] A playlist é removida da interface do usuário logado.
- [x] As músicas contidas nela não são deletadas.
- [x] Usuários de grupos que tinham acesso perdem imediatamente a visualização e acesso à playlist.
