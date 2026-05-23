# CifrAS — Roadmap

## Milestone 1: MVP — Core (Backend + Frontend)

**Goal:** Sistema funcional com todas as features P1 — músicos podem criar, visualizar, transpor e performar.

### Backend (Quarkus)
- [ ] `AUTH-01/02` — Setup Quarkus + integração Supabase Auth (JWT validation filter)
- [ ] `SONG-01/05` — CRUD de músicas com estrutura JSON de cifras
- [ ] `TRANSP-01/02` — Engine de transposição (12 tons + variações de acordes)
- [ ] `PLAYLIST-01/03` — CRUD de playlists + reordenação
- [ ] `GROUP-01/02` — Grupos + playlists colaborativas + controle de acesso
- [ ] Testes unitários (transposição ≥ 80% cobertura)

### Frontend (React)
- [ ] `FE-AUTH-01/03` — Telas de login/registro + proteção de rotas
- [ ] `FE-SONG-01/04` — Dashboard, visualização e formulário de músicas
- [ ] `FE-TRANSP-01/02` — TransposePad + atualização em tempo real
- [ ] `FE-PLAYLIST-01/03` — Playlists com DnD/reordenação
- [ ] `FE-THEATER-01/04` — Modo Teatro completo (fullscreen + rolagem + controles)
- [ ] `FE-SEARCH-01` — Busca global no header

---

## Milestone 2: Colaboração e Refinamento (P2)

**Goal:** Features colaborativas e polish — músicos de banda e grupos religiosos podem colaborar.

- [ ] `SEARCH-01` / `FE-SEARCH-01` — Busca full-text otimizada (PostgreSQL full-text search)
- [ ] `TRANSP-03` — Persistência de tom preferido por usuário/música
- [ ] `FE-GROUP-01` / `FE-COLLAB-01` — UI de grupos e playlists colaborativas
- [ ] `FE-FAV-01` — Sistema de favoritos
- [ ] Acessibilidade: auditoria WCAG 2.1 AA completa
- [ ] Performance: LCP < 3s (Lighthouse) + p95 < 300ms no backend

---

## Milestone 3: Nice-to-Haves (P3) e Infraestrutura

**Goal:** Polimento, configurações e estabilidade para crescimento.

- [ ] `THEATER-01` — Estado de sessão do Modo Teatro no backend
- [ ] `FE-SETTINGS-01` — Configurações de usuário (velocidade, convenção de tom, fonte)
- [ ] Observabilidade: logs estruturados, tracing, health checks
- [ ] CI/CD: pipeline automatizado com testes e deploy
- [ ] Deploy: Vercel (frontend) + Fly.io/Railway (backend Quarkus)

---

## Milestone 4: v2 (Pós-MVP)

- App nativo React Native
- Upload de PDFs/partituras
- Notificações push para grupos
- Diagrama interativo de acorde (fretboard)
- PWA completo com modo offline
