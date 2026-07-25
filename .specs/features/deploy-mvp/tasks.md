# Tasks: Deploy MVP

## Phase 1: Ajustes do Backend e Deploy no Fly.io
- [ ] TASK-1.1: Deploy Inicial Backend (Fly.io)
  - Ação: Prover os secrets do Supabase e Postgres (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `SUPABASE_URL`, `SUPABASE_API_KEY`) via `fly secrets set`. Fazer deploy rodando `fly deploy`.
  - Nota: Confirmar URL final da aplicação (ex: `cifras.fly.dev`).
- [ ] TASK-1.2: Refatoração Opcional do Dockerfile
  - Ação: (Se a compilação nativa GraalVM com Node na nuvem estiver estourando a memória gratuita) Criar um `Dockerfile.jvm` ignorando a compilação do Quinoa para deploy mais rápido, ou desativar temporariamente a flag do Node.js.

## Phase 2: Preparação do Frontend e Deploy na Vercel
- [ ] TASK-2.1: Criar `vercel.json` em `src/main/webui/vercel.json`
  - Ação: Criar o arquivo para fazer SPA routing e proxy da API.
  - Exemplo: 
    ```json
    {
      "rewrites": [
        { "source": "/api/(.*)", "destination": "https://<URL_DO_FLY_AQUI>/api/$1" },
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
- [ ] TASK-2.2: Deploy Frontend Vercel
  - Ação: Submeter o `vercel.json` ao repositório git. Via Vercel CLI (ou painel), conectar o projeto, apontar Root Directory para `src/main/webui`, usar framework Vite e acionar deploy.

## Phase 3: Validação (UAT)
- [ ] TASK-3.1: Validar fluxo de autenticação e CRUD pelo domínio da Vercel.
