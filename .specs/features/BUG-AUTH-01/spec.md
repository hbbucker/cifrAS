# Spec: BUG-AUTH-01: Token JWT expira no Modo Palco

## Background
O usuário relatou que o token JWT expira no Modo Palco após um período. Isso faz com que as músicas parem de carregar e o usuário tenha que sair da tela e logar novamente ("no modo palco após um tempo o token expira e para de carregar as musicas, pra voltar tem que sair e logar novamente").

## Root Cause
As chamadas da API no componente `TheaterModePage.tsx` usam `fetch` nativo em vez da instância axios configurada (`apiClient`), a qual possui um interceptor de requisição e resposta para atualizar tokens expirados de forma transparente via endpoint `/refresh`.
Como os calls usando `fetch` não passam pelo interceptor do Axios e enviam o token obtido pontualmente via `localStorage.getItem('token')`, quando o token expira a requisição falha com status `401 Unauthorized` e nenhuma tentativa de refresh é realizada.

## Solution
1. Substituir os hooks de `fetch` em `TheaterModePage.tsx` pela instância exportada `apiClient` de `../services/authService`.
2. Assegurar que as chamadas no Modo Palco continuem funcionando sem interrupções mesmo após a expiração inicial do token de acesso, tirando proveito da lógica automática de refresh já presente no interceptor.

## Tasks (Implicit)
- Atualizar importações em `TheaterModePage.tsx` para incluir `apiClient`.
- Trocar `fetch(/api/playlists/...)` por `apiClient.get(/playlists/...)`.
- Trocar `fetch(/api/songs/...)` por `apiClient.get(/songs/...)`.
- Trocar `fetch(/api/songs/.../preferences)` por `apiClient.put(/songs/.../preferences)`.
- Validar se o carregamento contínuo das músicas (Next / Prev) e atualização de preferências não é mais interrompido por 401 sem tentativa de refresh.
