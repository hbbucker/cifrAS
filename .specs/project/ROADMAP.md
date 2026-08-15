# CifrAS — Roadmap

## Milestone 1: MVP — Core (Backend + Frontend)

**Goal:** Sistema funcional com todas as features P1 — músicos podem criar, visualizar, transpor e performar.

### Backend (Quarkus)
- [x] `AUTH-01/02` — Setup Quarkus + integração Supabase Auth (JWT validation filter)
- [x] `SONG-01/05` — CRUD de músicas com estrutura JSON de cifras
- [x] `TRANSP-01/02` — Engine de transposição (12 tons + variações de acordes)
- [x] `PLAYLIST-01/03` — CRUD de playlists + reordenação
- [x] `GROUP-01/02` — Grupos + playlists colaborativas + controle de acesso
- [x] Testes unitários (transposição ≥ 80% cobertura)

### Frontend (React)
- [x] `FE-AUTH-01/03` — Telas de login/registro + proteção de rotas
- [x] `FE-SONG-01/04` — Dashboard, visualização e formulário de músicas
- [x] `FE-TRANSP-01/02` — TransposePad + atualização em tempo real
- [x] `FE-PLAYLIST-01/03` — Playlists com DnD/reordenação
- [x] `FE-THEATER-01/04` — Modo Teatro completo (fullscreen + rolagem + controles)
- [x] `FE-SEARCH-01` — Busca global no header

---

## Milestone 2: Colaboração e Refinamento (P2)

**Goal:** Features colaborativas e polish — músicos de banda e grupos religiosos podem colaborar.

- [ ] `SEARCH-01` / `FE-SEARCH-01` — Busca full-text otimizada (PostgreSQL full-text search)
- [x] `TRANSP-03` — Persistência de tom preferido por usuário/música
- [x] `FE-GROUP-01` / `FE-COLLAB-01` — UI de grupos e playlists colaborativas
- [x] `FE-FAV-01` — Sistema de favoritos
- [ ] Acessibilidade: auditoria WCAG 2.1 AA completa
- [ ] Performance: LCP < 3s (Lighthouse) + p95 < 300ms no backend

---

## Milestone 3: Nice-to-Haves (P3) e Infraestrutura

**Goal:** Polimento, configurações e estabilidade para crescimento.

- [ ] `THEATER-01` — Estado de sessão do Modo Teatro no backend
- [x] `FE-SETTINGS-01` — Configurações de usuário (velocidade, convenção de tom, fonte)
- [x] `FE-ONBOARDING-01` — Empty State Educativo e Tooltips de primeiro uso
- [ ] `FE-ONBOARDING-02` — Tooltips e Onboarding Interativo para Novos Comportamentos (Persistência, Transposição)
- [x] Observabilidade: logs estruturados, tracing, health checks
- [x] CI/CD: pipeline automatizado com testes e deploy
- [x] Deploy: Fly.io (monolito Quarkus + Quinoa)

---

## Milestone 4: v2 (Pós-MVP)

- App nativo React Native
- Upload de PDFs/partituras
- Notificações push para grupos
- Diagrama interativo de acorde (fretboard)
- PWA completo com modo offline
