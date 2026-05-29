# Music Search na Tela /songs Specification

## Problem Statement

Os usuários precisam de uma forma rápida de pesquisar músicas e artistas diretamente na tela `/songs`. A pesquisa deve ser reativa, buscar informações em tempo real no banco de dados e garantir que a interface não sofra com atrasos na digitação ou travamentos, mantendo uma usabilidade fluida e de alta performance.

## Goals

- [ ] Implementar um campo de pesquisa que filtra as músicas e artistas imediatamente após o 3º caractere.
- [ ] Garantir uma experiência de digitação sem delay, aplicando técnicas para evitar sobrescrita de estado e `race conditions`.
- [ ] Executar buscas online via `fulltext search` no banco de dados.
- [ ] Atualizar dinamicamente a lista de músicas exibida na tela `/songs`.
- [ ] Permitir limpar a pesquisa com um botão, restaurando a lista para exibir as músicas adicionadas recentemente.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Busca offline em cache local | O requisito exige expressamente que a busca seja online e `fulltext search` no banco. |
| Filtros avançados (gênero, ano, tom) | O escopo se concentra apenas na busca de texto livre por música ou artista. |
| Paginação infinita complexa | O foco atual é a performance do campo de busca e a fluidez da digitação. |

---

## User Stories

### P1: Pesquisa em Tempo Real por Música e Artista ⭐ MVP

**User Story**: Como um usuário, eu quero digitar o nome de uma música ou artista no campo de busca da tela `/songs`, para que a lista de músicas seja filtrada instantaneamente.

**Why P1**: É a funcionalidade central do requisito para permitir o filtro rápido do catálogo de músicas.

**Acceptance Criteria**:

1. WHEN o usuário digita no mínimo 3 caracteres THEN system SHALL iniciar a filtragem via busca online (fulltext search) no banco de dados.
2. WHEN o backend retorna os resultados THEN system SHALL atualizar a lista de músicas na tela `/songs` com as correspondências encontradas.
3. WHEN a busca é realizada THEN system SHALL manter o input box editável permitindo novas buscas.
4. WHEN o usuário realiza alterações rápidas no texto (digitar ou apagar) THEN system SHALL utilizar debounce e cancelamento de requisições pendentes (e.g. AbortController) para evitar atrasos na digitação ou atualização com resultados obsoletos.

**Independent Test**: Digitar "Bea" no input e verificar se uma chamada de rede é disparada após curto debounce, a UI continua respondendo a novos caracteres de forma imediata, e os resultados na lista da tela `/songs` refletem apenas a última pesquisa concluída.

---

### P2: Limpeza de Pesquisa e Estado Padrão

**User Story**: Como usuário, eu quero poder limpar minha pesquisa facilmente, para que eu possa ver a lista das músicas adicionadas recentemente novamente.

**Why P2**: Fornece uma rota de saída rápida para restaurar o estado inicial da tela sem precisar apagar manualmente caractere por caractere.

**Acceptance Criteria**:

1. WHEN há algum texto na caixa de pesquisa THEN system SHALL exibir um botão (ex: "X") no canto direito do input.
2. WHEN o usuário clica no botão de limpar THEN system SHALL esvaziar o input box.
3. WHEN o input box for esvaziado (pelo botão ou ao apagar o texto deixando com menos de 3 caracteres) THEN system SHALL restaurar a lista para exibir apenas as músicas adicionadas recentemente.

**Independent Test**: Realizar uma busca, clicar no botão de "X" no input, confirmar se o input fica vazio e se a listagem retorna ao estado de "músicas recentes".

---

## Edge Cases

- WHEN uma requisição de rede falhar ou der erro THEN system SHALL exibir um estado de erro sutil sem travar a interface de digitação.
- WHEN a busca não encontrar nenhuma música ou artista THEN system SHALL exibir um estado vazio amigável ("Nenhuma música encontrada").
- WHEN o usuário digitar e apagar muito rápido antes do debounce finalizar THEN system SHALL abortar requisições pendentes para não mostrar resultados atrasados.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story       | Phase   | Status   |
| -------------- | ----------- | ------- | -------- |
| SEARCH-01      | P1: Real-time search | Execute | Verified |
| SEARCH-02      | P2: Clear Search | Execute | Verified |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `CART-03`, `NOTIF-02`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 2 total, 2 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

How we know the feature is successful:

- [ ] Performance: O input responde sem nenhum delay percetível à digitação humana rápida.
- [ ] Usability: Não ocorrem 'pulos' ou caracteres removidos/adicionados de forma indesejada devido ao re-render provocado pela chegada dos dados da pesquisa.
- [ ] Performance: A busca `fulltext` no banco de dados entrega resultados rapidamente para a interface.
