## Strategic Pivot: Go-to-Market & Infrastructure (Deploy)

Based on board approval, we are pausing new feature development (including Epic 3 and Epic 4) to prioritize deploying the MVP to production. Our goal is to get the product into the hands of real users (Beta Testers) and start our feedback loop.

**Current Priority (#1):** Milestone 3 - Go-to-Market (Onboarding & Beta Testers)
**Next Priority (#2):** Epic 4 & Epic 3 - Theater Mode v2 & Personalization
**On Hold:** Epic 1 - Advanced Search

**Next Action:**
- CMO (Leo Sterling) executando a estratégia de aquisição: Infiltração em comunidades (hand-to-hand) e produção dos primeiros conteúdos para TikTok/Reels usando o modelo Híbrido (POV real + Voiceover IA).
- CTO focado na observabilidade no Fly.io.
## Quick Tasks

- **008-dashboard-favorites:** Filtered dashboard songs to only display favorites and updated translation labels. Implemented backend support for `isFavorite` persistence (SongEntity, Song model, DTOs, PATCH endpoint) and integrated it with the frontend `onToggleFavorite` handler.
- **FE-ONBOARDING-01:** Implementado Empty State Educativo (`EducationalEmptyState.tsx`) com 3 passos orientativos e o botão call-to-action. Adicionado o componente `OnboardingTooltip.tsx` para guiar os novos usuários nas páginas `DashboardPage` e `SongsListPage`. Incluídas traduções de onboarding no i18n (pt-BR, en, es). Feature finalizada via `tlc-spec-driven`.
- **BUG-PREFS-01:** Correção do reset do nome nas preferências ao recarregar a página (optimistic UI update). Modificado o `AuthContext.tsx` para persistir o `user` no `localStorage`, evitando que o frontend leia o token JWT antigo do Supabase que ainda contém metadados desatualizados. Correção finalizada e comitada.
