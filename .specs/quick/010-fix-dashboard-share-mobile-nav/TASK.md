# Quick Task: FIX-UI-010 — Dashboard Share & Mobile Navigation

- **Tipo:** Bug Fix / UX Improvement
- **Impacto:** I1 — Baixo (Ajustes locais de interface React)
- **Data:** 2026-08-18
- **Status:** Concluído e Validado

---

## 1. Descrição do Problema
1. O botão "Compartilhar" no menu do card de música da `DashboardPage` não disparava ação devido à prop `onShare={() => {}}` vazia e à ausência do modal de compartilhamento.
2. A barra de navegação inferior mobile (`BottomNav`) não continha o atalho para a tela `/shared` ("Compartilhados") e não informava visualmente a chegada de novos compartilhamentos.

---

## 2. Escopo da Solução
1. **DashboardPage:** Conectar o callback `onShare` do `MusicCard` ao `ShareSongModal` com o estado `sharingSong`.
2. **BottomNav & Sidebar:** Adicionar rota `/shared` com ícone `Share2`, aplicar traduções i18n em todos os links e introduzir o hook `usePendingSharesCount` com badge de notificação de pendências.
3. **Testes Automatizados:** 
   - `DashboardPage.test.tsx`: Teste de abertura do modal ao clicar em compartilhar.
   - `Layout.test.tsx`: Teste de renderização dos 5 links de navegação mobile.
   - `usePendingSharesCount.test.ts`: Testes unitários para os estados de contagem (não-autenticado, sucesso com N itens e tratamento de erro de rede).
