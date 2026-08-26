# Tarefas de Implementação: Canal de Feedback do Usuário

## Backend App Principal (`codebase/`)
- [ ] **APP-DB-01**: Criar script de migração Flyway ou update schema para criar a tabela `feedbacks`.
- [ ] **APP-DOM-01**: Criar modelo de domínio puro `Feedback` em `br.com.cifras.feedback.model`.
- [ ] **APP-INF-01**: Criar entidade JPA `FeedbackEntity` e repositório `FeedbackRepository` via Panache.
- [ ] **APP-SVC-01**: Criar `FeedbackService` com caso de uso para salvar novo feedback.
- [ ] **APP-API-01**: Criar `FeedbackResource` (POST para receber o feedback).
- [ ] **APP-TST-01**: Escrever testes unitários e de integração (JaCoCo e REST Assured).

## Backend Admin (`codebase-admin/`)
- [ ] **ADM-INF-01**: Criar entidade de leitura JPA e Repositório correspondente à tabela `feedbacks` no banco compartilhado.
- [ ] **ADM-SVC-01**: Criar serviço para listagem e resposta de feedbacks.
- [ ] **ADM-API-01**: Criar `FeedbackResource` no admin (GET list e PUT reply).
- [ ] **ADM-TST-01**: Escrever testes unitários e de integração no admin (JaCoCo e REST Assured).

## Frontend App Principal (`codebase/src/main/webui`)
- [ ] **FE-API-01**: Adicionar endpoint POST no cliente Axios (`src/api/feedback.ts`).
- [ ] **FE-UI-01**: Criar o botão/link "Enviar Feedback" no menu do usuário.
- [ ] **FE-UI-02**: Desenvolver o `FeedbackModal` com form (Textarea) e gerenciar estados de loading e toast de sucesso.
- [ ] **FE-TST-01**: Escrever testes unitários (Vitest) e cenário E2E básico (Playwright) testando o envio de feedback.

## Frontend Admin (`codebase-admin/src/main/webui`)
- [ ] **FE-ADM-01**: Adicionar endpoints GET e PUT no cliente Axios do admin.
- [ ] **FE-ADM-02**: Criar rota e componente de página para listagem de feedbacks.
- [ ] **FE-ADM-03**: Implementar a tabela de feedbacks com filtro básico (Pendentes vs Respondidos).
- [ ] **FE-ADM-04**: Implementar o modal lateral no Admin para visualização completa e envio da resposta.
- [ ] **FE-ADM-TST-01**: Escrever testes unitários (Vitest) para a listagem e submissão da resposta.
