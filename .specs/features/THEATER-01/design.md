# THEATER-01 Design

## Architecture & Components

Para resolver o problema de persistência do estado da sessão do Modo Teatro e as preferências por música, adotaremos a seguinte arquitetura no backend (Java Quarkus):

### 1. Database Schema
Criaremos uma nova tabela `user_song_preferences` para armazenar as preferências do usuário específicas para cada música. Isso atende ao requisito de manter o estado persistido "para o futuro nas preferências do usuário em relação àquela música/sessão". 
O estado da "sessão" atual será derivado da última música interagida (ordenando por `updated_at`).

**Tabela: `user_song_preferences`**
- `user_id` (VARCHAR) - PK
- `song_id` (UUID) - PK
- `transpose_steps` (INT)
- `auto_scroll_speed` (INT)
- `font_size` (INT)
- `updated_at` (TIMESTAMP)

Dessa forma, ao buscar a "Sessão Atual", o backend simplesmente busca o registro mais recente (order by updated_at desc limit 1) para o usuário.

### 2. Backend (Quarkus) Components

**Entidade:**
- `UserSongPreferenceEntity` mapeada para a tabela `user_song_preferences`.

**Model & DTOs:**
- `TheaterSessionStateDTO`:
  ```java
  public record TheaterSessionStateDTO(
      UUID songId,
      Integer transposeSteps,
      Integer autoScrollSpeed,
      Integer fontSize
  ) {}
  ```

**Use Cases:**
- `UpdateTheaterSessionUseCase`: Recebe um `TheaterSessionStateDTO`, atualiza ou insere (upsert) na tabela `user_song_preferences` definindo o `updated_at` como `now()`.
- `GetTheaterSessionUseCase`: Retorna o estado atual (registro mais recente de `user_song_preferences` para o `user_id`).
- `GetSongPreferenceUseCase`: Retorna a preferência de uma música específica (útil quando o usuário clica em uma música diferente da última tocada).

**Resource (Endpoints REST):**
- `PUT /api/theater/session` - Salva o estado atual.
- `GET /api/theater/session` - Retorna a última sessão do usuário.
- `GET /api/theater/song-preferences/{songId}` - Retorna as preferências do usuário para uma música específica (pode ser o mesmo DTO).

### 3. Alteração nas Entidades Existentes
Atualmente, as preferências (`prefAutoScrollSpeed`, `prefTransposeSteps`) estão na tabela `songs` e no `SongEntity`.
Como o foco deste requisito é a nova sessão e preferências do *usuário*, não precisamos remover os campos de `SongEntity` imediatamente (eles podem servir como defaults do criador da música), mas o Modo Teatro passará a respeitar os valores salvos em `user_song_preferences`.

## Testability
- Escreveremos testes unitários para os UseCases usando o Mock do repositório.
- A cobertura mínima (95%) e integração no Playwright garantirão que a chamada REST funcione e recupere o estado corretamente ao recarregar a tela.
