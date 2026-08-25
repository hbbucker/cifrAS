# CifrAS — Coding Conventions

## Backend (Java / Quarkus)

1. **Test-Driven Development (TDD):** Prefira escrever os testes antes da implementação. Mantenha alta cobertura de testes nas regras de negócio principais (como o motor de transposição).
2. **Domain-Driven Design (DDD):** A lógica de negócio deve operar unicamente em cima de Modelos de Domínio (`POJOs` puros), que são independentes do banco de dados e frameworks.
3. **Camada de Infraestrutura e Persistência:** Usamos o padrão Repository (via `PanacheRepository`) para abstrair o acesso a dados. O repositório utiliza `Mappers` para converter os Modelos de Domínio em Entidades JPA e vice-versa, blindando a camada de serviço de dependências de infraestrutura.
4. **DTOs e REST:** Controladores JAX-RS (`Resources`) nunca expõem Entidades ou Modelos de Domínio diretamente. Use classes DTO (Data Transfer Objects) record-based ou classes simples. O fluxo é: `Resource` recebe DTO -> Chama `Service` -> Service manipula `Model` -> `Resource` retorna DTO.
5. **Respostas da API:**
    - Sucesso na criação: `201 Created` e retorne o ID do recurso (preferencialmente sem body completo ou de forma padronizada).
    - Deleção com soft-delete: `204 No Content`.
    - Falha de validação/negócio: `400 Bad Request` com mensagens tratadas pelo `GlobalExceptionMapper`.
    - Falha de autorização: `401 Unauthorized` ou `403 Forbidden`.
6. **Autenticação:** Recupere o usuário autenticado via `SecurityIdentity` do Quarkus. Use a claim `"sub"` do JWT como referência unívoca.
7. **Compilação Nativa (GraalVM & Jackson Reflection):** Todas as classes DTO, records e modelos que trafegam em endpoints JAX-RS / JSON devem ser marcadas com `@RegisterForReflection` ou incluídas em `NativeReflectionConfig`. A omissão causa falhas de serialização no executável nativo.
8. **Consultas a Banco & Nomenclatura de Colunas:** Dê prioridade a consultas HQL/JPQL sobre as entidades (`SongEntity`, `AdminSongEntity`). Se for estritamente necessário usar SQL nativo (`em.createNativeQuery`), atente-se aos nomes de colunas no PostgreSQL (atributos sem `@Column(name=...)` usam nomes contínuos em minúsculo, como `deletedat`, `originalkey`, `userid`).

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
