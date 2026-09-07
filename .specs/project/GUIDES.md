# Guias de Desenvolvimento & Fluxo Operacional (CifrAS)

Este documento centraliza as diretrizes operacionais de ciclo de vida do código, branches, testes e o procedimento padrão de encerramento de releases no CifrAS.

---

## 1. Ciclo de Vida do Código e Branches

1. **Branching & Worktrees:**
   - Para qualquer nova alteração (feature, fix, chore), crie uma branch específica a partir de `main` e utilize uma worktree dedicada para isolamento.
   - Padrão de nomenclatura: `feat/<nome-da-feature>`, `fix/<nome-do-bug>`, `chore/<nome-da-tarefa>`.
2. **Qualidade & Testes Antes do PR:**
   - Antes de abrir PR, garanta que todos os testes da camada alterada passem com $\ge 90\%$ de cobertura no diff:
     - Backend: `./mvnw test` ou `./mvnw verify`
     - Frontend: `npm test` e `npm run lint` (dentro de `codebase/src/main/webui/`)
3. **Abertura de PR:**
   - Abra o PR com descrição clara das alterações: `gh pr create --base main --head <branch> --title "..." --body "..."`.

---

## 2. Procedimento Padrão para Encerramento de Release ("fechar release")

Quando o usuário autorizar explicitamente e comandar **"fechar release"** (ou "fechar release e subir deploy em prod"), todo agente deve executar rigorosamente o seguinte ciclo padronizado na ordem:

```text
[Merge PR] ──► [Veredicto & STATE.md] ──► [Commit/Push main] ──► [Git Tag Semântica] ──► [GitHub Release] ──► [Deploy Fly.io] ──► [Limpeza Worktrees]
```

### Passo a Passo Detalhado:

1. **Merge do Pull Request:**
   ```bash
   gh pr merge <PR_NUM> --squash --delete-branch
   ```
2. **Registro do Parecer de Release:**
   - Criar arquivo `.specs/features/<feature>/release/verdict.md` documentando:
     - Escopo da entrega
     - Evidências de validação (testes, linter, builds)
     - Veredicto de integração
3. **Atualização do Estado do Projeto:**
   - Adicionar o registro do item finalizado em `.specs/project/STATE.md` (e `ROADMAP.md` quando aplicável).
4. **Commit e Sincronização na Branch Principal:**
   ```bash
   git add .specs/ && git commit -m "docs(release): atualizar estado do projeto e encerrar release vX.Y.Z" && git push origin main
   ```
5. **Versionamento e Git Tag Semântica:**
   - Criar tag semântica anotada (`vX.Y.Z`) e enviá-la para o repositório:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z - <Título da Release>" && git push origin vX.Y.Z
   ```
6. **Publicação da Release Oficial no GitHub:**
   - Publicar a release com título e notas detalhadas das novidades entregues:
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z - <Título da Release>" --notes "<Notas da Release>"
   ```
7. **Deploy em Produção (se solicitado):**
   - Executar o deploy na raiz do projeto:
   ```bash
   fly deploy --local-only --verbose
   ```
8. **Limpeza de Worktrees:**
   - Remover a worktree local temporária utilizada durante o desenvolvimento:
   ```bash
   git worktree remove <caminho_worktree>
   ```

---

## 3. Matriz de Versionamento Semântico (SemVer)

- **Patch (`vX.Y.Z + 1`):** Correções de bugs, pequenas melhorias de UI/UX, ajustes de CSS, espaçamento, correções de tipagem.
- **Minor (`vX.Y + 1.0`):** Novas funcionalidades retrocompatíveis (novos tours, novos módulos, novas integrações, filtros).
- **Major (`vX + 1.0.0`):** Mudanças disruptivas ou quebras estruturais de contratos/APIs.
