## Veredicto de integração: PRONTA PARA INTEGRAÇÃO

- **Feature:** song-editor-line-guide
- **Delivery / revisão:** feat/song-editor-line-guide / rev-1
- **Contagem anterior / ordinal candidato:** 0 / 1
- **Modo adversarial / congelamento:** false / false
- **Domínios afetados:** nenhum
- **Data:** 2026-09-07

---

### Critérios Atendidos (AC01 - AC05)
- [x] **AC01 (Exibição da linha guia vertical no editor)**: Elemento com `data-testid="song-editor-line-guide"` inserido dentro do container relativo que engloba o `<textarea>`.
- [x] **AC02 (Posicionamento Desktop >= 640px em 40ch)**: Classe Tailwind `sm:left-[40ch]` aplicada no container da linha guia, herdando `font-mono text-sm sm:text-base` idêntico ao `<textarea>`.
- [x] **AC03 (Posicionamento Mobile < 640px em 37ch)**: Classe Tailwind base `left-[37ch]` aplicada no container da linha guia.
- [x] **AC04 (Separação não bloqueante / pointer-events-none)**: Classe `pointer-events-none` aplicada no elemento guia absoluto, permitindo clique, foco e digitação livres no `<textarea>`.
- [x] **AC05 (Cobertura de testes unitários Vitest >= 90% no diff)**: Suíte dedicada validando renderização, classes de posicionamento responsivo (`left-[37ch]`, `sm:left-[40ch]`), `pointer-events-none`, estilo `border-dashed` e labels numéricos (37 e 40).
