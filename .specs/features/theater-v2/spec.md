# Theater Mode v2 (Persistent Sessions) Specification

## Problem Statement

Durante uma apresentação ao vivo, a estabilidade e a continuidade são críticas. Atualmente, o Modo Teatro é stateless (não mantém estado no backend). Se o tablet do músico perder bateria, fechar a aba acidentalmente ou perder a conexão, ele não consegue pegar um dispositivo secundário (como o celular) e continuar de onde parou. Além disso, a navegação em tela cheia na correria de um show requer controles maiores, mais intuitivos (gestos) e proteção contra toques acidentais na tela.

## Goals

- [ ] Permitir a recuperação imediata do estado da apresentação (música atual, posição da playlist e posição do scroll) em qualquer dispositivo autenticado.
- [ ] Reduzir interrupções acidentais durante a música através de uma "Trava de Tela" (Lock Mode).
- [ ] Facilitar a navegação hands-free ou rápida com controles por gestos.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Sync multi-usuário em tempo real | Sincronizar a rolagem entre *diferentes usuários* de uma banda é complexo e foge do escopo de resiliência de um único músico. |
| Integração com pedais Bluetooth | Apesar de desejável, requer APIs nativas (Web Bluetooth) que podem atrasar o MVP da feature. Fica para o futuro. |

---

## User Stories

### P1: Persistent Performance Session ⭐ MVP

**User Story**: As a musician on stage, I want to resume my Theater Mode session exactly where I left off, even if I change devices so that I can have a backup tablet ready without losing my place in the playlist.

**Why P1**: É a fundação do Epic 4 e a principal garantia de segurança para o músico usar o app profissionalmente no palco sem medo de falhas de hardware.

**Acceptance Criteria**:

1. WHEN o usuário entra no Modo Teatro de uma playlist THEN system SHALL criar ou atualizar uma `PerformanceSession` no backend (marcando o `playlistId` e o `songIndex` inicial).
2. WHEN o usuário troca de música ou a rolagem automática avança significativamente THEN system SHALL fazer um debounced PATCH (ex: a cada 5s) para atualizar a posição atual da sessão.
3. WHEN o usuário abre o aplicativo em outro dispositivo e vai para a mesma playlist THEN system SHALL exibir um prompt "Você tem uma sessão em andamento. Deseja retomar?".
4. WHEN o usuário aceita retomar THEN system SHALL carregar o Modo Teatro diretamente na música e posição de rolagem corretas.

**Independent Test**: Iniciar uma playlist no PC, rolar até a metade da 3ª música, fechar a aba. Abrir no celular e verificar se o sistema oferece para continuar da 3ª música na posição exata.

---

### P2: Lock Mode for Live Performance

**User Story**: As a live performer, I want a "Lock Mode" to prevent accidental touches during a song so that I don't unintentionally disrupt my performance.

**Why P2**: Minimiza o risco humano em um cenário de alto estresse (show ao vivo).

**Acceptance Criteria**:

1. WHEN no Modo Teatro THEN system SHALL exibir um ícone de cadeado discreto.
2. WHEN o Lock Mode é ativado THEN system SHALL ocultar/desabilitar botões não-essenciais (como Editar, Sair, Mudar Tom).
3. WHEN o Lock Mode está ativo e o usuário toca na tela THEN system SHALL exibir um feedback visual de que a tela está travada (ex: piscar o cadeado).
4. WHEN o usuário pressiona e segura o cadeado (long press) THEN system SHALL destravar a tela.

**Independent Test**: Ativar o cadeado e tentar clicar no botão de transposição. O toque deve ser ignorado e o cadeado deve dar um feedback visual.

---

### P3: Gestural Controls & Battery Saver

**User Story**: As a musician, I want to control the theater mode with intuitive gestures and save battery so that my device survives the entire gig.

**Why P3**: São melhorias de "Quality of Life" que deixam a interface mais moderna, mas o app já funciona sem elas.

**Acceptance Criteria**:

1. WHEN o usuário faz um swipe horizontal (esquerda/direita) THEN system SHALL navegar para a próxima/anterior música da playlist.
2. WHEN o usuário faz um toque duplo (double tap) no centro da tela THEN system SHALL alternar o estado de play/pause da rolagem automática.
3. WHEN a opção "Battery Saver" for ativada THEN system SHALL desligar animações suaves e aplicar um tema de preto puro (OLED).

---

## Edge Cases

- WHEN a sessão recuperada aponta para uma música que foi deletada da playlist THEN system SHALL iniciar a apresentação a partir da primeira música válida.
- WHEN a conexão com a internet cai no meio da performance THEN system SHALL pausar os updates de sessão silenciosamente, mantendo a performance offline funcional (sem bloquear a tela).
- WHEN o debounced PATCH falhar repetidas vezes THEN system SHALL evitar sobrecarregar o log, usando uma fila de retry em background.

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| THEATER-01     | P1: Persistent Session | Specify | Pending |
| THEATER-02     | P2: Lock Mode          | Specify | Pending |
| THEATER-03     | P3: Gestures & Battery | Specify | Pending |

**Coverage:** 3 total, 0 mapped to tasks, 3 unmapped ⚠️

---

## Success Criteria

- [ ] Músicos conseguem migrar de um dispositivo para outro e retomar a sessão em menos de 5 segundos.
- [ ] A implementação do debounced PATCH da sessão não causa degradação de performance (sem engasgos no Frontend durante a rolagem).
