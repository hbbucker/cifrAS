# Especificação: Suporte a Diminutas, Extensões (9, 11) e Sequências entre Parênteses

## 1. Problema e Motivação
Usuários relataram que:
1. Notas com símbolos de diminuta (`º`, `°`, `ø`, `dim`), extensões numéricas (`9`, `11`, `13`, `6/9`, `7/9`, `7(9)`, etc.) estavam sendo desconsideradas/removidas na visualização de cifras e na persistência estruturada.
2. Cifras em sequências entre parênteses como `(C F G)` ou acordes parentesados `(C9)`, `(Am7)` não eram reconhecidos como linhas de cifra, quebrando a colorização e o **Modo Cantor** (que exibia cifras parentesadas como se fossem letras).
3. Na transposição de tonalidade, acordes entre parênteses ou com símbolos especiais não eram transpostos ou eram perdidos no parser.

## 2. Objetivos e Escopo
- **Reconhecimento Unificado:** Atualizar e unificar o reconhecimento de acordes no frontend (`chordTransposer.ts`, `ChordSheet.tsx`, `lyricsParser.ts`, `presentationGenerator.ts`) e no backend (`MusicalKey.java`, `TranspositionService.java`, `CifraClubParser.java`).
- **Diminutas & Extensões:** Suportar `º`, `°`, `ø`, `Ø`, `dim`, `dim7`, `m7(b5)`, `m7b5`, `9`, `11`, `13`, `6/9`, `7/9`, `7(9)`, `7(b9)`, `7(#9)`, `7M(9)`, `7(9/11)`, etc.
- **Sequências e Parênteses:** Suportar tokens com parênteses abertos/fechados como `(C`, `G)`, `(C)`, `(C F G)`, `[C]`, preservando pontuação externa na transposição.
- **Modo Cantor & Apresentação:** Garantir que todas as linhas de acordes (incluindo sequências entre parênteses) sejam filtradas no Modo Cantor e no gerador de slides/apresentação.
- **Transposição:** Preservar pontuações externas ao transpor notas raízes e baixos, sem transpor números de extensões em barras (ex: `C6/9` -> `D6/9`).

## 3. Critérios de Aceite (ACs)
- **AC1:** Linhas contendo `(C F G)`, `(C  F  G) (2x)` ou `(Am7 D7 G7M)` são reconhecidas como linhas de cifra no `ChordSheet`, `lyricsParser` e `presentationGenerator`.
- **AC2:** No Modo Cantor (`singerMode=true`), linhas contendo `(C F G)` ou acordes com `º`, `°`, `ø`, `9`, `11` são completamente ocultadas da tela do cantor.
- **AC3:** No Modo Normal, acordes `(C`, `F`, `G)`, `Cº`, `C°`, `Cø`, `C9`, `C11`, `C6/9`, `C7/9`, `C7(9/11)` são estilizados com a cor de destaque de cifras e espaçamento preservado.
- **AC4:** Ao transpor a música no frontend (`transposeContent` / `transposeChord`) e no backend (`TranspositionService`), acordes como `(C F G)` transpostos em +2 semitones tornam-se `(D G A)`.
- **AC5:** Acordes com símbolos de diminuta (`Cº`, `C°`, `Cø`, `Cdim`, `C#º`) e extensões (`C9`, `C11`, `C13`, `C6/9`, `C7/9`, `C7(9)`, `C#m7(b5)`) são corretamente transpostos preservando o sufixo exato.
- **AC6:** O parser de letras (`parseContentToLyrics`) não descarta tokens de cifras ou sequências parentesadas, preservando a integridade da música ao salvar e carregar.
