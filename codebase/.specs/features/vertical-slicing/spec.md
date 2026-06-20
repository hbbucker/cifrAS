# Especificação: Refatoração de God Services para Fatiamento Vertical (Strict Use Cases)

## Visão Geral
Esta especificação define o esforço de re-arquitetura da camada de Aplicação e REST do backend cifrAS. O objetivo é eliminar o "God Service Anti-pattern" (onde uma única classe agrupa inúmeras operações independentes de um agregado) e substituí-lo por "Strict Use Cases" (uma classe por operação) e "Vertical Sliced Resources" (um controller por sub-rota explícita).

## Requisitos
| ID | Descrição |
|---|---|
| REQ-01 | **Fatiamento de Resources:** Nenhum `Resource` deve agrupar endpoints de sub-entidades distintas. URIs como `/groups/{id}/members` e `/groups/{id}/playlists` devem ter seus próprios `Resources` correspondentes (`GroupMemberResource` e `GroupPlaylistResource`). |
| REQ-02 | **Fim dos Serviços Genéricos:** Classes como `GroupService`, `SongService` e `PlaylistService` devem ser inteiramente removidas do projeto. |
| REQ-03 | **Padrão Strict Use Case:** A camada de aplicação deve conter apenas classes de Caso de Uso isoladas, ex: `CreateGroupUseCase`, `AddGroupMemberUseCase`. Cada classe deve expor apenas um método primário público (geralmente nomeado `execute`). |
| REQ-04 | **Injeção Direta:** O `Resource` deve injetar diretamente e exclusivamente os `UseCases` exigidos pelas rotas que atende. É proibido criar abstrações como *Factories* ou *Facades* para tentar agrupar as injeções e ocultá-las do Controller. |
| REQ-05 | **Regressão Zero:** Nenhuma lógica de negócio, política de autorização ou comportamento de domínio pode ser alterada. O fatiamento é estritamente estrutural. Os testes de integração atuais devem continuar passando. |

## Limitações e Escopo
- **Fora do escopo:** Modificação do comportamento interno dos métodos de domínio (como `Playlist` ou `Group`). Isso já foi concluído na refatoração para Rich Domain Model.
- **Fora do escopo:** Alteração de rotas ou payloads (DTOs) da API REST pública. A API deve permanecer idêntica para os clientes (Frontend / Mobile).

## Critérios de Sucesso
- A suíte de testes `mvn test` deve apresentar 100% de aprovação (exit code 0).
- Nenhuma classe com o sufixo `Service` na camada `br.com.cifras.*.application.usecase` deve existir (exceto se sua natureza for transdisciplinar, o que não é o caso dos aggregates principais).
