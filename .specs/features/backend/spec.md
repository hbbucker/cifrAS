# CifrAS — Backend Specification (Java Quarkus)

## Problem Statement

Músicos precisam de uma API confiável e segura para armazenar, recuperar e manipular cifras de violão. A lógica de transposição de acordes, gerenciamento de grupos colaborativos e controle de acesso por JWT são as partes mais críticas — e onde erros causam maior impacto no produto.

## Goals

- [ ] API RESTful 100% funcional cobrindo todos os RFs do PRD
- [ ] Transposição de acordes correta para todos os 12 tons (incluindo sustenidos e bemóis)
- [ ] Autenticação via JWT Supabase validado em todas as rotas protegidas
- [ ] Cobertura de testes unitários ≥ 80% na lógica de transposição e domínio de acordes
- [ ] Tempo de resposta p95 < 300ms para leitura de músicas e playlists

## Out of Scope

| Feature | Reason |
|---|---|
| Geração de diagrama visual de acordes | Frontend responsibility |
| Upload de arquivos (PDFs, áudio) | Supabase Storage — fase v2 |
| Notificações push (convites a grupos) | Complexidade de infra — v2 |
| Busca semântica / IA | Fora do MVP |
| Rate limiting granular por endpoint | DevOps concern — v2 |

---

## User Stories

### P1: Autenticação de Usuário ⭐ MVP

**User Story**: Como músico, quero me registrar e fazer login para que meus dados sejam privados e acessíveis de qualquer dispositivo.

**Why P1**: Sem autenticação não existe nenhuma funcionalidade de usuário; é o alicerce de tudo.

**Acceptance Criteria**:

1. WHEN `POST /auth/register` recebe `{ email, password, name }` válidos THEN sistema SHALL criar usuário no Supabase Auth e retornar `201` com `{ user_id, email }`
2. WHEN `POST /auth/login` recebe credenciais válidas THEN sistema SHALL retornar `200` com JWT de acesso e refresh token do Supabase
3. WHEN qualquer rota protegida recebe request sem header `Authorization: Bearer <token>` THEN sistema SHALL retornar `401 Unauthorized`
4. WHEN JWT expirado ou inválido é enviado THEN sistema SHALL retornar `401` com mensagem `"Token inválido ou expirado"`
5. WHEN `POST /auth/register` recebe email já cadastrado THEN sistema SHALL retornar `409 Conflict`

**Independent Test**: Registrar novo usuário → fazer login → acessar `GET /songs` sem token (espera 401) → acessar com token (espera 200).

---

### P1: CRUD de Músicas e Cifras ⭐ MVP

**User Story**: Como músico, quero criar, editar, visualizar e deletar músicas com suas cifras para organizar meu repertório.

**Why P1**: Core do produto; sem músicas o app não tem valor.

**Acceptance Criteria**:

1. WHEN `POST /songs` recebe payload `{ title, artist, originalKey, lyrics }` com JWT válido THEN sistema SHALL persistir e retornar `201` com `{ id, title, artist, originalKey, createdAt }`
2. WHEN `GET /songs` é chamado com JWT válido THEN sistema SHALL retornar lista paginada `{ data: [], total, page, pageSize }` filtrando apenas músicas do usuário autenticado
3. WHEN `GET /songs/{id}` é chamado para música de outro usuário THEN sistema SHALL retornar `403 Forbidden`
4. WHEN `PUT /songs/{id}` recebe campos atualizados THEN sistema SHALL persistir alterações e retornar `200` com entidade atualizada
5. WHEN `DELETE /songs/{id}` é chamado THEN sistema SHALL soft-delete a música e retornar `204 No Content`
6. WHEN `POST /songs` recebe `title` vazio ou nulo THEN sistema SHALL retornar `400 Bad Request` com mensagem de validação

**Payload de Cifra (lyrics):**

Estrutura JSON esperada para o campo `lyrics`:
- `sections[]` → label + lines[]
- `lines[]` → chords[] (array de acordes por posição) + text (letra da linha)

**Independent Test**: Criar música → listar músicas (aparece) → editar título → listar (título novo) → deletar → listar (não aparece).

---

### P1: Transposição de Tom ⭐ MVP

**User Story**: Como músico, quero transpor o tom de uma música via API para que o frontend possa exibir acordes no tom correto.

**Why P1**: É o diferencial core do produto; músicos precisam transpor frequentemente.

**Acceptance Criteria**:

1. WHEN `POST /songs/{id}/transpose` recebe `{ semitones: 1 }` THEN sistema SHALL retornar a mesma estrutura de lyrics com todos os acordes transpostos 1 semitom acima
2. WHEN `semitones: -1` THEN sistema SHALL retornar acordes 1 semitom abaixo
3. WHEN transposição resulta em enarmônica (Bb vs A#) THEN sistema SHALL respeitar convenção definida (default: sustenidos `#`)
4. WHEN acorde desconhecido/inválido existe na cifra THEN sistema SHALL retorná-lo inalterado sem falhar o request
5. WHEN `semitones` fora do range `[-11, 11]` THEN sistema SHALL retornar `400 Bad Request`
6. WHEN `GET /songs/{id}?transpose=3` THEN sistema SHALL retornar a música com acordes transpostos 3 semitons (stateless/on-the-fly)

**Ciclo cromático:** `C → C# → D → D# → E → F → F# → G → G# → A → A# → B → C`

**Variações suportadas:** sufixos como `m`, `7`, `m7`, `add9`, `sus2`, `dim`, `aug`, `/baixo` — apenas a nota raiz é transposta.

**Independent Test**: Criar música com acorde `Am` → `POST /transpose { semitones: 1 }` → resposta deve conter `A#m` ou `Bbm`.

---

### P1: Playlists Pessoais ⭐ MVP

**User Story**: Como músico, quero criar playlists e organizar minhas músicas em sequência para usar em ensaios ou apresentações.

**Why P1**: Playlists são o fluxo de trabalho central para performances.

**Acceptance Criteria**:

1. WHEN `POST /playlists` recebe `{ name, isCollaborative: false }` THEN sistema SHALL criar e retornar `201` com `{ id, name, songCount: 0 }`
2. WHEN `POST /playlists/{id}/songs` recebe `{ songId, position }` THEN sistema SHALL adicionar música na posição indicada, reordenando as demais
3. WHEN `PATCH /playlists/{id}/songs/reorder` recebe `{ orderedSongIds: [] }` THEN sistema SHALL persistir nova ordem
4. WHEN `GET /playlists/{id}` THEN sistema SHALL retornar playlist com músicas em ordem, cada uma com `{ id, title, artist, currentKey }`
5. WHEN `DELETE /playlists/{id}/songs/{songId}` THEN sistema SHALL remover música da playlist sem deletar a música em si

**Independent Test**: Criar playlist → adicionar 3 músicas → reordenar → GET (verificar nova ordem).

---

### P1: Grupos e Playlists Colaborativas ⭐ MVP

**User Story**: Como músico, quero criar grupos e compartilhar playlists colaborativas para que minha banda possa contribuir com o repertório.

**Why P1**: Feature diferenciadora; grupos religiosos e bandas são o público principal.

**Acceptance Criteria**:

1. WHEN `POST /groups` recebe `{ name }` THEN sistema SHALL criar grupo com o criador como `OWNER` e retornar `201`
2. WHEN `POST /groups/{id}/members` recebe `{ email }` THEN sistema SHALL adicionar usuário como `MEMBER`; se email não existe, retornar `404`
3. WHEN `POST /playlists` recebe `{ isCollaborative: true, groupId }` THEN sistema SHALL associar playlist ao grupo
4. WHEN membro do grupo tenta editar playlist colaborativa THEN sistema SHALL permitir (`200`)
5. WHEN usuário fora do grupo tenta editar playlist colaborativa THEN sistema SHALL retornar `403 Forbidden`
6. WHEN OWNER remove membro do grupo THEN sistema SHALL revogar acesso às playlists colaborativas

**Independent Test**: Criar grupo → convidar usuário B → B adiciona música à playlist colaborativa → usuário C (fora do grupo) tenta editar (espera 403).

---

### P2: Busca Full-text de Músicas

**User Story**: Como músico, quero buscar músicas por título, artista ou trecho da letra para encontrar rapidamente o que preciso.

**Why P2**: Importante mas implementável após CRUD básico funcionar.

**Acceptance Criteria**:

1. WHEN `GET /songs?q=Hallelujah` THEN sistema SHALL retornar músicas cujo título, artista ou letra contenha o termo (case-insensitive)
2. WHEN `GET /songs?q=Am+G` THEN sistema SHALL retornar músicas que contenham esses acordes na cifra
3. WHEN busca retorna 0 resultados THEN sistema SHALL retornar `200` com `{ data: [], total: 0 }`

**Independent Test**: Criar 5 músicas com títulos distintos → buscar por substring de um título → confirmar apenas o match retorna.

---

### P2: Persistência de Tom Preferido

**User Story**: Como músico, quero que o tom transposto de uma música persista para não precisar retranspor toda vez.

**Why P2**: Melhora UX significativamente mas não bloqueia o MVP.

**Acceptance Criteria**:

1. WHEN `PATCH /songs/{id}/preferred-key` recebe `{ key: "G" }` THEN sistema SHALL salvar o tom preferido para esse usuário nessa música
2. WHEN `GET /songs/{id}` THEN sistema SHALL incluir `userPreferredKey` no response se existir
3. WHEN usuário não tem tom preferido salvo THEN `userPreferredKey` SHALL ser `null`

---

### P3: Estado de Sessão do Modo Teatro

**User Story**: Como músico, quero que o Modo Teatro salve minha posição na playlist para poder retomar de onde parei.

**Why P3**: Nice-to-have; o MVP pode controlar posição no frontend statefully.

**Acceptance Criteria**:

1. WHEN `POST /playlists/{id}/session` THEN sistema SHALL criar/atualizar sessão com `{ currentSongIndex, currentKey }`
2. WHEN `GET /playlists/{id}/session` THEN sistema SHALL retornar estado atual da sessão

---

## Edge Cases

- WHEN banco de dados retorna erro THEN sistema SHALL retornar `500` com `{ error: "Internal error", traceId }` e logar o stack trace
- WHEN `GET /songs` sem paginação explícita THEN sistema SHALL aplicar default `page=1, pageSize=20`
- WHEN cifra contém variações complexas (Am7, G/B, Cadd9) THEN transposição SHALL preservar o sufixo e transpor apenas a nota raiz
- WHEN usuário deleta conta THEN sistema SHALL soft-delete todos os recursos associados
- WHEN dois requests simultâneos reordenam a mesma playlist THEN sistema SHALL usar optimistic locking para evitar conflito

---

## API Contract Summary

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | Público | Registro |
| POST | `/auth/login` | Público | Login |
| GET | `/songs` | JWT | Listar músicas (paginado, filtros) |
| POST | `/songs` | JWT | Criar música |
| GET | `/songs/{id}` | JWT | Ver música (suporta ?transpose=N) |
| PUT | `/songs/{id}` | JWT | Editar música |
| DELETE | `/songs/{id}` | JWT | Deletar música (soft delete) |
| POST | `/songs/{id}/transpose` | JWT | Transpor acordes |
| PATCH | `/songs/{id}/preferred-key` | JWT | Salvar tom preferido |
| GET | `/playlists` | JWT | Listar playlists |
| POST | `/playlists` | JWT | Criar playlist |
| GET | `/playlists/{id}` | JWT | Ver playlist com músicas ordenadas |
| PUT | `/playlists/{id}` | JWT | Editar playlist |
| DELETE | `/playlists/{id}` | JWT | Deletar playlist |
| POST | `/playlists/{id}/songs` | JWT | Adicionar música à playlist |
| DELETE | `/playlists/{id}/songs/{songId}` | JWT | Remover música da playlist |
| PATCH | `/playlists/{id}/songs/reorder` | JWT | Reordenar músicas |
| POST | `/groups` | JWT | Criar grupo |
| GET | `/groups` | JWT | Listar grupos do usuário |
| POST | `/groups/{id}/members` | JWT | Convidar membro por email |
| DELETE | `/groups/{id}/members/{userId}` | JWT | Remover membro |

---

## Requirement Traceability

| Requirement ID | Story | PRD Ref | Phase | Status |
|---|---|---|---|---|
| AUTH-01 | P1: Autenticação / Registro | RF019 | Design | Pending |
| AUTH-02 | P1: JWT Validation | RNF003 | Design | Pending |
| SONG-01 | P1: Criar Música | RF001 | Design | Pending |
| SONG-02 | P1: Editar Música | RF002 | Design | Pending |
| SONG-03 | P1: Visualizar Música | RF003 | Design | Pending |
| SONG-04 | P1: Estrutura de Cifras | RF004 | Design | Pending |
| SONG-05 | P1: Deletar Música | RF002 | Design | Pending |
| TRANSP-01 | P1: Transposição core | RF006 | Design | Pending |
| TRANSP-02 | P1: On-the-fly transpose (query param) | RF006 | Design | Pending |
| TRANSP-03 | P2: Persistência de tom | RF007 | - | Pending |
| PLAYLIST-01 | P1: CRUD Playlist | RF008, RF009 | Design | Pending |
| PLAYLIST-02 | P1: Reordenar músicas | RF010 | Design | Pending |
| PLAYLIST-03 | P1: Visualizar sequência | RF011 | Design | Pending |
| GROUP-01 | P1: Criar Grupo | RF013 | Design | Pending |
| GROUP-02 | P1: Playlists Colaborativas | RF012, RF014 | Design | Pending |
| SEARCH-01 | P2: Busca full-text | RF005 | - | Pending |
| THEATER-01 | P3: Estado de sessão | RF015, RF018 | - | Pending |

**Coverage:** 17 total, 13 mapeados para Design, 4 unmapped (P2/P3) ⚠️

---

## Success Criteria

- [ ] Todos os endpoints P1 retornam status codes corretos em happy path e error path
- [ ] Transposição correta para todos os 12 acordes raiz com variações (m, 7, m7, add9, sus2, /baixo)
- [ ] JWT inválido rejeitado em 100% das rotas protegidas
- [ ] Isolamento de dados: usuário não acessa recursos de outro usuário (verificado por testes)
- [ ] Cobertura de testes unitários na lógica de transposição ≥ 80% de branches
- [ ] Performance: p95 < 300ms em `GET /songs` com 500 músicas (teste de carga)
