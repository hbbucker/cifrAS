# CifrAS — Coding Conventions

## Backend (Java / Quarkus)

1. **Test-Driven Development (TDD):** Prefira escrever os testes antes da implementação. Mantenha alta cobertura de testes nas regras de negócio principais (como o motor de transposição).
2. **Panache Entity/Repository:** Usamos o padrão Repository do Panache (`PanacheRepository`) em vez do Active Record para manter a camada de serviço desacoplada e facilitar a injeção de dependências.
3. **DTOs:** Nunca retorne Entidades Panache diretamente via JAX-RS para evitar vazamento de dados, problemas de lazy loading e acoplamento. Use classes DTO (Data Transfer Objects) simples com campos públicos ou geradas via Records do Java 14+.
4. **Respostas da API:**
    - Sucesso na criação: `201 Created` e retorne a URL do recurso criado no Header `Location`.
    - Deleção com soft-delete: `204 No Content`.
    - Falha de validação/negócio: `400 Bad Request` com mensagens descritivas tratadas pelo `GlobalExceptionMapper`.
    - Falha de autorização: `401 Unauthorized` ou `403 Forbidden`.
5. **Autenticação:** Recupere o usuário autenticado via `SecurityIdentity` do Quarkus. Use a claim `"sub"` do JWT como a referência única do usuário na tabela de relação (em vez de um ID interno numérico gerado pelo banco de dados).

## Frontend (React)

1. **Tipagem:** TypeScript rigoroso sem `any`. As interfaces de retorno da API devem ser definidas em `src/types/`.
2. **Estrutura de Funcionalidades (Feature-Sliced Design simplificado):**
    - Agrupe componentes, páginas e utilitários específicos de uma área de negócio em pastas dentro de `src/features/` (ex: `src/features/groups`, `src/features/songs`).
    - Componentes genéricos de UI (botões, modais abstratos) vivem em `src/components/`.
3. **Estilização:** Use TailwindCSS estritamente. Evite CSS customizado a menos que seja para algo muito complexo como animações avançadas ou rolagem que não pode ser feita via utilitários do Tailwind.
4. **Chamadas de API:** Centralize em arquivos de serviço usando instâncias do `axios` configuradas com interceptors para o token de autenticação (ex: `api/songs.ts`).
5. **Avisos de Lint:** A pipeline CI do GitHub Actions vai falhar em warnings de ESLint (como variáveis não usadas e dependências omitidas de hooks). Corrija-os proativamente.

## Transposição de Cifras (Regra Chave)

O JSON da cifra deve conter `sections` e `lines`. Uma `line` pode ser de texto limpo ou uma linha contendo acordes intercalados com espaços. O motor de transposição no backend (`TranspositionService`) deve iterar sobre essas linhas sem quebrar o layout/espaçamento entre as palavras/acordes originais.
