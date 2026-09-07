# PARECER DE RELEASE (RELEASE CANDIDATE)

**Versão:** `v1.3.0`  
**Feature:** `SPEC-LANDSCAPE-COLUMNS-01: Divisão em Múltiplas Colunas, Expansão de Largura e Sincronização de Tipografia no Modo Teatro`  
**Data de Homologação:** 2026-09-07  
**Veredicto Final:** **APROVADO PARA PRODUÇÃO (RELEASE CANDIDATE)**  

---

## 1. Escopo & Entregas da Release

1. **Divisão em 2 Colunas no ChordSheet (`ChordSheet.tsx`):**
   - Suporte a 2 colunas no Modo Teatro (`md:columns-2 gap-8 [column-fill:balance]`).
   - Seções e estrofes protegidas com `break-inside-avoid`, mantendo acordes e versos intactos na visualização.
   - Compatibilidade total com Modo Cantor (`singerMode`), tablaturas e auto-scroll.

2. **Expansão de Tela (Full Width):**
   - Alternância fluida entre o container padrão (`max-w-4xl`) e largura total (`100%` da largura útil) no Modo Teatro.
   - Ativação automática de Full Width ao acionar o modo de 2 colunas.

3. **Controles Rápidos no Dock Lateral (`TheaterControls.tsx`):**
   - Botões com alvos de toque $\ge 44\times 44\text{px}$ para alternar colunas (1 vs 2) e largura total.
   - 100% integrado ao i18n (`pt-BR`, `en`, `es`) com ARIA labels acessíveis.

4. **Sincronização & Persistência de Tipografia (`TheaterModePage.tsx`):**
   - Persistência e recuperação robusta do tamanho da fonte (`fontSize`) no `localStorage` e sessão do Modo Teatro, mantendo a consistência independente do ponto de entrada (playlist ou música individual/edição).

---

## 2. Evidências de Validação Automatizada

- **Backend:** 226 testes passando (100% pass rate).
- **Frontend:** 49 arquivos de teste / 280 testes passando (100% pass rate).
- **ESLint:** 0 erros / 0 avisos.
- **Cobertura no Diff:** > 98% (requisito $\ge 90\%$ atendido).
- **Regressões:** Nenhuma regressão detectada.

---

## 3. Veredicto

Release `v1.3.0` homologada com sucesso e autorizada para publicação em produção no Fly.io.
