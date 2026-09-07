# Especificação: Redução da Altura de Linhas em Branco no ChordSheet

## 1. Problema e Motivação
Na renderização de cifras com o componente `ChordSheet`, as linhas vazias entre seções ou estrofes ocupavam a altura total da linha de cifra (`itemSize`), gerando espaçamento vertical excessivo entre blocos de letra/cifra.

## 2. Objetivos e Escopo
- **Altura Compacta para Linhas Vazias:** Ajustar as linhas vazias (`line.trim().length === 0`) para terem altura mínima e linha fixa de `12px`.
- **Preservação Tipográfica:** Garantir que o tamanho da fonte das linhas com conteúdo e cabeçalhos de seção continue 100% herdado e controlado pelo usuário via seletor de fonte.
- **Hierarquia Visual:** Manter a separação entre estrofes de forma limpa, compacta e legível para performances.

## 3. Critérios de Aceite (ACs)
- **AC1:** Linhas vazias no `ChordSheet` são renderizadas com `minHeight: 12px`, `height: 12px` e `lineHeight: 12px`.
- **AC2:** Linhas normais de cifras, tablaturas e letras mantêm sua altura padrão proporcional (`itemSize`).
- **AC3:** Cabeçalhos de seção (como `[Intro]`, `[Refrão]`) mantêm estilização em negrito e herdam o tamanho da fonte definido pelo usuário sem classes de fonte fixa como `text-sm`.
- **AC4:** A suíte de testes unitários do `ChordSheet` valida a nova altura compacta de 12px.
