# Tasks: FE-ONBOARDING-01

## 1. i18n
- [x] Adicionar traduções de Empty State Educativo e Tooltip para PT-BR e EN (arquivos `translation.json`).

## 2. Componentes
- [x] Criar o componente `EducationalEmptyState.tsx` (baseado no `EmptyState.tsx` atual, mas com mais contexto visual/educativo, como passos numéricos).
- [x] Criar o componente `OnboardingTooltip.tsx` (um componente de popover simples para focar num elemento alvo, salvo no localStorage quando dispensado).

## 3. Integração
- [x] Atualizar `DashboardPage.tsx` para usar o `EducationalEmptyState` quando `songs.length === 0`.
- [x] Atualizar `SongsListPage.tsx` para usar o `EducationalEmptyState` quando `songs.length === 0`.
- [x] Adicionar `OnboardingTooltip` apontando para o botão "Adicionar Música" no `SongsListPage`.

## 4. Testes e Validação
- [x] Limpar cache local e verificar se a Tooltip aparece na primeira visita a SongsListPage.
- [x] Verificar se as traduções estão corretas.
- [x] Verificar renderização do `EducationalEmptyState` e se o fluxo para criar música está desimpedido.
