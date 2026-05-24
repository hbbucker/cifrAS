# CifrAS — Integrations

## Supabase (Auth & Database)

O CifrAS depende ativamente dos serviços do **Supabase**:

1. **PostgreSQL Database:** O backend Quarkus se conecta diretamente ao banco de dados relacional hospedado na nuvem pelo Supabase através de uma connection string (configurada no `application.properties` como `quarkus.datasource.jdbc.url`).
2. **Supabase Auth REST API:** O frontend reage à lógica de Login, Cadastro, Recuperação de Senha enviando requisições REST diretamente para a API do Supabase na web (a biblioteca JavaScript nativa do Supabase não foi utilizada para evitar o inchaço do bundle, optando-se por chamadas REST leves mapeadas no Axios).
3. **JWT Verification:** O backend recupera a chave pública JWK (JSON Web Key) exposta na URL configurada do projeto no Supabase (ex: `https://<PROJECT_ID>.supabase.co/rest/v1/rpc/jwks`). Com essa chave, a extensão `quarkus-smallrye-jwt` verifica offline e de forma stateless se a requisição originou de um usuário autenticado, mapeando a claim `sub` (UUID) como a principal do usuário, permitindo o fluxo seguro nas requisições da API.

*Nenhuma outra integração de terceiros (ex: serviços de streaming, processadores de pagamento) foi implementada nesta fase.*
