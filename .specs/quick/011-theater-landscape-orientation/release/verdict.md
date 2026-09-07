# Parecer de Release: FEAT-THEATER-011 (v1.4.0)

- **Feature:** Suporte a Orientação Landscape, Quebra Manual de Colunas `[coluna]`, CoachMarks Guiados e Refinamento do Editor
- **Data:** 2026-09-07
- **Versão:** `v1.4.0`
- **Veredicto:** ✅ CANDIDATO A RELEASE APROVADO & INTEGRADO

---

## 1. Escopo Entregue

1. **📱 Rotação Landscape & Manifesto PWA:**
   - Desbloqueio da orientação fixa no manifesto PWA (`orientation: "any"`) no `vite.config.ts`, permitindo livre rotação no app instalado.
   - Desbloqueio seguro de orientação no ciclo de montagem do Modo Teatro (`screen.orientation.unlock()`).
   - Ativação automática de 2 colunas em dispositivos móveis posicionados em paisagem (`landscape:columns-2`).

2. **🎼 Marcador Explícito de Quebra de Coluna (`[coluna]`):**
   - Suporte ao marcador de quebra manual de coluna com múltiplas variações (`[coluna]`, `[COLUNA]`, `[quebra-coluna]`, `---coluna---`, etc.).
   - Supressão e invisibilidade absoluta do marcador durante a execução no Modo Teatro e na visualização da cifra.
   - Balanceamento automático inteligente por seções quando o marcador manual não estiver presente na cifra.

3. **🎸 Tela de Edição de Cifras (`SongFormPage`):**
   - Inclusão do botão de atalho rápido `[Coluna]` na barra de ferramentas superior para inserção atômica do marcador.
   - Remoção do botão redundante `Quebra` para simplificar e despoluir a barra de atalhos.

4. **💡 Experiência Guiada (CoachMarks / Tour) & Internacionalização:**
   - Integração do `CoachMark` contextual para instruir novos usuários sobre o botão `[Coluna]` no editor e o botão de `2 Colunas` no Modo Teatro.
   - Suporte completo multi-idioma (Português, Inglês e Espanhol).

---

## 2. Evidências de Validação e Qualidade

- **Testes Backend:** 226 testes passando 100% (Quarkus / JaCoCo / Panache).
- **Testes Frontend:** 290 testes passando 100% (Vitest / React Testing Library).
- **Linter:** 0 erros no ESLint.
- **Pipeline CI:** Pull Request #39 aprovado em todas as etapas de verificação e checagem.
- **Deploy:** Homologado e publicado com sucesso no Fly.io.
