# Design: Onboarding Guiado de Playlists (Coach Marks & Tour)

## 1. Arquitetura e Componentes Frontend

### 1.1 `CoachMark` Component (`CoachMark.tsx`)
- **Aderência ao ADR Tradução:** Substituir a string estática `"Entendi"` por `t('common.gotIt', 'Entendi')` via hook `useTranslation`, permitindo também sobrescrita via prop `confirmText?: string`.
- **Acessibilidade e Estilo:** Manter anel pulsante `ring-4 ring-[#aa3bff]/40`, cores de alto contraste, e fechamento via botão e 'X'.

### 1.2 `PlaylistsPage` (`PlaylistsPage.tsx`)
- **Integração com `TourContext`:**
  - Acionamento via `startTour('playlist-create')` após carregamento inicial (delay de 800ms).
  - Envolvimento do botão de criação `data-testid="create-playlist-btn"` com `<CoachMark tourId="playlist-create" ... />`.
- **Educational Empty State:**
  - Substituir o `EmptyState` simples por `EducationalEmptyState` quando `playlists.length === 0`.
  - Exibir os 3 passos estruturados para orientar novos músicos no fluxo de setlists.

### 1.3 `PlaylistViewPage` (`PlaylistViewPage.tsx`)
- **Integração com `TourContext`:**
  - Acionamento via `startTour('playlist-add-song')` quando o usuário for o dono da playlist (`isOwner`).
  - Envolvimento do botão de adicionar músicas (`Plus`) com `<CoachMark tourId="playlist-add-song" ... />`.
- **Empty State Action:**
  - Inclusão de CTA direto ("Adicionar Músicas") no empty state interno da playlist quando `songs.length === 0` e `isOwner === true`.

### 1.4 Internacionalização (i18n)
- Atualização completa dos 3 arquivos de idioma (`pt-BR.json`, `en.json`, `es.json`) cobrindo:
  - `playlists.tourTitle` / `playlists.tourDesc`
  - `playlists.educationalEmptyTitle` / `playlists.educationalEmptyStep1` / `playlists.educationalEmptyStep2` / `playlists.educationalEmptyStep3`
  - `playlistView.tourTitle` / `playlistView.tourDesc`
  - `common.gotIt`

---

## 2. Contratos de Dados (DTOs)
- **Status:** N/A (Feature 100% frontend baseada em UI e persistência de tour em `localStorage`).

---

## 3. Estratégia de Testes e Rollback
- **Testes Unitários:** Vitest + React Testing Library cobrindo `CoachMark`, `PlaylistsPage` (EducationalEmptyState e CoachMark) e `PlaylistViewPage` (CoachMark no botão de adicionar).
- **Cobertura no Diff:** ≥ 90% em todas as linhas novas/alteradas.
- **Rollback:** Totalmente isolado no frontend, reversão de commit limpa e imediata sem efeitos colaterais em banco.
