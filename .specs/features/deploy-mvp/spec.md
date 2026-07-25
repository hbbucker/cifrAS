# Spec: Deploy MVP (Milestone 3)

## Requirements
- DEPLOY-01: O frontend (React em `src/main/webui`) deve ser servido via Vercel, de forma independente do Quinoa em produção.
- DEPLOY-02: O backend (Quarkus) deve ser feito deploy no Fly.io.
- DEPLOY-03: As rotas de API no frontend devem se comunicar perfeitamente com o backend no Fly.io.
- DEPLOY-04: Variáveis de banco de dados e credenciais do Supabase devem ser geridas no ambiente de hospedagem.

## Contexto Atual (Brownfield)
- O projeto atual utiliza Quarkus Quinoa para gerar e servir o frontend (monólito). O `Dockerfile` na raiz compila um binário nativo GraalVM que inclui o frontend gerado.
- Os requests de frontend (ex: `authService.ts`) usam rotas relativas (`/api/...`).

## Architecture Decisions
1. **Frontend (Vercel)**: 
   - Root Directory: `src/main/webui`
   - O proxy/rewrites da Vercel (`vercel.json`) será usado para mapear `/api/*` para a URL do Fly.io. Isso preserva o uso de URLs relativas e previne problemas de CORS, simulando o mesmo domínio.
2. **Backend (Fly.io)**:
   - Utilizar a configuração existente em `fly.toml` (já na raiz do projeto). 
   - O `Dockerfile` pode ser mantido inicialmente, mas no futuro a build do frontend deve ser pulada na imagem do backend para economizar recursos.
