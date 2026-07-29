# Theater Mode v2 Design

**Spec**: `.specs/features/theater-v2/spec.md`
**Status**: Draft

---

## Architecture Overview

O estado da Sessão de Performance será salvo ativamente pelo frontend usando debounced requests para um novo endpoint do backend, atrelado ao usuário logado.

```mermaid
graph TD
    A[Theater Page (React)] -->|Debounced PATCH /sessions| B[PerformanceSessionResource]
    A -->|Swipe / Lock / Double Tap| A
    B --> C[PerformanceSessionService]
    C --> D[PerformanceSessionRepository]
    C --> E[Supabase PostgreSQL]
    F[App Initialization] -->|GET /sessions/active| B
    B -->|Returns Session State| F
    F -->|Prompt "Resume?"| A
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component            | Location            | How to Use                |
| -------------------- | ------------------- | ------------------------- |
| `apiClient.ts`       | `src/api/`          | Reutilizar a instância do Axios (com interceptor de JWT já resolvido). |
| `TheaterMode.tsx`    | `src/pages/`        | Estender este componente para incluir o estado de `lockMode` e registrar os event listeners de gestos. |
| `PanacheRepository`  | `backend`           | Usar o padrão existente de repositório para salvar a sessão no banco. |

### Integration Points

| System         | Integration Method                      |
| -------------- | --------------------------------------- |
| PostgreSQL     | Nova tabela `performance_sessions` vinculada a `users` e `playlists`. |

---

## Components

### Backend: PerformanceSessionResource

- **Purpose**: Endpoint REST para gerenciar o estado da sessão do usuário.
- **Location**: `src/main/java/br/com/cifras/performance/resource/PerformanceSessionResource.java`
- **Interfaces**:
  - `GET /api/performance/sessions/active`: Retorna a sessão atual do usuário, se houver e se não estiver expirada (ex: criada nas últimas 12 horas).
  - `PATCH /api/performance/sessions/active`: Cria ou atualiza a sessão do usuário com o `playlistId`, `currentSongIndex` e `scrollPosition`.
  - `DELETE /api/performance/sessions/active`: Encerra a sessão explicitamente.

### Frontend: usePerformanceSession (Custom Hook)

- **Purpose**: Abstrai a lógica de chamadas debounced para salvar a sessão e buscar a sessão ativa ao entrar na Home.
- **Location**: `src/main/webui/src/hooks/usePerformanceSession.ts`
- **Interfaces**:
  - `activeSession`: Estado com os dados da sessão recuperada.
  - `saveProgress(playlistId, songIndex, scrollY)`: Função debounced que chama o `PATCH`.
  - `clearSession()`: Limpa o estado e deleta no backend.

### Frontend: TheaterControls

- **Purpose**: Subcomponente visual dos botões no modo teatro, agora com suporte ao "Lock Mode".
- **Location**: `src/main/webui/src/components/theater/TheaterControls.tsx`
- **Interfaces**:
  - `isLocked: boolean` (se true, esconde botões secundários).
  - `onLockToggle: () => void`.

---

## Data Models

### PerformanceSession (Backend)

```java
@Entity
@Table(name = "performance_sessions")
public class PerformanceSessionEntity extends PanacheEntityBase {
    @Id
    @Column(name = "user_id") // Um usuário tem apenas 1 sessão ativa
    public UUID userId;

    @Column(name = "playlist_id")
    public UUID playlistId;

    @Column(name = "current_song_index")
    public Integer currentSongIndex;

    @Column(name = "scroll_position")
    public Double scrollPosition;

    @Column(name = "updated_at")
    public Instant updatedAt;
}
```

### PerformanceSession (Frontend TypeScript)

```typescript
export interface PerformanceSession {
  playlistId: string;
  currentSongIndex: number;
  scrollPosition: number;
  updatedAt: string;
}
```

---

## Error Handling Strategy

| Error Scenario | Handling      | User Impact      |
| -------------- | ------------- | ---------------- |
| Falha no PATCH (Offline) | O hook `usePerformanceSession` silencia o erro e tenta novamente no próximo debounced call. Se falhar continuamente, não bloqueia a UI. | Nenhum impacto visual, mas o estado não é salvo na nuvem se a internet cair. |
| Sessão aponta para Playlist deletada | O backend verifica a integridade. Se a playlist não existir, retorna 404 para o GET da sessão. | O frontend ignora a sessão antiga e não exibe o prompt de "Retomar". |

---

## Tech Decisions

| Decision          | Choice          | Rationale     |
| ----------------- | --------------- | ------------- |
| Persistência | PostgreSQL via Debounced PATCH | WebSockets dariam sync em tempo real, mas são overkill para o MVP. Um PATCH a cada 3-5 segundos é leve e resolve a dor de falha de dispositivo sem onerar os custos de servidor. |
| Chave Primária | `user_id` na entidade | Queremos manter as coisas simples. O usuário só tem "uma apresentação acontecendo ao mesmo tempo". Isso evita a necessidade de gerenciar múltiplos IDs de sessão. |
| Gestos | API nativa TouchEvents do React (`onTouchStart`, etc) | Adicionar bibliotecas externas (`framer-motion` ou `react-use-gesture`) aumentaria o bundle size, o que contraria o Epic 6 de performance. Eventos nativos são suficientes para Swipe horizontal. |
