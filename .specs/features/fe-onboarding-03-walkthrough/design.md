# Design: Coach Marks & Walkthrough (Opção B)

## 1. Arquitetura de Estado (TourProvider)
Usaremos React Context para gerenciar globalmente o estado do tour.
- `TourContext`: guarda o `currentStep` (índice), `isActive` (boolean) e `tourId` (string, para suportar múltiplos tours).
- Hook `useTour()`: expõe funções `startTour(id)`, `nextStep()`, `prevStep()`, `endTour()`.

## 2. Componente CoachMark
Utilizaremos `@floating-ui/react` para ancorar o balão de dica ao elemento alvo, garantindo que não quebre o layout ou sobreponha de forma incorreta nas bordas da tela.
- Propriedades: `stepIndex` (para checar se deve renderizar), `title`, `content`, `placement` (top, bottom, left, right).
- Estilo (Tailwind): fundo escuro (`bg-gray-900`), texto claro (`text-white`), padding interno, raio de 16px (`rounded-md`), z-index alto.
- Um "spotlight" (backdrop) leve com `z-index` inferior ao `CoachMark` mas superior ao resto da tela pode ser usado, com `mix-blend-mode` ou simplesmente um overlay parcial, mas para simplificar inicialmente focaremos apenas no popover ancorado.

## 3. Substituição do FeatureDiscoveryModal
- Remover `FeatureDiscoveryModal.tsx` e suas referências.
- Na tela principal (ou na importação do Cifra Club), adicionar os anchors do `CoachMark`.

## 4. Classificação e Contrato
- Impacto de Produto: I1 (Interface de Usuário e Guias)
- Contrato: Não afeta API backend (apenas client-side state).
- N/A justificado para backend DTOs.
