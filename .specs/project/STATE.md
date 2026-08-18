## Strategic Pivot: Go-to-Market & Infrastructure (Deploy)

Based on board approval, we are pausing new feature development (including Epic 3 and Epic 4) to prioritize deploying the MVP to production. Our goal is to get the product into the hands of real users (Beta Testers) and start our feedback loop.

**Current Priority (#1):** Milestone 3 - Go-to-Market (Onboarding & Beta Testers)
**Next Priority (#2):** Epic 4 & Epic 3 - Theater Mode v2 & Personalization
**On Hold:** Epic 1 - Advanced Search

**Next Action:**
- CMO (Leo Sterling) executando a estratégia de aquisição: Infiltração em comunidades (hand-to-hand) e produção dos primeiros conteúdos para TikTok/Reels usando o modelo Híbrido (POV real + Voiceover IA).
- CTO implementou a feature `THEATER-01` (Sessões do modo teatro) com 100% de cobertura de código. Feature homologada.
- CPO (Maya) entregou a feature `FE-ONBOARDING-02` com o Feature Discovery Modal. Funcionalidade finalizada e testes E2E ajustados.
## Quick Tasks

- **INFRA-M3:** Adicionado pipeline automatizado CI/CD no GitHub Actions e configurada a observabilidade com `smallrye-health`, rotas de live/ready e logs estruturados em JSON para o Fly.io. Cobertura de backend em 100% pass e front-end com mock resolvido. ROADMAP atualizado.
- **008-dashboard-favorites:** Filtered dashboard songs to only display favorites and updated translation labels. Implemented backend support for `isFavorite` persistence (SongEntity, Song model, DTOs, PATCH endpoint) and integrated it with the frontend `onToggleFavorite` handler.
- **FE-ONBOARDING-01:** Implementado Empty State Educativo (`EducationalEmptyState.tsx`) com 3 passos orientativos e o botão call-to-action. Adicionado o componente `OnboardingTooltip.tsx` para guiar os novos usuários nas páginas `DashboardPage` e `SongsListPage`. Incluídas traduções de onboarding no i18n (pt-BR, en, es). Feature finalizada via `tlc-spec-driven`.
- **BUG-PREFS-01:** Correção do reset do nome nas preferências ao recarregar a página (optimistic UI update). Modificado o `AuthContext.tsx` para persistir o `user` no `localStorage`, evitando que o frontend leia o token JWT antigo do Supabase que ainda contém metadados desatualizados. Correção finalizada e comitada.
- **BUG-AUTH-01:** (DONE) Correção da expiração do token JWT no Modo Palco. A chamada nativa `fetch` foi substituída pelo `apiClient` com interceptors do Axios (`authService.ts`), permitindo refresh automático e transparente do token em caso de erro 401. Funcionalidade finalizada e documentada.
- **BUG-THEATER-02:** (DONE) Resolved the "Domino Effect" bug where transposition state was incorrectly saved to user preferences when editing a song. Tests automated and passing. Slack Bridge integrated for image uploads via `files.uploadV2`. CI/CD checked out.
- **SONG-SHARING-01:** (DONE) Implementada a feature de Compartilhamento Direto de Músicas por E-mail. Inclui domínio rico com estados PENDING/ACCEPTED/DECLINED, endpoints REST (`POST /api/songs/{id}/share`, `GET /api/songs/shares/pending`, `POST /api/songs/shares/{id}/accept`, `POST /api/songs/shares/{id}/decline`), clonagem de dados isolada para o destinatário, modal acessível `ShareSongModal`, integração em `SongViewPage`, `SongsListPage` e seção de músicas recebidas em `SharedWithMePage`. 100% de cobertura no diff do backend (32 testes dedicados, 151 total) e frontend (15 testes dedicados, 58 total). Validado e aprovado pelo QA Lead.
- **FIX-UI-010:** (DONE) Correção do botão de compartilhamento na DashboardPage e inclusão do menu /shared no BottomNav mobile com badge de contagem de compartilhamentos pendentes (`usePendingSharesCount`). 62 testes de frontend e 151 de backend passando 100%. Validado pelo QA Lead e publicado em produção no Fly.io.
- **GROUP-MEMBERS-01:** (DONE) Gerenciamento completo de pessoas, membros e convites em grupos (`group-members-management`). Inclui contagem $O(1)$ sem N+1, resolução em batch de perfis em `auth.users`, navegação por abas Pinterest-inspired ("Playlists" e "Membros & Convites"), listagem com badges de papel (`Proprietário`, `Admin`, `Membro`), ações de remoção/saída com modais de confirmação, listagem e cancelamento de convites, 100% i18n e cobertura de testes no diff (161 testes backend, 85 frontend). Validado e aprovado pelo QA Lead.
- **BRANDING-01:** (DONE) Identidade visual mobile e novo ícone exclusivo *"The Chord Pick"* (`mobile-brand-identity-and-icon`). Ícone vetorial proprietário (palheta + 'C' estilizado + cordas/acordes), Top Bar mobile de 52px com ancoragem de marca no Dashboard e páginas internas (`Playlists`, `Músicas`, `Grupos`, `Compartilhados`, `Configurações`), atualização de `favicon.svg`, `Sidebar`, `LoginPage` e `LandingPage`. 122 testes de frontend passando, 0 erros no ESLint. Validado pelo QA Lead e publicado com sucesso no Fly.io (Release v51).


