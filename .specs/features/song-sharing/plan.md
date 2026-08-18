# Plano de Implementação e Arquitetura — Song Sharing 🛠️

## 1. Arquitetura Técnica & Modelo de Domínio (DDD)

### 1.1 Modelo de Domínio (`br.com.cifras.song.model`)
- **`SongShareStatus` (Enum):**
  - `PENDING`: Aguardando resposta do destinatário.
  - `ACCEPTED`: Convite aceito e música clonada para o destinatário.
  - `DECLINED`: Convite recusado e descartado.
- **`SongShare` (POJO de Domínio Rico):**
  - `UUID id`
  - `UUID songId`
  - `String inviterId` (UUID do remetente)
  - `String inviteeEmail` (e-mail do destinatário)
  - `SongShareStatus status`
  - `Instant createdAt`
  - `Instant updatedAt`
  - Métodos de negócio:
    - `accept()`: Valida se status é `PENDING` e altera para `ACCEPTED`.
    - `decline()`: Valida se status é `PENDING` e altera para `DECLINED`.

### 1.2 Entidade JPA & Persistência (`br.com.cifras.song.infra.persistence`)
- **Tabela:** `song_shares`
  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE`
  - `inviter_id VARCHAR(255) NOT NULL`
  - `invitee_email VARCHAR(255) NOT NULL`
  - `status VARCHAR(50) NOT NULL`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at TIMESTAMPTZ`
  - Índice: `CREATE INDEX idx_song_shares_invitee ON song_shares (LOWER(invitee_email), status);`
- **`SongShareEntity`:** Entidade JPA Panache mapeando os campos acima.
- **`SongShareRepository`:** Implementando `PanacheRepository<SongShareEntity>` com consultas:
  - `findPendingByInviteeEmail(String email)`
  - `findBySongAndInvitee(UUID songId, String email, SongShareStatus status)`
  - `findById(UUID id)`

### 1.3 Casos de Uso (`br.com.cifras.song.application.usecase`)
1. **`ShareSongUseCase`:**
   - Valida se a música existe e se pertence ao usuário autenticado (`requestingUserId`).
   - Resolve o `userId` do e-mail de destino via `UserService.getUserIdByEmail(targetEmail)`.
   - Lança `IllegalArgumentException` se o e-mail não estiver cadastrado.
   - Lança `IllegalArgumentException` se o destinatário for o próprio remetente.
   - Verifica se já existe um `SongShare` com status `PENDING` para a mesma música e e-mail (lança `ConflictException`).
   - Persiste o novo `SongShare`.
2. **`ListPendingSongSharesUseCase`:**
   - Obtém o e-mail do usuário autenticado.
   - Busca todos os `SongShare` com status `PENDING` onde `invitee_email` coincide com o e-mail do usuário.
   - Carrega as informações básicas da música original e dados do remetente para montar a resposta.
3. **`AcceptSongShareUseCase`:**
   - Busca o `SongShare` pelo ID.
   - Valida se o e-mail do usuário autenticado confere com `inviteeEmail` e se o status é `PENDING`.
   - Carrega a música original (`SongRepository.findById(share.getSongId())`).
   - Cria uma cópia da música: `Song.createCloneForUser(originalSong, currentUserId)`.
   - Persiste a nova música via `SongRepository.persist(clonedSong)`.
   - Atualiza o status do compartilhamento para `ACCEPTED`.
4. **`DeclineSongShareUseCase`:**
   - Busca o `SongShare` pelo ID.
   - Valida autorização do destinatário.
   - Atualiza o status para `DECLINED`.

---

## 2. Selo de Contrato (Contratos REST / DTOs)

### 2.1 Request DTOs
```java
package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RegisterForReflection
public record ShareSongRequestDTO(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email
) {}
```

### 2.2 Response DTOs
```java
package br.com.cifras.song.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.Instant;
import java.util.UUID;

@RegisterForReflection
public record SongShareResponseDTO(
    UUID id,
    UUID songId,
    String inviterId,
    String inviteeEmail,
    String status,
    Instant createdAt
) {}

@RegisterForReflection
public record PendingSongShareItemDTO(
    UUID shareId,
    UUID songId,
    String songTitle,
    String songArtist,
    String originalKey,
    String inviterName,
    String inviterEmail,
    Instant sharedAt
) {}
```

### 2.3 Endpoints REST (`SongShareResource.java` em `/api/songs/shares`)
- `POST /api/songs/{id}/share` → Status `201 Created` — Body: `ShareSongRequestDTO` → Retorno: `SongShareResponseDTO`
- `GET /api/songs/shares/pending` → Status `200 OK` → Retorno: `List<PendingSongShareItemDTO>`
- `POST /api/songs/shares/{shareId}/accept` → Status `200 OK` → Retorno: `SongDTO` (dados da nova música criada)
- `POST /api/songs/shares/{shareId}/decline` → Status `204 No Content`

---

## 3. Frontend Architecture (`webui`)

### 3.1 Clientes de API (`src/api/songShares.ts`)
- `shareSong(songId: string, email: string): Promise<SongShareResponse>`
- `getPendingSongShares(): Promise<PendingSongShareItem[]>`
- `acceptSongShare(shareId: string): Promise<Song>`
- `declineSongShare(shareId: string): Promise<void>`

### 3.2 Componentes e Telas
- **`ShareSongModal.tsx` (`components/modals/ShareSongModal.tsx`):**
  - Modal com design Pinterest-inspired (`rounded-lg`, sem sombras, background escurecido 50%).
  - Input de e-mail com validação e botão de envio Purple Primary.
  - Toasts de feedback para sucesso ou erro (usuário não encontrado, erro 400/404/409).
- **Integração na UI existente:**
  - Botão de compartilhamento em `SongViewPage.tsx` e no menu de ações de cards em `SongsListPage.tsx`.
  - Seção ou aba "Músicas Recebidas" na `SharedWithMePage.tsx` (ou card de avisos em `SongsListPage.tsx`), exibindo lista de pendentes com ações "Aceitar" / "Recusar".
- **i18n:**
  - Adição de chaves em `locales/pt-BR.json`, `locales/en.json`, `locales/es.json` sob a chave `songSharing`.

---

## 4. Estratégia de Testes e Gates de Qualidade

### 4.1 Backend
- **Unitários (JUnit 5):**
  - `SongShareTest`: Validação dos métodos de domínio (`accept()`, `decline()`, invariantes).
  - `ShareSongUseCaseTest`: Casos de sucesso, usuário inexistente, auto-compartilhamento, duplicação.
  - `AcceptSongShareUseCaseTest`: Clonagem correta, isolamento da nova música, status atualizado.
  - `DeclineSongShareUseCaseTest`: Recusa e descarte.
- **Integração (Testcontainers + REST Assured):**
  - `SongShareResourceTest`: Testes dos endpoints HTTP com autenticação JWT simulada.

### 4.2 Frontend
- **Unitários (Vitest + Testing Library):**
  - `ShareSongModal.test.tsx`: Renderização, envio do formulário, validação de e-mail, tratamento de erros.
  - `SharedWithMePage.test.tsx` / `PendingSharesSection.test.tsx`: Listagem de pendentes, disparo de aceite e recusa.
- **E2E (Playwright):**
  - Cenários cobrindo AC-01 a AC-08 (compartilhar, aceitar, recusar e verificar isolamento).
