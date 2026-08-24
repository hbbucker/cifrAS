# Design Técnico & Arquitetura — Classificação de Músicas por Tags 🏛️⚙️

## 1. Visão Geral da Arquitetura
A funcionalidade de tags estende o modelo de dados de músicas sem degradar a performance de listagem, busca e filtragem. 

### Decisões Técnicas Principais:
1. **Modelagem de Dados:** Coluna `tags text[]` nativa do PostgreSQL na tabela `songs`, gerenciada pelo Hibernate/JPA com `@Column(name = "tags") public List<String> tags;` ou `String[]`.
2. **Indexação GIN:** Índice `CREATE INDEX idx_songs_tags_gin ON songs USING GIN (tags);` permitindo buscas de contenção (`tags @> :tags`) e sobreposição (`tags && :tags`) em tempo constante/sub-milissegundo.
3. **Contrato de API REST:**
   - `SongDTO` e `SongSummaryDTO` incluem o campo `List<String> tags`.
   - `CreateSongRequest` e `UpdateSongRequest` aceitam `List<String> tags`.
   - `GET /api/songs?tags=rock,pop&q=termo&page=1&size=20`: Listagem filtrada por tags.
   - `GET /api/songs/tags`: Retorna lista de `TagCountDTO(String tag, long count)` para alimentar a barra de chips e autocompletar.
4. **Componentização no Frontend:**
   - Componente `TagInput` reutilizável para inputs com autocomplete e chips.
   - Componente `TagFilterBar` para a barra horizontal de rolagem de chips.
   - Integração com `MusicCard` para exibição das tags.
   - Integração com o modal de adição de músicas a playlist em `PlaylistViewPage`.

---

## 2. Modelagem de Dados e Migração SQL

### Migração SQL (`src/main/resources/db/migration/V20260824_01__add_song_tags_and_gin_index.sql`):
```sql
-- Adiciona coluna tags na tabela songs se não existir
ALTER TABLE songs ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Cria índice GIN para buscas performáticas em tags
CREATE INDEX IF NOT EXISTS idx_songs_tags_gin ON songs USING GIN (tags);

-- Índice composto para consultas por usuário, soft-delete e tags
CREATE INDEX IF NOT EXISTS idx_songs_user_deleted_tags ON songs (userid, deletedat) WHERE deletedat IS NULL;
```

---

## 3. Contratos de API (DTOs)

### 3.1 TagCountDTO
```java
public record TagCountDTO(String name, long count) {}
```

### 3.2 Atualizações em DTOs existentes:
- `CreateSongRequest(String title, String artist, String originalKey, LyricsStructure lyrics, List<String> tags)`
- `UpdateSongRequest(String title, String artist, String originalKey, LyricsStructure lyrics, List<String> tags)`
- `SongDTO(UUID id, String title, String artist, String originalKey, LyricsStructure lyrics, String userPreferredKey, Boolean isFavorite, List<String> tags, ...)`
- `SongSummaryDTO(UUID id, String title, String artist, String originalKey, Boolean isFavorite, List<String> tags, Instant createdAt)`

---

## 4. Frontend: Design dos Componentes

1. **`TagInput.tsx`:**
   - Props: `value: string[]`, `onChange: (tags: string[]) => void`, `suggestions?: string[]`, `placeholder?: string`.
   - Gerencia adição por `Enter`, vírgula, clique em sugestão, e remoção por `×` ou `Backspace`.
2. **`TagFilterBar.tsx`:**
   - Props: `tags: { name: string; count: number }[]`, `selectedTag: string | null`, `onSelectTag: (tag: string | null) => void`.
   - Layout horizontal com suporte a touch-scroll e chip `Todas`.
3. **Atualização em `MusicCard.tsx`:**
   - Substitui `categories` por `tags`.
4. **Atualização em `SongFormPage.tsx`:**
   - Inclusão do `TagInput` com carregamento de sugestões via `GET /api/songs/tags`.
5. **Atualização em `SongsListPage.tsx`:**
   - Inclusão do `TagFilterBar` e sincronização de query params.
6. **Atualização em `PlaylistViewPage.tsx`:**
   - Filtro de tags na busca do modal de adicionar músicas.

---

## 5. Estratégia de Testes
- **Backend:** Testes unitários de normalização de tags nos Use Cases e testes de integração com Testcontainers cobrindo filtros combinados (FTS + GIN tags).
- **Frontend:** Testes de componentes Vitest para `TagInput` e `TagFilterBar`, cobrindo acessibilidade e interações.
