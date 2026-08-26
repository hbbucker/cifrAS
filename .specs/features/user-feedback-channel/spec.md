# Spec: Canal de Feedback do Usuário

## Visão Geral
Esta feature introduz um canal simples de comunicação unidirecional dentro do aplicativo, permitindo que os usuários enviem feedbacks, sugestões ou reportem problemas. O objetivo é coletar insights dos usuários sem a complexidade de um sistema de chat. O usuário apenas envia o feedback e recebe uma confirmação de envio. Os administradores podem visualizar os feedbacks no painel de controle e registrar uma resposta (que pode ser enviada por e-mail ou apenas para resolução interna).

## Requisitos

| ID | Requisito | Tipo |
|---|---|---|
| REQ-01 | Usuários autenticados podem enviar um texto de feedback através da interface do aplicativo. | Funcional |
| REQ-02 | O usuário não deve ter acesso a um histórico de feedbacks no app; ele verá apenas uma mensagem de sucesso ("Feedback recebido"). | Funcional/UX |
| REQ-03 | Os feedbacks devem ser registrados no banco de dados com a identificação do usuário e data/hora. | Funcional |
| REQ-04 | O painel administrativo (Admin Dashboard) deve listar todos os feedbacks recebidos. | Funcional |
| REQ-05 | Administradores podem registrar uma resposta a um feedback no painel, marcando-o como respondido. | Funcional |
| REQ-06 | O ciclo de vida do feedback é estritamente: Aberto -> Respondido (sem tréplicas). | Funcional |
| REQ-07 | Garantir >= 90% de cobertura de testes (Unitários e de Integração) nas camadas de backend e testes E2E básicos. | Não-Funcional |
