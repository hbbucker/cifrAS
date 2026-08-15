# Tasks: Songs Pagination & Sticky Header

## 1. Backend Tasks (Java 21, Quarkus, Panache)
- **Task 1.1:** Atualizar a assinatura do método no `SongService` e Repositório (`PanacheRepository`) para suportar paginação (`page` e `size`) além do termo de busca (`search`).
- **Task 1.2:** Criar um DTO de resposta paginada genérico ou específico (ex: `PaginatedResponse<SongDTO>`) que contenha a lista de `items` (List) e o `totalCount` (Long).
- **Task 1.3:** Atualizar o endpoint `GET /api/songs` no `SongResource` para extrair os query parameters `page` e `size` (tamanho fixo em 20 ou configurável via parâmetro com default 20) e retornar o novo formato.
- **Task 1.4:** Atualizar os testes de integração (`REST Assured`) para validar os limites de página, contagem total de itens (com e sem filtro de busca) e certificar que itens deletados (soft delete) não interferem na contagem e paginação.

## 2. Frontend Tasks (React, Vite, TailwindCSS)
- **Task 2.1:** Atualizar os tipos TypeScript (`types/` ou no arquivo de API) para contemplar o novo formato da resposta (contendo `items` e `totalCount`).
- **Task 2.2:** Adaptar o cliente Axios (`src/main/webui/src/api/...`) para enviar os query params `page` e `limit=20` ao buscar músicas.
- **Task 2.3:** Criar/Atualizar o estado da listagem de músicas para controlar a página atual. Ao digitar no campo de busca, o estado da página deve obrigatoriamente ser resetado para `1`.
- **Task 2.4:** Desenvolver o componente de UI `Pagination` seguindo o design system do CifrAS: botões flat, border-radius `16px`, sem sombras (exceto focus-visible), cor primária (`#aa3bff`) para a página ativa, e touch targets grandes (44x44px no mobile).
- **Task 2.5:** Implementar o **Sticky Header**: agrupar o campo de busca e a barra de paginação em um container com posicionamento `sticky`, `top-0`, `z-10` e fundo sólido (`bg-surface-card` ou `bg-white` com ou sem blur) para não sobrepor a rolagem.
- **Task 2.6:** Implementar comportamento de "Scroll to Top" suave na lista de músicas quando a página for alterada.
- **Task 2.7:** Atualizar/Criar testes E2E (Playwright) para validar a visibilidade do cabeçalho fixo, navegação de páginas e o total de resultados.

## 3. QA & Test Scenarios

**Testes Unitários e de Integração (Backend):**
- [ ] **Edge-case (Sem Músicas):** Validar retorno de lista vazia e `totalCount = 0` quando não houver músicas cadastradas.
- [ ] **Border-case (Página Inválida):** Validar se parâmetros de página inválidos (`page=0`, `page=-1`, `page=abc`) retornam `400 Bad Request` ou assumem valor padrão seguro (página 1).
- [ ] **Edge-case (Abuso de Size):** Validar limite máximo do parâmetro `size` (ex: impedir `size=10000` para evitar gargalos de banco/DDoS, fixando ou retornando `400`).
- [ ] **Border-case (Página Inexistente):** Validar o retorno quando a página solicitada for maior que o total de páginas (ex: tem 21 músicas, pede `page=5`). Deve retornar lista vazia e `totalCount` real.
- [ ] **Regra de Negócio (Soft Delete):** Garantir que músicas excluídas (soft delete) não incrementem o `totalCount` e não apareçam na lista paginada.
- [ ] **Integração Busca + Paginação:** Verificar se a busca textual aplica o filtro corretamente e atualiza o `totalCount` refeltindo apenas os resultados encontrados.

**Testes End-to-End (E2E) e UI (Frontend):**
- [ ] **Reset de Página na Busca:** Estar na página 3, digitar um termo na busca e confirmar que a paginação volta obrigatoriamente para a página 1 com os novos resultados.
- [ ] **Limpar Busca:** Limpar a barra de busca deve recarregar a lista geral e resetar a página para a 1.
- [ ] **Border-case (Apenas 1 Página):** Com até 20 músicas cadastradas, a paginação deve ocultar (ou desabilitar visualmente) os controles numéricos/setas, exibindo apenas o indicador de total ("Total: X músicas").
- [ ] **UX (Scroll to Top):** Fazer scroll até o fim da página, clicar para ir à próxima página, e garantir que a janela faça o scroll suave automático de volta ao topo da lista.
- [ ] **UI (Sticky Header):** Fazer scroll na tela. Validar se o header (busca + paginação) fica colado no topo, com fundo sólido/opaco, impedindo que as músicas fiquem visíveis "atrás" dos botões/textos.
- [ ] **Edge-case (Layout com Muitas Páginas):** Simular o cenário com muitas páginas (ex: 50 páginas). Validar se a interface não quebra e exibe os números com reticências (ex: `[<] [1] [2] [...] [50] [>]`).
- [ ] **Failure Scenario (Falha de Rede na Troca de Página):** Simular offline/erro 500 ao clicar na página 2. O UI não deve avançar o estado da página local, e sim mostrar um Toast/Erro amigável ao usuário.
