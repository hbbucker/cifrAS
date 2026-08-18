# Especificação Funcional — Compartilhamento de Músicas (Song Sharing) 🎵✉️

## 1. Resumo Funcional
O objetivo da funcionalidade **Song Sharing** é permitir que usuários do CifrAS compartilhem músicas do seu repertório diretamente com outros usuários cadastrados na plataforma através do e-mail. 
O destinatário recebe um convite de compartilhamento pendente em sua conta e pode optar por:
1. **Aceitar:** Uma cópia independente da música é criada no seu repertório pessoal (`songs`), preservando tom original, cifra e estrutura, permitindo que ele edite e personalize a cifra sem afetar a música do remetente.
2. **Recusar:** O convite de compartilhamento é descartado/recusado, sem impactar o repertório do destinatário nem do remetente.

---

## 2. Jornadas do Usuário (UX Flows)

### Jornada 1: Remetente compartilhando uma música
1. O usuário visualiza uma de suas músicas (seja no card na lista de músicas `SongsListPage` ou na página de detalhes da música `SongViewPage`).
2. O usuário clica na ação **"Compartilhar"** (ícone `Share2` ou botão dedicado).
3. Um modal **"Compartilhar Música"** (`ShareSongModal`) se abre, exibindo o título da música e um campo de entrada para o e-mail do destinatário.
4. O remetente digita o e-mail do destinatário e clica no botão CTA **"Enviar Cifra"** (`<Button variant="primary">`).
5. **Estados:**
   - *Loading:* Botão desabilitado com indicador de carregamento.
   - *Sucesso:* Toast informativo "Convite de compartilhamento enviado com sucesso!" e fechamento do modal.
   - *Erro (Usuário não encontrado):* Mensagem clara no modal "Nenhum usuário encontrado com este e-mail."
   - *Erro (Auto-compartilhamento):* "Você não pode compartilhar uma música com você mesmo."
   - *Erro (Convite já pendente):* "Esta música já foi compartilhada com este usuário e está pendente de resposta."

### Jornada 2: Destinatário recebendo, aceitando ou recusando o compartilhamento
1. O usuário destinatário acessa a plataforma (ou navega até a seção de Músicas / Dashboard / Notificações).
2. Na página de Músicas ou na página "Compartilhados comigo" (`SharedWithMePage` ou aba/seção dedicada em `SongsListPage`), o usuário visualiza a lista de **"Músicas Recebidas"** pendentes de aprovação.
3. Para cada música pendente, é exibido um card com:
   - Título da música e Artista.
   - Nome/e-mail de quem compartilhou ("Enviado por: [Remetente]").
   - Botão **"Aceitar"** (com estilo visual primário/positivo).
   - Botão **"Recusar"** (com estilo visual neutro/destrutivo sutil).
4. **Ao clicar em "Aceitar":**
   - Ação assíncrona com feedback imediato.
   - Uma nova música é criada e clonada no repertório pessoal do destinatário.
   - O item pendente é removido da lista de pendentes e a nova música passa a aparecer imediatamente em "Minhas Músicas" / `SongsListPage`.
   - Toast exibido: "Música adicionada ao seu repertório com sucesso!".
5. **Ao clicar em "Recusar":**
   - O convite é descartado e removido da lista de pendentes.
   - Nenhuma música é criada no repertório do destinatário.
   - Toast exibido: "Compartilhamento recusado.".

---

## 3. Requisitos de UI/UX e Design System
- **Design System Pinterest-inspired:**
  - Botões de ação principal em Purple Primary (`#aa3bff`).
  - Geometria padrão com `border-radius: 16px` (`rounded-md`) para botões e inputs; `border-radius: 32px` (`rounded-lg`) para o modal.
  - Zero sombras desnecessárias.
  - Botões de toque em mobile com mínimo de 44x44px.
- **Internacionalização (i18n):**
  - Todas as mensagens, placeholders, títulos e toasts devem ser extraídos para os arquivos de tradução (`pt-BR`, `en`, `es`).
- **Estados Visuais Obrigatórios:**
  - *Loading:* Spinner/Skeleton durante a consulta de pendentes e envio do convite.
  - *Empty State:* Mensagem amigável "Você não possui nenhuma música compartilhada pendente." quando a lista de recebidas estiver vazia.
  - *Feedback de Erro:* Toasts e mensagens acessíveis (ARIA) para falhas de validação ou de rede.

---

## 4. Regras de Negócio

1. **Autenticação Obrigatória:** Apenas usuários autenticados podem compartilhar, listar ou responder convites.
2. **Validação de Propriedade:** O remetente só pode compartilhar músicas das quais é o proprietário (`userId` da música coincide com o token JWT).
3. **Validação de Destinatário:** O e-mail informado deve pertencer a uma conta existente no sistema. Caso contrário, a API deve retornar `404 Not Found` com mensagem explicativa.
4. **Proibição de Auto-Compartilhamento:** Não é permitido compartilhar uma música com o próprio e-mail do remetente (retorno `400 Bad Request`).
5. **Prevenção de Convites Duplicados:** Se já existir um convite com status `PENDING` para a mesma música e mesmo destinatário, a API deve retornar `409 Conflict`.
6. **Mecanismo de Clonagem (Aceite):**
   - Ao aceitar o convite, o sistema deve instanciar uma nova entidade `Song` vinculada ao `userId` do destinatário.
   - Campos clonados: `title`, `artist`, `originalKey`, `lyrics` (JSON estruturado idêntico).
   - Campos resetados: `isFavorite = false`, `prefUseBb = false`, `prefUseEb = false`, `prefAutoScrollSpeed = 1`, `prefTransposeSteps = 0`, `deletedAt = null`, novo `id` UUID gerado.
   - O status do compartilhamento é atualizado para `ACCEPTED`.
7. **Mecanismo de Recusa (Decline):**
   - Ao recusar, o status do compartilhamento é atualizado para `DECLINED` e nenhuma música é instanciada.
8. **Isolamento e Independência Pós-Clonagem:**
   - Alterações posteriores feitas pelo remetente na música original não alteram a cópia do destinatário.
   - Alterações feitas pelo destinatário em sua cópia não alteram a música original do remetente.
   - A exclusão da música por qualquer uma das partes não afeta a outra.

---

## 5. Critérios de Aceite (Acceptance Criteria — AoC)

- [ ] **AC-01 (Compartilhamento Válido):** O proprietário da música consegue enviar um convite de compartilhamento informando um e-mail válido existente; o sistema persiste o convite com status `PENDING` e retorna `201 Created`.
- [ ] **AC-02 (Validação de E-mail Inexistente):** Ao tentar compartilhar com um e-mail não cadastrado, o sistema retorna `404 Not Found` e a UI exibe erro de usuário não encontrado.
- [ ] **AC-03 (Validação de Auto-compartilhamento):** Ao tentar compartilhar consigo mesmo, o sistema rejeita com `400 Bad Request` e feedback na UI.
- [ ] **AC-04 (Prevenção de Duplicidade):** Ao tentar reenviar um convite já `PENDING` para a mesma música e destinatário, o sistema retorna `409 Conflict`.
- [ ] **AC-05 (Listagem de Pendentes):** O destinatário consegue visualizar a lista de músicas compartilhadas com ele que estão em estado `PENDING`.
- [ ] **AC-06 (Aceite do Compartilhamento e Clonagem):** Ao aceitar o convite, o sistema atualiza o status para `ACCEPTED`, cria uma nova música para o destinatário com os mesmos dados de cifra/letra/tom e a música fica disponível na lista de músicas do destinatário.
- [ ] **AC-07 (Recusa do Compartilhamento):** Ao recusar o convite, o sistema atualiza o status para `DECLINED`, não cria nenhuma música nova e remove o item da lista de pendentes.
- [ ] **AC-08 (Independência das Músicas):** Edições ou deleções na música original do remetente após o aceite não afetam a cópia do destinatário, e vice-versa.

---

## 6. Classificação de Impacto (Startup OS Matrix)

- **Decisão do CPO:** Nível **I2 — Elevado**
- **Sinais Observados:**
  - Jornada multi-etapa entre dois usuários distintos.
  - Novos contratos públicos REST e novos componentes visuais no Frontend.
  - Clonagem e persistência de dados no banco relacional.
- **Contornos Afetados:** Módulo `song` (backend e frontend), `SharedWithMePage`, `SongsListPage`, navegação e i18n.
- **Gates Exigidos:**
  - Testes unitários de domínio e casos de uso (JaCoCo ≥ 90% no diff).
  - Testes de integração de endpoints REST com Testcontainers (JaCoCo ≥ 90% no diff).
  - Testes unitários de componentes Frontend (Vitest ≥ 90% no diff).
  - Cenários E2E com Playwright cobrindo os critérios de aceite (AC-01 a AC-08).
  - Parecer formal do QA Lead (`PRONTA PARA INTEGRAÇÃO`).
- **Gatilhos de Reclassificação:** Se houver necessidade de alterações na autenticação de terceiros ou transações financeiras, elevar para I3.
