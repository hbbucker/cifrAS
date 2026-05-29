# Migração de IDs numéricos para UUIDv7 - Tasks

## Overview
Estas tarefas cobrem a implementação end-to-end da migração de IDs (Long/Integer) para UUIDv7 no backend e frontend. 

## T1: Backend - Entidades e UUIDv7
**What:** Alterar as chaves primárias das entidades JPA de `Long` para `UUID` e configurar a geração de UUIDv7.
**Where:** `br.com.cifras.*.domain.*` (Song, Playlist, PlaylistSong, UserPreference, Group, GroupMember, GroupInvitation)
**Depends on:** None
**Reuses:** Quarkus Hibernate ORM (utilizar `@Id`, `@GeneratedValue(strategy = GenerationType.UUID)` ou UUIDv7 provider/ `@UuidGenerator(style = UuidGenerator.Style.TIME)` se suportado pelo Hibernate 6.6+ no Quarkus 3.35).
**Done when:** Todas as entidades tiverem `UUID id` no lugar de `Long id`, e os mapeamentos `@ManyToOne` / `@OneToMany` usarem UUID como chaves estrangeiras.
**Tests:** N/A (compilação falhará até T2)

## T2: Backend - Repositórios, DTOs e Resources
**What:** Alterar os tipos de ID de `Long` para `UUID` em toda a camada de serviço/REST.
**Where:** Todos os DTOs, interfaces de Repository e classes Resource (`@Path`).
**Depends on:** T1
**Reuses:** N/A
**Done when:** O projeto backend compilar com sucesso e todos os testes de unidade/integração relacionados ao backend passarem.
**Tests:** Executar `./mvnw clean test` para garantir que o backend subiu.

## T3: Frontend - Modelos e APIs
**What:** Atualizar os tipos TypeScript para que os IDs sejam tratados como `string` em vez de `number`.
**Where:** `src/main/webui/src/types/`, `src/main/webui/src/services/api.ts`, arquivos de mock e componentes que fazem cast para `Number()` (ex: `Number(id)` no `useParams()`).
**Depends on:** T2
**Reuses:** N/A
**Done when:** O frontend compilar (`npm run build`) sem erros de tipagem no TypeScript.
**Tests:** Rodar `npm run typecheck` (se disponível) ou checar erros no VSCode.

## T4: Frontend - Roteamento e Componentes
**What:** Remover conversões de `number` nas rotas (e.g., `<Route path="/groups/:id" />` e `useParams()`).
**Where:** `App.tsx`, `GroupDetailsPage.tsx`, `SongViewPage.tsx` e qualquer outro componente que parsa a URL.
**Depends on:** T3
**Done when:** A navegação pelo frontend funcionar normalmente (ex: abrir uma música ou um grupo).
**Tests:** Validação manual ou E2E (Playwright).

## T5: Database Migration & Cleanup (Dev)
**What:** Ajustar a configuração para recriar o banco ou lidar com a migração, já que alterar de `Long` para `UUID` quebra o esquema atual gerado por `update`.
**Where:** `application.properties` ou via exclusão dos volumes Docker.
**Depends on:** T1, T2
**Done when:** O Quarkus Dev Mode iniciar sem erros de incompatibilidade de schema do PostgreSQL.
**Tests:** Iniciar `./mvnw quarkus:dev` com banco de dados limpo e rodar E2E.
