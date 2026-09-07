# THEATER-PERSISTENT-HEADER Specification: Cabeçalho Persistente e Badges de Tom no Modo Teatro

## Problem Statement
No Modo Teatro, quando o temporizador de inatividade (4 segundos) ou rolagem da tela oculta os controles de performance, o título da música e o artista também desapareciam por estarem agrupados no mesmo container de transição de opacidade. Isso desorientava o músico durante a performance e deixava a cifra sem identificação visual. Além disso, faltava uma referência explícita do tom atual e do tom original da música no topo para consulta rápida à distância sem necessidade de abrir os controles de transposição.

## Goals
- [ ] Manter o título da música e o artista sempre visíveis no topo da tela durante o Modo Teatro, mesmo quando os botões de ação e docks de controle estiverem ocultos.
- [ ] Exibir uma badge discreta no cabeçalho com o tom atual (`theater.key`: `currentKey`).
- [ ] Quando a música estiver transposta (`currentKey !== originalKey`), exibir também o tom original como referência (`theater.originalKey`: `originalKey`).
- [ ] Garantir que os botões de ação (sair, bloquear, tela cheia) e os docks flutuantes continuem desaparecendo suavemente após 4s de inatividade e reapareçam ao tocar/clicar na tela.
- [ ] Proteger o texto da cifra durante a rolagem com um gradiente/backdrop sutil no topo.
- [ ] Internacionalização completa (i18n) para rótulos em pt-BR, en e es.
- [ ] Cobertura de testes >= 90% no diff.

## Impact Classification
- **Nível Consolidado:** I1 (Fast-Track - Melhoria de UI em componente isolado sem impacto em backend/banco de dados/autenticação).

## User Stories

### P1: Cabeçalho Persistente e Identificação de Tom no Modo Teatro ⭐ MVP
**User Story**: Como músico no palco ou em ensaio, eu quero visualizar continuamente o título da música, o artista e o tom (atual e original) no topo da tela no Modo Teatro, para que eu não perca o contexto da música enquanto a tela estiver limpa e sem botões.

**Acceptance Criteria**:
1. **GIVEN** que o usuário está no Modo Teatro **WHEN** os controles forem ocultados por inatividade ou toque **THEN** o título da música, o artista e a badge de tom devem permanecer visíveis no cabeçalho.
2. **GIVEN** que a música está no tom original **WHEN** o cabeçalho for renderizado **THEN** deve exibir o tom atual.
3. **GIVEN** que a música foi transposta para um tom diferente do original **WHEN** o cabeçalho for renderizado **THEN** deve exibir o tom atual e a referência do tom original.
4. **GIVEN** que o usuário toca na tela **WHEN** os controles reaparecem **THEN** os botões de fechar, bloquear tela e tela cheia reaparecem suavemente sem deslocar o título.
5. **GIVEN** que as traduções estão ativas **WHEN** o idioma for alterado (pt-BR, en, es) **THEN** os rótulos devem ser traduzidos adequadamente.

## Traceability
| Requirement ID | Story | Classification | Status |
| --- | --- | --- | --- |
| THEATER-PERSISTENT-HEADER | P1: Identificação Persistente de Música e Tom | I1 | In Progress |
