# Parecer de Release — v1.6.0

- **Feature**: `playlist-presentation-export` (ajuste FHP-35)
- **Linear Issue**: [FHP-35](https://linear.app/fabioandhugo-projetos/issue/FHP-35)
- **Pull Request**: [#42](https://github.com/hbbucker/cifrAS/pull/42)
- **Data**: 2026-11-07
- **Versão da Release**: `v1.6.0`
- **Veredicto Final**: **APROVADO PARA INTEGRAÇÃO (RELEASE)**

---

## 1. Escopo Entregue

1. **Tipografia dos slides de letra (`presentationGenerator.ts`):**
   - Bloco de letra com fonte fixa **Arial 40pt** em todos os temas (antes 32/36pt dinâmico).
   - Tema **Litúrgico** passa de Georgia para Arial (capa, título e letra).
2. **Remoção do rodapé:** o título da música no canto inferior direito dos slides de letra foi removido. O rótulo da seção no topo foi mantido.
3. **Spec:** AC-05 de `playlist-presentation-export/spec.md` atualizado para "Arial 40pt fixa, sem rodapé".

### Correções incluídas
- **`TourContext.test.tsx`:** teste alinhado ao fallback inerte do `useTour` introduzido no FHP-34 (a `main` estava vermelha neste teste).
- **CI (`codebase/pom.xml`):** Testcontainers passa a ser gerenciado pelo BOM do Quarkus (1.20.1 → 2.0.5, artefato `testcontainers-postgresql`). A versão 1.20.1 usava Docker API 1.32, recusada pelos runners atuais do GitHub Actions (mínimo 1.40).

---

## 2. Evidências de Validação

- **Testes Frontend (Vitest):** 312/312 passando (50 arquivos), incluindo teste parametrizado (dark/light/liturgic) para Arial 40 e ausência de rodapé.
- **Testes Backend (Surefire, `./mvnw clean verify` local):** 226/226 passando, BUILD SUCCESS.
- **Typecheck / Lint:** `tsc -b` sem erros; ESLint sem erros nos arquivos alterados.
- **CI GitHub Actions (PR #42):** ver checks do PR.

## 3. Pendências conhecidas
- Validação visual manual do `.pptx` exportado (linhas longas a 40pt) não foi registrada como evidência.
