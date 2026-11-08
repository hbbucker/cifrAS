# Quick Task: FEAT-THEATER-011 — Suporte a Modo Landscape no Modo Teatro e PWA

- **Tipo:** Feature / UX Enhancement
- **Impacto:** I1 — Baixo (Ajustes locais de interface React e manifesto PWA)
- **Data:** 2026-09-07
- **Status:** Concluído e Validado

---

## 1. Descrição do Problema
O aplicativo CifrAS estava com a orientação travada em retrato (`orientation: 'portrait'` no manifesto PWA do `vite.config.ts`), impedindo que músicos utilizem tablets ou celulares na horizontal (landscape) durante apresentações no Modo Teatro. Além disso, a quebra em 2 colunas do `ChordSheet` estava associada apenas ao breakpoint `md:columns-2`, não se adaptando automaticamente a dispositivos móveis posicionados em paisagem quando o modo de colunas está ativo.

---

## 2. Escopo da Solução
1. **Manifesto PWA (`vite.config.ts`):**
   - Alterado `orientation: 'portrait'` para `orientation: 'any'` no manifesto do VitePWA, permitindo rotação nativa do dispositivo para landscape.
2. **Layout de Colunas (`ChordSheet.tsx`):**
   - A visualização de 2 colunas foi atualizada para incluir a classe `landscape:columns-2` junto ao breakpoint `md:columns-2`, ativando 2 colunas automaticamente em dispositivos em orientação paisagem quando o usuário ativa o modo de colunas.
3. **Modo Teatro & Controles (`TheaterModePage.tsx`):**
   - Adicionado efeito seguro de liberação de bloqueio de orientação (`screen.orientation.unlock()`) na inicialização do Modo Teatro.
4. **Testes Automatizados (`ChordSheet.test.tsx`, `TheaterModePage.test.tsx`):**
   - Cobertura de 100% sobre as linhas alteradas, validando a presença da classe `landscape:columns-2` e a chamada de liberação da orientação.
