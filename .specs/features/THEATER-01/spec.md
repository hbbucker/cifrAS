# THEATER-01 Specification: Estado de sessão do Modo Teatro no backend

## Problem Statement
Músicos utilizando o aplicativo em apresentações ao vivo ou ensaios (Modo Teatro) perdem as configurações da sessão (música atual, tom, velocidade de rolagem e tamanho da fonte) caso a página seja recarregada ou fechada. A necessidade é uma funcionalidade de "recuperação de desastre" que persista este estado, além de manter essas preferências armazenadas para sessões futuras.

## Goals
- [ ] Persistir o estado atual da sessão do Modo Teatro (música atual, tom, velocidade da rolagem e tamanho da fonte) no backend.
- [ ] Recuperar automaticamente o estado da última sessão ao entrar novamente no Modo Teatro ou recarregar a aba.
- [ ] Garantir que o estado fica salvo permanentemente para uso futuro nas preferências do usuário.

## Out of Scope
- Sincronização em tempo real (WebSockets) entre dispositivos. O funcionamento deve ser através de API REST sob demanda (ou em tempos periódicos).
- Sincronização entre múltiplos membros do mesmo grupo (a sessão é atrelada às preferências do usuário logado).

## User Stories

### P1: Recuperação de Desastre e Persistência de Estado ⭐ MVP
**User Story**: Como músico, eu quero que o aplicativo salve automaticamente o estado do Modo Teatro para que eu possa recuperar o que eu estava tocando se a página recarregar acidentalmente.
**Why P1**: Previne a perda de dados durante apresentações, que é uma falha crítica.

**Acceptance Criteria**:
1. WHEN o usuário altera a velocidade da rolagem, altera o tom, altera o tamanho da fonte ou muda de música no Modo Teatro THEN o sistema SHALL gravar estas informações no backend (via REST).
2. WHEN o usuário entra no Modo Teatro ou recarrega a página THEN o sistema SHALL consultar a API e aplicar o último estado recuperado.
3. WHEN o usuário acessa o Modo Teatro semanas depois THEN o sistema SHALL carregar suas últimas configurações salvas (por exemplo, tom escolhido).

**Independent Test**:
Acessar Modo Teatro de uma música, alterar o tom e a velocidade, recarregar a página (F5). A mesma música, com a mesma velocidade e o mesmo tom, deve estar selecionada.

## Edge Cases
- WHEN o usuário desloga ou a sessão expira, THEN a chamada REST falha de forma graciosa sem interromper a execução local.
- WHEN a música salva na sessão for deletada do banco, THEN a API deve ignorar o estado e carregar a configuração inicial.

## Requirement Traceability
| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| THEATER-01     | P1: Recuperação e Persistência | Design | Pending |

## Success Criteria
- [ ] O backend fornece os endpoints REST adequados para persistir e consultar o estado de sessão de teatro.
- [ ] Cobertura de código para os novos endpoints >= 95%.
- [ ] 100% de sucesso nos linters, testes unitários e de integração (Playwright/Backend).
