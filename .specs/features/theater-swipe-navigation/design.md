# Design Técnico — Navegação por Gestos no Modo Teatro

## 1. Arquitetura e Decisões Técnicas (CTO & Frontend Staff)

### 1.1 Eliminação do Listener de Clique Lateral
No código atual de `TheaterModePage.tsx`:
```tsx
// REMOVER este comportamento:
if (clientX < width * 0.3) {
  if (playlistId) handlePrevSong();
} else if (clientX > width * 0.7) {
  if (playlistId) handleNextSong();
} else {
  setShowControls(prev => !prev);
}
```
**Substituir por:**
```tsx
// NOVO comportamento:
onClick={(e) => {
  if (e.target instanceof Element && e.target.closest('button, a, input, [role="button"], [data-testid="theater-controls"]')) return;
  setLastInteraction(Date.now());
  setShowControls(prev => !prev);
}}
```

### 1.2 Detecção de Gestos Touch (Swipe)
- Preservar o cálculo de vetor direcional no `onTouchEnd` com `minSwipeDistance = 75` (ou 100).
- Validar se `Math.abs(distanceY) > Math.abs(distanceX)` para garantir que gestos de rolagem vertical não acionem troca de música.
- Respeitar o estado `isLocked` (não trocar de música nem disparar ações se a tela estiver travada).

### 1.3 Acessibilidade e Teclado
- Adicionar listener global para `keydown` no ciclo de vida do componente:
  - `ArrowRight` -> `handleNextSong()`
  - `ArrowLeft` -> `handlePrevSong()`
  - `Space` -> alternar play/pause da rolagem automática
  - Ignorar eventos se o alvo for campo de texto ou se `isLocked === true`.

### 1.4 Testes e Cobertura
- Criar suíte de testes unitários dedicada `TheaterModePage.test.tsx` com React Testing Library / Vitest cobrindo:
  - Clicar na lateral esquerda (<30%) alterna controles e NÃO chama navegação.
  - Clicar na lateral direita (>70%) alterna controles e NÃO chama navegação.
  - Simulação de touch swipe horizontal dispara navegação de música.
  - Simulação de touch swipe vertical NÃO dispara navegação de música.
  - Navegação via teclas de seta (`ArrowLeft` / `ArrowRight`).
- Validar suíte E2E existente no Playwright (`tests/theater.spec.ts` e `tests/theater-v2.spec.ts`).
