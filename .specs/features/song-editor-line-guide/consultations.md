# Consultas Fast-Track: Linha Guia no Editor de Cifras

## 1. Parecer do CTO
- **Viabilidade Técnica**: Aprovada. O uso de fonte monoespaçada (`font-mono`) com unidade CSS `ch` garante que `1ch` corresponda exatamente à largura de 1 caractere monoespaçado na fonte aplicada ao `<textarea>`.
- **Implementação recomendada**:
  - Envolver o `<textarea>` em um container relativo (`relative`).
  - Posicionar o elemento guia com `absolute top-0 bottom-0 pointer-events-none`.
  - Usar classes responsivas Tailwind: `left-[37ch] sm:left-[40ch]` ou estilo em linha com `calc` considerando qualquer padding horizontal do textarea.
  - Como o textarea possui a mesma fonte `font-mono` e tamanho de fonte (`text-sm sm:text-base`), colocar `font-mono text-sm sm:text-base` no container da linha guia para que a unidade `ch` respeite exatamente o mesmo tamanho de caractere do textarea.
- **Veredicto Técnico**: Seguro para Fast-Track (I1).

## 2. Parecer do CPO / UX
- **Design System**: Aprovado. A linha deve ser visualmente sutil, usando `border-r border-dashed border-border-main` ou `border-mute/30`, sem sombras e com `pointer-events-none` total para que o músico continue interagindo com a cifra sem qualquer distração ou atrito.
- **Rótulo informativo**: Um pequeno indicador discreto no rodapé ou no topo da coluna (ex: "Guia: 37 / 40 caracteres") auxilia na clareza do propósito da linha guia.
- **Veredicto de Produto/UX**: Aprovado.

## 3. Parecer do QA Lead (Consulta Inicial)
- **Riscos Identificados**:
  - Desalinhamento da unidade `ch` se o container da linha guia não tiver o mesmo `font-mono` e `font-size` do textarea.
  - Bloqueio de cliques no textarea se `pointer-events-none` não for aplicado.
  - Quebra no layout responsivo em telas muito pequenas caso o scroll horizontal não seja tratado.
- **Evidências Mínimas Exigidas**:
  - Testes unitários com Vitest validando a renderização do elemento da linha guia com `data-testid="song-editor-line-guide"` e classes responsivas.
  - Verificação de cobertura >= 90% sobre o diff.
- **Veredicto de Qualidade**: Aprovado para execução Fast-Track.
