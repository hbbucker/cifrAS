# Especificação — Navegação por Gestos no Modo Teatro (Theater Mode Usability Fix)

## 1. Resumo Funcional & Problema de UX

### Problema Identificado
No **Modo Teatro** atual (`TheaterModePage.tsx`), a tela possui áreas de toque laterais mapeadas no evento `onClick`:
- Clicar/tocar no terço esquerdo da tela (`clientX < width * 0.3`) aciona a música anterior.
- Clicar/tocar no terço direito da tela (`clientX > width * 0.7`) aciona a próxima música.
- Apenas a área central alterna a visibilidade dos controles.

**Impacto no Usuário (Músico no Palco):**
Durante uma apresentação ao vivo ou ensaio, o músico toca na tela para ajustar a posição, tentar exibir os controles, evitar que o visor apague ou enquanto segura o dispositivo. A troca de música por clique simples nas laterais causa **mudanças acidentais e inesperadas de música no meio de uma execução musical**, gerando frustração extrema e quebra de fluxo crítico.

### Solução de Produto & UX (Parecer CPO / UX)
1. **Eliminação Total do Clique Lateral para Troca de Música:** O clique/toque em qualquer parte do fundo da tela (fora dos botões interativos) deve servir **exclusivamente para exibir/ocultar a barra de controles** (`TheaterControls`).
2. **Navegação Exclusiva por Gestos Intencionais (Swipe / Arrastar):** A troca de música via tela só poderá ocorrer através do gesto de **deslizar horizontalmente** (swipe left = próxima música, swipe right = música anterior), exigindo uma distância mínima intencional (>= 50px-100px) e movimento horizontal dominante para evitar falsos positivos durante o scroll vertical.
3. **Controles Explícitos e Acessibilidade:**
   - Botões dedicados de "Anterior" (`ChevronLeft`) e "Próxima" (`ChevronRight`) na barra `TheaterControls`.
   - Atalhos de teclado para palco/pedais USB/Bluetooth: Setas do teclado (`ArrowLeft` = anterior, `ArrowRight` = próxima, `Space` = play/pause, `Escape` = sair).
4. **Proteção no Modo Trava (Lock Mode):** Quando a trava de tela estiver ativada, gestos de swipe acidentais também não devem alterar a música.

---

## 2. Jornadas do Usuário (UX)

### Jornada 1: Toque na Tela para Exibir/Ocultar Controles
- **Dado** que o músico está visualizando uma cifra no Modo Teatro.
- **Quando** ele toca ou clica em qualquer área da tela (mesmo nas bordas laterais).
- **Então** a música NÃO é alterada.
- **E** a barra de controles `TheaterControls` alterna sua visibilidade (aparece se estiver oculta, ou oculta se estiver visível).

### Jornada 2: Troca de Música por Gesto de Swipe (Arrastar)
- **Dado** que o músico está em uma playlist com múltiplas músicas no Modo Teatro.
- **Quando** ele arrasta o dedo na tela da direita para a esquerda (swipe left) com deslocamento horizontal superior ao limiar configurado.
- **Então** o sistema navega suavemente com animação de slide para a próxima música.
- **Quando** ele arrasta da esquerda para a direita (swipe right).
- **Então** o sistema navega para a música anterior.

### Jornada 3: Rolagem Vertical sem Conflito com Swipe
- **Dado** que o músico desliza verticalmente para ler a letra da música.
- **Quando** o movimento vertical for predominante (`Math.abs(deltaY) > Math.abs(deltaX)`).
- **Então** o sistema realiza o scroll da cifra e NÃO aciona a troca de música.

---

## 3. Critérios de Aceite (Checklist Binário para QA Lead)

- [ ] **AC1:** Clicar ou tocar na borda esquerda da tela (< 30% da largura) NÃO troca de música e apenas alterna a visibilidade dos controles.
- [ ] **AC2:** Clicar ou tocar na borda direita da tela (> 70% da largura) NÃO troca de música e apenas alterna a visibilidade dos controles.
- [ ] **AC3:** O gesto de deslizar horizontalmente para a esquerda (swipe left) avança para a próxima música da playlist.
- [ ] **AC4:** O gesto de deslizar horizontalmente para a direita (swipe right) retorna para a música anterior da playlist.
- [ ] **AC5:** O scroll vertical (arrastar para cima/baixo) não aciona troca de música acidental.
- [ ] **AC6:** Os botões de navegação no `TheaterControls` continuam funcionando normalmente para avançar e voltar músicas.
- [ ] **AC7:** Quando o Modo Trava (`isLocked`) estiver ativo, swipes e toques não navegam para outra música acidentalmente.
- [ ] **AC8:** Acessibilidade via teclado: pressionar `ArrowRight` avança de música, `ArrowLeft` volta de música (quando em playlist).

---

## 4. Classificação de Impacto

- **Nível Consolidado:** **I1 — Padrão**
- **Sinais Observados:** Refatoração de usabilidade e eventos no componente de tela `TheaterModePage.tsx`. Não há alterações de banco de dados, DTOs de API nem segurança.
- **Contornos Afetados:** Interface do Modo Teatro (`TheaterModePage.tsx`).
- **Gates Exigidos:** Testes unitários com Vitest/Testing Library com cobertura ≥ 90% no diff, validação E2E com Playwright e checagens estáticas (TypeScript/ESLint).
- **Decisão do CPO:** Aprovado para implementação prioritária.
