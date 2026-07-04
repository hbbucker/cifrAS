# Google Social Login Specification

## Problem Statement

O usuário ativou o login social (Google) no Supabase e deseja que a plataforma CifrAS permita acesso *exclusivo* via Google. O login tradicional com email e senha será desativado para simplificar a autenticação e melhorar a segurança, transferindo toda a responsabilidade de gestão de credenciais para o provedor social.

## Goals

- [ ] Substituir o formulário atual de email/senha por um botão único "Sign in with Google" na página de login.
- [ ] O fluxo de registro (`RegisterPage`) deve ser removido ou redirecionado para a mesma autenticação via Google.
- [ ] O frontend deve processar corretamente o callback do OAuth do Supabase, extraindo o `access_token` e `refresh_token` e integrando-os ao `AuthContext`.
- [ ] Garantir que o backend aceite o JWT emitido pelo Supabase para autenticação social (o que, por padrão do Supabase/Quarkus, já deve funcionar via validação da JWKS).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Outros provedores sociais | O escopo atual é focado exclusivamente no Google. |
| Supabase JS SDK completo | Apenas extrairemos os tokens da URL após o redirect. Não precisamos adicionar uma dependência pesada no frontend se não for estritamente necessário. |
| Migração de contas antigas | Como o login por email/senha será removido, usuários antigos poderão logar com o Google caso o email seja o mesmo, se o Supabase mesclar as contas. Mas gerenciar migração ativamente está fora do escopo. |

---

## User Stories

### P1: Login Exclusivo com Google ⭐ MVP

**User Story**: Como um usuário do CifrAS, eu quero fazer login apenas utilizando minha conta do Google para não ter que lembrar de mais uma senha.

**Why P1**: O requisito define que apenas o login pelo Google deve ser permitido.

**Acceptance Criteria**:

1. WHEN o usuário acessa a página de login (`/login`) THEN ele visualizará apenas o botão "Sign in with Google", sem campos de email e senha.
2. WHEN o usuário clica no botão "Sign in with Google" THEN ele será redirecionado para a página de autorização do Supabase/Google.
3. WHEN o login é concluído e o Supabase redireciona de volta para a aplicação (`/auth/callback`) THEN a aplicação deve capturar o `access_token` e `refresh_token` da URL, persistir localmente e iniciar a sessão do usuário no `AuthContext`.
4. WHEN o usuário tenta acessar `/register` THEN ele deve ser redirecionado para a página de login.

**Independent Test**: Clicar no botão de login, completar a autenticação com o Google e verificar se o redirecionamento para o dashboard ocorre com sucesso e o usuário está logado.

---

## Edge Cases

- WHEN o fluxo do OAuth é cancelado pelo usuário THEN o callback deve retornar para a tela de login apresentando uma mensagem de erro genérica amigável.
- WHEN a URL de callback não conter os tokens necessários (erro de autenticação) THEN a aplicação deve mostrar uma notificação de falha (`toast('Failed to login with Google')`) e permanecer na página de login.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| GOOGLE-01 | P1: Remover email/senha e adicionar botão Google no frontend | Execute | Verified |
| GOOGLE-02 | P1: Implementar rota de callback OAuth (`/auth/callback`) | Execute | Verified |
| GOOGLE-03 | P1: Remover rotas legadas de registro | Execute | Verified |
| GOOGLE-04 | P1: Desativar temporariamente endpoints legados no Quarkus (opcional) | Execute | Verified |

**Coverage**: 4 total, 4 mapped to tasks, 0 unmapped ⚠️

---

## Success Criteria

- [x] A página de login contém apenas o login via Google.
- [x] Usuários conseguem autenticar na plataforma e visualizar o Dashboard.
- [x] Formulário antigo de email/senha não é mais renderizado na UI.
