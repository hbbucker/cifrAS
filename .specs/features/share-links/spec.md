# Especificação: Links de Compartilhamento (Share Links)

## 1. Escopo e Objetivo
Substituir o atual fluxo de compartilhamento baseado em e-mail por links de compartilhamento. O objetivo é reduzir o atrito: o anfitrião não precisa saber o e-mail do convidado, e o convidado não precisa ter um cadastro prévio para acessar a página de convite (sendo incentivado a se cadastrar/logar para aceitar).

## 2. Regras e Jornadas
- **Anfitrião**: Ao invés de inserir e-mail, clica em "Gerar Link de Compartilhamento". Um link com token único é gerado e copiado.
- **Validade**: O link expira em 5 dias.
- **Convidado**: Acessa o link. Há duas visões (Música vs Grupo) e dois estados (Logado vs Não Logado):
  - **Música (Não Logado)**: Exibe convite amigável de quem compartilhou e pede cadastro/login.
  - **Música (Logado)**: Exibe botão para salvar a cifra no repertório.
  - **Grupo (Não Logado)**: Exibe convite para participar do grupo e pede cadastro/login.
  - **Grupo (Logado)**: Exibe botão para participar do grupo e ver os membros.

## 3. Critérios Binários de Aceite
1. [x] A UI exibe botão para gerar link em vez de campo de e-mail ao compartilhar música ou grupo.
2. [x] O backend expõe um endpoint para criar links com 5 dias de validade.
3. [x] A UI de destino (`/invite/:token`) renderiza corretamente dependendo se é Música ou Grupo.
4. [x] O fluxo de login via OAuth preserva o token de convite e o processa ao retornar.
5. [x] O backend expõe um endpoint para consultar os detalhes de um link (público) e outro para aceitar (protegido).

## 4. Contornos e Gates
- **Nível de Impacto (Produto)**: I2 (Alteração na jornada principal de colaboração e onboarding).
- **Gatilhos de Reclassificação**: Se houver mudança nos requisitos de segurança (ex: limitação de views por link), reavaliar.
- **Gates**: Exige testes E2E para o fluxo completo do link (Criação -> Visualização deslogada -> Login -> Aceite).

## 5. Classificação
- Produto: I2
