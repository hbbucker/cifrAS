# Spec: Gerenciamento de Membros e Convites em Grupos (`group-members-management`)

---

## 1. Visão Geral e Intenção de Produto (Feature Discovery)

### 1.1 Contexto e Problema
Atualmente, a plataforma CifrAS permite a criação de grupos e vinculação de playlists colaborativas, além de um fluxo básico de convite por e-mail no card do grupo. No entanto:
1. **Falta de Visibilidade:** O usuário não consegue visualizar quem são os membros ativos do grupo, seus papéis (Owner, Admin, Member) nem a quantidade real de participantes (`memberCount` é mockado como 1 no frontend).
2. **Falta de Gestão de Convites por Grupo:** O administrador do grupo não tem clareza de quais convites enviados ainda estão pendentes de aceite ou foram recusados especificamente para aquele grupo.
3. **Ausência de Controles de Membros:** O proprietário/administrador não tem uma interface dedicada para gerenciar os participantes (remover membros que saíram da banda/ministério, reenviar ou cancelar convites pendentes).

### 1.2 Objetivo e Valor para o Usuário
- Proporcionar aos líderes de banda, ministérios e grupos musicais **total controle e transparência** sobre os participantes dos seus grupos de repertório.
- Exibir a listagem completa de membros ativos com avatares/iniciais, nomes, e-mails e papéis.
- Permitir o acompanhamento do status de convites enviados (Aceito, Pendente, Recusado) diretamente no contexto do grupo.
- Permitir adição ágil de novos membros (via e-mail) e remoção segura de membros com confirmação.

---

## 2. Regras de Negócio e Permissões

### 2.1 Papéis e Permissões (RBAC)
- **OWNER (Criador do Grupo):**
  - Permissão total: convidar membros, remover membros, promover/rebaixar papéis (futuro), excluir grupo e vincular playlists.
  - Não pode ser removido por outros membros. Caso queira sair, deve transferir a propriedade ou excluir o grupo.
- **ADMIN:**
  - Pode convidar novos membros, cancelar convites pendentes e vincular playlists.
  - Pode remover membros comuns (`MEMBER`), mas não o `OWNER` nem outros `ADMINs`.
- **MEMBER (Membro Regular):**
  - Pode visualizar a lista de membros e convites do grupo.
  - Pode acessar e colaborar nas playlists vinculadas ao grupo.
  - Pode sair voluntariamente do grupo ("Sair do Grupo"). Não pode convidar nem remover outros membros.

### 2.2 Ciclo de Vida do Membro e Convite
1. **Envio de Convite:**
   - O Owner/Admin insere o e-mail de um usuário.
   - O sistema valida se o e-mail existe no Supabase Auth. Se não existir, exibe erro claro: *"Usuário não cadastrado na plataforma"*.
   - O sistema verifica se o usuário já é membro ativo ou já possui convite pendente para este grupo.
   - Um registro de `GroupInvitation` com status `PENDING` é criado.
2. **Acompanhamento de Status:**
   - **Pendente (`PENDING`):** O convite foi enviado e aguarda resposta do destinatário.
   - **Aceito (`ACCEPTED`):** O destinatário aceitou; vira um `GroupMember` ativo e deixa de aparecer como pendente.
   - **Recusado (`DECLINED`):** O destinatário recusou o convite; o Owner/Admin visualiza esse status para poder descartar ou reenviar.
3. **Remoção de Membro:**
   - Ao remover um membro ativo, o registro em `group_members` é excluído e o usuário perde acesso imediato às playlists colaborativas privadas do grupo.

---

## 3. Descoberta de Experiência do Usuário (UX Discovery)

### 3.1 Alinhamento Estrito com o Design System CifrAS (Pinterest-inspired)
- **Cores & Superfícies:**
  - **Fundo / Canvas:** Soft Surface (`#fbfbf9`) e Cards Surface (`#f6f6f3`).
  - **Botão de Ação Primária (CTA):** Purple Primary (`#aa3bff` / `bg-[#8629cc]`), sem sombras, com cantos arredondados (`rounded-md` / `16px`).
  - **Badges e Status:**
    - Owner/Admin: Roxo translúcido (`bg-[#8629cc]/10 text-[#8629cc] font-semibold text-xs px-2.5 py-1 rounded-full`).
    - Membro: Neutro suave (`bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`).
    - Convite Pendente: Amarelo/Âmbar sutil (`bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40`).
    - Convite Recusado: Vermelho suave (`bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/40`).
- **Geometria:**
  - Botões, inputs e list items: `rounded-2xl` (16px).
  - Modais de Confirmação / Convite: `rounded-3xl` (32px) com backdrop escurecido (`bg-black/60 backdrop-blur-sm`).
  - Avatares e Chips de Filtro: `rounded-full`.
- **Tipografia & Textos:**
  - Títulos em Ink (`#000000` / dark: `#ffffff`), subtítulos e metadados em Mute (`#33332e` / text-text-mute).
  - 100% dos textos internacionalizados via `react-i18next` (`groups.members.*`, `groups.invites.*`). Proibido hardcoded strings.

### 3.2 Arquitetura de Informação & Jornadas de Uso

#### Jornada 1: Visualização no Card de Grupo (`/groups`)
- O card exibe a contagem real de membros (`X membros` / `1 membro`).
- Indicador sutil de papel do usuário logado naquele grupo.

#### Jornada 2: Detalhes do Grupo (`/groups/:id`) — Sistema de Abas Integrado
Na tela de detalhes do grupo (`GroupDetailsPage`), o conteúdo é organizado em duas abas no estilo Pinterest:
1. **Aba "Playlists":** Contém as playlists vinculadas ao grupo (fluxo atual).
2. **Aba "Membros & Convites":**
   - **Header da Seção:** Contagem de membros ativos + Botão CTA "+ Convidar Membro" (visível para Owner/Admin).
   - **Lista de Membros Ativos:**
     - Avatar com iniciais em círculo suave.
     - Nome do usuário e e-mail.
     - Badge do papel (`Proprietário`, `Admin`, `Membro`).
     - Menu contextual / Ações:
       - Para Owner/Admin: Botão de remoção ("Remover do grupo") com modal de confirmação.
       - Para o próprio usuário: "Sair do grupo".
   - **Seção de Convites do Grupo (Visível para Owner/Admin):**
     - Lista de convites pendentes (aguardando resposta) e recusados com data de envio.
     - Ações nos convites: "Cancelar convite" (se pendente) ou "Dispensar" (se recusado).

#### Jornada 3: Modal de Convite Rápido
- Input com validação em tempo real de formato de e-mail.
- Feedback de loading e mensagens de erro amigáveis (ex: "Este usuário já faz parte do grupo" ou "E-mail não cadastrado").

#### Jornada 4: Modal de Confirmação de Remoção
- Modal acessível (32px radius) prevenindo cliques acidentais: *"Tem certeza que deseja remover [Nome/Email] do grupo [Nome do Grupo]?"*

---

## 4. Requisitos Funcionais Detalhados

| ID | Requisito | Descrição |
|---|---|---|
| **REQ-MEM-01** | Contagem Real de Membros | O endpoint `GET /api/groups` e `GET /api/groups/{id}` devem retornar o número real de membros ativos (`memberCount`). |
| **REQ-MEM-02** | Listagem de Membros do Grupo | Endpoint `GET /api/groups/{id}/members` retornando a lista de membros com `userId`, `email`, `name`, `role`, `joinedAt`. |
| **REQ-MEM-03** | Listagem de Convites do Grupo | Endpoint `GET /api/groups/{id}/invitations` retornando convites pendentes e recusados do grupo para o Owner/Admin. |
| **REQ-MEM-04** | Envio de Convite por E-mail | Endpoint `POST /api/groups/{id}/members` (ou `/invites`) criando o convite para usuários registrados. |
| **REQ-MEM-05** | Cancelamento / Exclusão de Convite | Endpoint `DELETE /api/groups/{id}/invitations/{inviteId}` permitindo ao Owner/Admin cancelar convite pendente. |
| **REQ-MEM-06** | Remoção de Membro | Endpoint `DELETE /api/groups/{id}/members/{targetUserId}` com validação de permissão. |
| **REQ-MEM-07** | Saída Voluntária do Grupo | Membro pode se auto-remover (`DELETE /api/groups/{id}/members/{myUserId}`). |
| **REQ-MEM-08** | Interface de Gestão no Frontend | Implementação de abas ("Playlists" e "Membros") na `GroupDetailsPage` com componentes acessíveis e responsivos. |

---

## 5. Avaliação Técnica de Performance de Banco de Dados (Database Evaluation)

### 5.1 Prevenção do Problema N+1 na Contagem de Membros (`memberCount`)
- **Problema Potencial:** Ao chamar `GET /api/groups`, executar um `COUNT(*)` individual por grupo no repositório dispararia $N+1$ queries no PostgreSQL.
- **Solução Arquitetural:**
  - Realizar agregação em query única utilizando HQL com `LEFT JOIN`:
    ```sql
    SELECT g, COUNT(m.id) 
    FROM GroupEntity g 
    LEFT JOIN GroupMemberEntity m ON m.group = g 
    WHERE g.id IN (SELECT gm.group.id FROM GroupMemberEntity gm WHERE gm.userId = :userId)
    GROUP BY g
    ```
  - Garante complexidade $O(1)$ de ida ao banco, com tempo de execução estimado $< 15\text{ms}$.

### 5.2 Resolução de Identidades de Usuários em Lote (Batch User Resolution)
- **Problema Potencial:** O schema do sistema guarda `userId` (UUID do Supabase). Ao listar membros de um grupo (`GET /api/groups/{id}/members`), buscar e-mail/nome na tabela `auth.users` membro a membro causaria outro gargalo N+1.
- **Solução Arquitetural:**
  - Implementar método no `UserService` que executa uma única query em lote:
    ```sql
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE id IN (:userIdList)
    ```
  - O resultado é mapeado em memória no backend via Map $O(1)$, reduzindo a latência total do endpoint para $< 20\text{ms}$.

### 5.3 Estrutura de Índices Recomendada
- **Tabela `group_members`:**
  - `CONSTRAINT uk_group_member UNIQUE (group_id, user_id)` (já existente, índice B-Tree primário).
  - `CREATE INDEX idx_group_members_user_id ON group_members(user_id)` (para lookup ultra-rápido dos grupos do usuário logado).
  - `CREATE INDEX idx_group_members_group_role ON group_members(group_id, role)` (para validações de autorização de Admin/Owner).
- **Tabela `group_invitations`:**
  - `CREATE INDEX idx_group_invitations_group_status ON group_invitations(group_id, status)` (para listar convites pendentes/recusados do grupo).
  - `CREATE INDEX idx_group_invitations_email_status ON group_invitations(invitee_email, status)` (para consulta de convites pendentes do usuário).

### 5.4 Transacionalidade e Isolamento
- Mutação de membros e convites protegida por `@Transactional` do Jakarta/Quarkus com tempo de lock mínimo (sem bloqueios pessimistas), mantendo alta concorrência em horários de pico (ensaios e shows).

---

## 6. Avaliação Técnica de Performance de Tela (Frontend Performance & Core Web Vitals)

### 6.1 Core Web Vitals (LCP, INP, CLS)
- **Cumulative Layout Shift (CLS < 0.1):**
  - Proibido o uso de spinners centrais de tela cheia que causam pulos de layout ao carregar membros.
  - Implementação de **Skeleton Loaders / Shimmers** que reservam a altura exata das linhas de membro (`h-16 rounded-2xl bg-bg-elevated animate-pulse`).
- **Interaction to Next Paint (INP < 50ms):**
  - As abas "Playlists" e "Membros" alternam instantaneamente sem desmontar o shell da página.
  - Modais de convite e confirmação de remoção utilizam transições CSS aceleradas por GPU (`opacity` e `transform`), mantendo a thread principal desimpedida (60fps).

### 6.2 Lazy Fetching & Cache Local de Abas
- A requisição para buscar a lista de membros e convites só é executada quando a aba "Membros & Convites" é ativada pelo usuário.
- Se o usuário navegar apenas pelas playlists do grupo, nenhuma requisição desnecessária de membros é disparada, economizando banda e tempo de processamento mobile.

### 6.3 Otimização de Renderização & Payload
- **Isolamento de Componentes:** Cada linha de membro (`MemberRowItem`) é um componente isolado; ações em um membro (como remover) não disparam re-render das outras linhas da tabela.
- **Payload Leve:** DTOs estritos retornam apenas os atributos essenciais para a visualização (`id`, `name`, `email`, `role`, `joinedAt`), gerando payloads JSON médios menores que 2KB.

---

## 7. Critérios de Aceite Binários (Acceptance Criteria - AoC)

- [ ] **AC-01 (Member Count Dinâmico):** Ao carregar `/groups`, cada card exibe a contagem real e exata calculada pelo backend sem queries N+1 (tempo de resposta < 100ms).
- [ ] **AC-02 (List Members):** Ao acessar a aba de Membros em `/groups/:id`, a lista exibe todos os membros ativos com avatar, nome/e-mail, badge de papel e data de entrada.
- [ ] **AC-03 (List Invitations):** Para Owners/Admins, a aba de Membros exibe a seção de convites pendentes e recusados vinculados àquele grupo.
- [ ] **AC-04 (Invite Member):** O Owner/Admin consegue convidar um membro por e-mail. Se válido, aparece em estado pendente. Se inválido/inexistente, mensagem de erro amigável é exibida.
- [ ] **AC-05 (Cancel Invite):** O Owner/Admin consegue cancelar um convite pendente, removendo-o da listagem imediatamente.
- [ ] **AC-06 (Remove Member):** O Owner/Admin consegue remover um membro comum após confirmação no modal com feedback imediato.
- [ ] **AC-07 (Leave Group):** Um membro comum consegue clicar em "Sair do grupo", sendo redirecionado para a lista de grupos.
- [ ] **AC-08 (Permissions):** Um membro comum (`MEMBER`) não visualiza opções de convidar, cancelar convites ou remover outros participantes.
- [ ] **AC-09 (Performance & UX):** Troca de abas ocorre em < 50ms, carregamento inicial com Skeleton Loaders e sem layout shift perceptível (CLS < 0.1).
- [ ] **AC-10 (i18n):** 100% das strings da interface utilizam chaves de tradução (`pt-BR`, `en`, `es`).

---

## 8. Classificação de Impacto e Testes (Governance Gate)

- **Classificação de Impacto:** **Nível I2 (Feature Regular)**
  - *Sinais:* Novas rotas REST com queries otimizadas em lote, agregação de contagem, novas entidades/mappers e interface com abas e skeletons.
  - *Gates Obrigatórios:*
    - **Backend:** Testes unitários para Models/UseCases + Testes de integração JAX-RS com Testcontainers (≥ 90% cobertura no diff).
    - **Frontend:** Testes unitários de componentes e hooks com Vitest + Testing Library (≥ 90% cobertura no diff).
    - **E2E:** Cenário funcional Playwright cobrindo o fluxo completo de gestão de membros e alternância de abas.
