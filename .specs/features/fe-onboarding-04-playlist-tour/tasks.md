# Tarefas: FE-ONBOARDING-04 - Onboarding Guiado de Playlists

**Status:** Tasks pronto

## Decomposição de Tarefas

### T1: Internacionalização (i18n)
- **Objetivo:** Adicionar chaves de tradução em pt-BR, en e es para os textos de tour, empty state educativo e botão gotIt.
- **Owner:** Frontend Staff
- **Arquivos:**
  - `src/main/webui/src/locales/pt-BR.json`
  - `src/main/webui/src/locales/en.json`
  - `src/main/webui/src/locales/es.json`
- **Dependências:** Nenhuma

### T2: Atualização do `CoachMark.tsx` com i18n
- **Objetivo:** Remover string hardcoded "Entendi" e utilizar `useTranslation` com `t('common.gotIt', 'Entendi')` ou prop `confirmText`.
- **Owner:** Frontend Staff
- **Arquivos:**
  - `src/main/webui/src/components/ui/CoachMark.tsx`
- **Dependências:** T1

### T3: Implementar Coach Mark e Educational Empty State em `PlaylistsPage.tsx`
- **Objetivo:** Integrar `useTour` (`startTour('playlist-create')`), envolver botão "+ Nova Playlist" com `CoachMark`, e renderizar `EducationalEmptyState` quando a lista estiver vazia.
- **Owner:** Frontend Staff
- **Arquivos:**
  - `src/main/webui/src/pages/PlaylistsPage.tsx`
- **Dependências:** T1, T2

### T4: Implementar Coach Mark e Ação de Empty State em `PlaylistViewPage.tsx`
- **Objetivo:** Integrar `useTour` (`startTour('playlist-add-song')`), envolver botão de adicionar músicas com `CoachMark`, e incluir CTA no empty state de músicas da playlist.
- **Owner:** Frontend Staff
- **Arquivos:**
  - `src/main/webui/src/pages/PlaylistViewPage.tsx`
- **Dependências:** T1, T2

### T5: Testes Unitários e Validação de Cobertura
- **Objetivo:** Criar e atualizar testes com Vitest / React Testing Library para validar o disparo dos tours, cliques de dispensa e renderização de estados educativos, garantindo cobertura ≥ 90% no diff.
- **Owner:** Frontend Staff
- **Arquivos:**
  - `src/main/webui/src/tests/CoachMark.test.tsx`
  - `src/main/webui/src/tests/PlaylistsPage.test.tsx`
  - `src/main/webui/src/tests/PlaylistViewPage.test.tsx` (se aplicável)
- **Dependências:** T2, T3, T4

## Gates e Evidências
- **G-IM-01:** Executar `npm test` e `npm run lint` no frontend com 100% de sucesso e cobertura do diff ≥ 90%.
