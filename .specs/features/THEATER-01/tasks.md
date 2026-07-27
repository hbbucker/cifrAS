# THEATER-01 Tasks

## Phase: Backend Database & Entities

### [x] 1. Criar Migration SQL para tabela `user_song_preferences`
**What**: Adicionar um arquivo `.sql` na pasta `migration` para criar a tabela.
**Where**: `codebase/migration/`
**Done when**: Migration roda com sucesso localmente.

### [x] 2. Adicionar RLS no `supabase_rls_setup.sql`
**What**: Adicionar as políticas de Row Level Security para a nova tabela `user_song_preferences` (Apenas o próprio usuário pode ver/editar suas preferências).
**Where**: `codebase/migration/supabase_rls_setup.sql`
**Done when**: Script atualizado com as políticas.

### [x] 3. Criar `UserSongPreferenceEntity`
**What**: Criar a classe entidade, mapeada para a tabela criada.
**Where**: `codebase/src/main/java/br/com/cifras/user/infra/persistence/entity/UserSongPreferenceEntity.java`
**Done when**: Entidade compila e conecta com o banco sem erros.

## Phase: Use Cases & DTOs

### [x] 4. Criar `TheaterSessionStateDTO` e `TheaterResource`
**What**: Definir o DTO e o Resource com os endpoints `PUT /api/theater/session` e `GET /api/theater/session`.
**Where**: `br.com.cifras.user.resource.TheaterResource` (ou `br.com.cifras.song.resource.TheaterResource`).
**Done when**: Endpoints mapeados e retornando status provisório (Mock).

### [x] 5. Implementar Use Cases de Save e Get
**What**: Criar `UpdateTheaterSessionUseCase` (Upsert na tabela e atualiza `updated_at`) e `GetTheaterSessionUseCase` (busca ordenando por data decrescente).
**Where**: Pasta `application/usecase`.
**Done when**: Regras de negócio implementadas.

### [x] 6. Escrever Testes Unitários e de Integração
**What**: Testes unitários para os UseCases (mínimo 95% line coverage) e integração nos resources.
**Where**: `src/test/java/...`
**Done when**: `mvn test` reportar cobertura >= 95% nos novos arquivos.

## Phase: Frontend Implementation

### [x] 7. Integrar o frontend para consumir os endpoints
**What**: Implementar as requisições API no cliente (`axios` ou `fetch`) e atualizar o estado do componente `TheaterMode.jsx` (ou equivalente) para salvar/restaurar as preferências de sessão do backend.
**Where**: Pasta `frontend/src/features/theater/` e hooks de API (ex: `useTheaterSession`).
**Done when**: Sessão é restaurada do backend ao abrir o Modo Teatro e salva periodicamente ao mudar as configs.

### [x] 8. Testes E2E com Playwright
**What**: Adicionar/modificar um cenário E2E onde o usuário abre uma música, entra no Modo Teatro, ajusta o tom e tamanho da fonte, fecha a aba e reabre a música. O estado deve se manter o mesmo configurado.
**Where**: `frontend/e2e/tests/theater.spec.ts`
**Done when**: `npx playwright test` passa localmente sem flakes.
