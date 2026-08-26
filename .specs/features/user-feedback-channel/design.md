# Design: Canal de Feedback do Usuário

## Arquitetura (CTO)

### Modelo de Dados e Banco de Dados (Supabase/PostgreSQL)
Nova entidade/tabela: `FeedbackEntity`
- `id`: UUID (PK)
- `user_id`: UUID (FK para users, caso exista, ou apenas o subject do JWT)
- `message`: Text (Conteúdo do feedback enviado pelo usuário)
- `status`: Enum ou String ('PENDING', 'REPLIED')
- `admin_reply`: Text (Resposta do administrador, nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Endpoints REST (Quarkus JAX-RS)

**No App Principal (`codebase/`):**
- `POST /api/feedbacks`
  - Auth: Requer JWT válido.
  - Body: `{ "message": "string" }`
  - Response: `201 Created`

**No Painel Administrativo (`codebase-admin/`):**
- `GET /api/feedbacks`
  - Auth: Requer JWT com role/permissão de ADMIN.
  - Response: Lista paginada ou completa de feedbacks, ordenados por `created_at` DESC.
- `PUT /api/feedbacks/{id}/reply`
  - Auth: Requer permissão de ADMIN.
  - Body: `{ "replyMessage": "string" }`
  - Ação: Atualiza o status para 'REPLIED', salva a resposta e, de forma assíncrona, engatilha o envio de e-mail ao usuário (caso exista integração de e-mail).

---

## Experiência do Usuário e UI (CPO / Frontend Staff)

### App do Usuário (`codebase/src/main/webui`)
- **Ponto de Entrada**: Um item "Enviar Feedback" no menu de perfil do usuário (Sidebar/Bottom Nav).
- **Interface**: Modal ou página simples (`FeedbackModal` ou `FeedbackPage`) contendo:
  - Título: "Envie seu Feedback"
  - Descrição instrucional: "Nos diga o que está achando ou reporte algum problema."
  - Componente: `<Textarea>` grande (Tailwind).
  - Componente: `<Button variant="primary">Enviar</Button>`.
- **Comportamento pós-submissão**: 
  - Modal é fechado.
  - Exibe um Toast de sucesso: "Recebemos seu feedback! Obrigado por nos ajudar a melhorar o CifrAS."
  - O campo de texto é resetado para futuras utilizações.
  - Não há página de "Meus Feedbacks".

### Painel Administrativo (`codebase-admin/src/main/webui`)
- **Ponto de Entrada**: Nova aba lateral "Feedbacks" na rota principal de navegação.
- **Interface**: Uma tabela de dados exibindo os feedbacks.
  - Colunas: Data, Usuário (ID/Email), Status (Pendente/Respondido), Mensagem (truncada).
- **Ações**: 
  - Ao clicar na linha de um feedback pendente, abre um painel lateral ou modal.
  - Exibe o texto completo do feedback.
  - Fornece um `Textarea` para a resposta do administrador e um botão "Responder".
  - Após responder, o status muda visualmente na tabela e a resposta passa a ser apenas leitura.
