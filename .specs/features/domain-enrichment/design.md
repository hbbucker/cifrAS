# Design: Domain Enrichment Architecture

## Princípios Adotados

### 1. Value Objects como Enums
Substituímos o uso de primitivos (`String`) por `Enums` quando o conjunto de valores é limitado e conhecido.
- `Theme` e `Language` em `UserPreference`.
Isso garante a integridade dos dados logo na entrada da requisição, antes de chegar na camada de persistência.

### 2. Encapsulamento de Propriedades
Todos os modelos do domínio (dentro dos pacotes `br.com.cifras.*/model/`) terão atributos marcados como `private`.
Para leitura por parte dos mappers e infraestrutura, serão expostos getters `get...()`.

### 3. Métodos Intencionais (Tell, Don't Ask)
A camada de aplicação (Services) não deve modificar o estado lendo, calculando e inserindo valores.
Em vez disso:
- **Incorreto (Anêmico):** `group.members.add(newMember);`
- **Correto (Rico):** `group.addMember(user, role);`

A lógica de verificação se o usuário já é membro, ou limites, reside dentro do próprio `Group`.

### 4. Limpeza de Dependências de Infraestrutura
O domínio deve ser puro e agnóstico de banco de dados.
- Em `Playlist.java`, a presença de `GroupEntity` fere essa regra fortemente. Vamos substituir pela classe de domínio correspondente `Group` (ou `UUID groupId` dependendo do aggregate).

### Padronização nos Mappers
Os Mappers (atualmente construídos manualmente em classes como `GroupMapper`) passarão a consumir os métodos getters das classes de Domínio. A conversão de strings do banco para os Enums de Domínio será feita durante a montagem das entidades e modelos.
