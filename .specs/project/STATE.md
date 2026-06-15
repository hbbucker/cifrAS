# CifrAS — State

## Decisions

- **[2026-06-15] Delegação de Implementação (CIF-1):** Iniciada a implementação do 'Epic 1: Advanced Search'. Especificação técnica criada em `.specs/features/advanced-search/spec.md`. Implementação delegada ao CTO (agente generalista).
- **[2026-06-15] Definição de Demandas de Evolução (CIF-1):** Backlog de evolução para Milestones 2 e 3 consolidado em `.specs/features/EVOLUTION_DEMANDS.md`. Foco em Busca Full-Text, Colaboração de Grupo, Persistência de Preferências e Theater Mode v2.
- **[2026-05-30] Arquitetura de Domínio Limpo:** Refatoração da camada de Backend (Quarkus) concluída para separar Modelos de Domínio (POJOs) das Entidades de Persistência (JPA). `Services` e `Resources` interagem apenas com abstrações de negócio limpas, enquanto `Repositories` via `Mappers` abstraem a infraestrutura e persistência no banco de dados.
- **[2026-05-24] Arquitetura Unificada:** Frontend React e Backend Quarkus migrados para uma única pasta `codebase/` utilizando a extensão **Quarkus Quinoa**. Simplifica desenvolvimento e implantação ao servir o frontend estático e as rotas `/api` a partir do mesmo servidor Quarkus.
- **[2026-05-23] Stack confirmada:** Quarkus (Java) + React (TypeScript) + Supabase (PostgreSQL + Auth). Sem mudança prevista para v1.
- **[2026-05-23] Convenção enarmônica default:** sustenidos (#) — configurável por usuário em v2.
- **[2026-05-23] Gerenciamento de estado frontend:** Context API para v1; migração para Zustand se surgir complexidade de estado global.
- **[2026-05-23] Transposição:** stateless on-the-fly via query param `?transpose=N`; tom preferido opcional salvo por usuário via PATCH.
- **[2026-05-23] Estrutura da cifra:** JSON estruturado (sections > lines > chords + text) — permite re-renderização e transposição sem parsing de texto livre.
- **[2026-05-23] Soft delete:** músicas e playlists usam soft-delete para auditoria e possível recuperação.
- **[2026-05-23] Notificações push:** fora do v1 (complexidade de infra); substituído por atualização otimista de UI.
- **[2026-05-23] Planejamento Backend TDD:** Criado o plano de tarefas backend (`tasks.md`) priorizando TDD de forma estrita em cada ciclo de desenvolvimento.

## Blockers

Nenhum blocker ativo no momento.

## Todos

- [ ] Validar estrutura de cifra JSON com músicos reais (formato legível para edição?)
- [ ] Definir limites de paginação defaults (sugestão: pageSize=20)
- [ ] Confirmar estratégia de refresh token (silent vs redirect)
- [ ] **[DESIGN]** Decidir biblioteca de DnD para reordenação de playlist — `dnd-kit` recomendado (`react-beautiful-dnd` em modo manutenção)
- [ ] **[DESIGN]** Definir velocidade default de rolagem automática (sugestão: 3/10) — testar com músicos
- [ ] **[DESIGN]** Confirmar se busca full-text (P2) usará `ILIKE` ou `tsvector` do PostgreSQL

## Deferred Ideas

- App nativo React Native (v2)
- Upload de PDFs/partituras via Supabase Storage (v2)
- Detecção automática de acordes por áudio (v3)
- Marketplace de repertórios públicos (v3)
- Integração com Spotify para identificar tom de músicas (v3)
- Notificações push para convites de grupo (v2)
- Diagrama interativo de acorde (fretboard visual) (v2)

## Preferences

- Spec-driven workflow estabelecido; specs de backend e frontend criadas em 2026-05-23.
