# Project State & Memory

## Architecture Decision Records (ADRs)

### ADR 001: Vertical Slicing & Strict Use Cases
- **Data:** 30 de Maio de 2026
- **Contexto:** Os serviços (`GroupService`, `SongService`, etc) e os Resources (Controllers REST) estavam se tornando "God Classes" difíceis de manter, ferindo o Princípio da Responsabilidade Única (SRP) e acoplando injeções desnecessárias. Houve a tentação de se utilizar o padrão Facade/Factory para esconder o problema no Controller, mas foi rejeitado.
- **Decisão:** Optou-se pelo Fatiamento Vertical (Vertical Slicing) e Casos de Uso Estritos (Strict Use Cases).
- **Regras Práticas:**
  1. A camada Application terá apenas Use Cases (ex: `AddGroupMemberUseCase`), com apenas 1 responsabilidade cada. Fica terminantemente proibido o uso de `*Service` genéricos que agrupam operações de um agregado.
  2. A camada REST (`Resource`) deve fatiar o agrupamento de URI. `/groups` fica no `GroupResource`, mas `/groups/{id}/members` vai para seu próprio `GroupMemberResource`.
  3. Não é permitido criar "Application Facades" ou "Factories" inúteis apenas para ocultar Use Cases do Controller.
- **Status:** Aprovado e pendente de implementação faseada (iniciando por `Group`).

## Bloqueadores Atuais
Nenhum.

## Próximos Passos (To-Dos)
- Refatorar o módulo `Group` (Fatiamento).
- Refatorar o módulo `Playlist` (Fatiamento).
- Refatorar o módulo `Song` (Fatiamento).
- Refatorar o módulo `User` e `UserPreference` (Fatiamento e Rich Domain).
