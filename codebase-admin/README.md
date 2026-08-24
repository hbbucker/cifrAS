# CifrAS Admin — Painel Administrativo Independente 🛡️

Aplicação administrativa do ecossistema **CifrAS**, desenvolvida com a mesma arquitetura de alto desempenho do app principal, mas isolada em processo próprio para reduzir a superfície de ataque ao aplicativo de usuários.

---

## 1. Arquitetura e Tecnologias

- **Backend:** Java 21 + Quarkus 3.35+ (Hibernate ORM Panache, SmallRye JWT, Bean Validation)
- **Banco de Dados:** PostgreSQL compartilhado (Supabase)
- **Frontend:** React 19 + TypeScript + Vite + Quinoa + TailwindCSS
- **Segurança:** Validação de privilégios de administrador via JWT / Claims Supabase
- **Isolamento de Portas:**
  - Backend Admin: `http://localhost:8081` (App principal: `8080`)
  - Quinoa/Vite Dev Server: `http://localhost:5174` (App principal: `5173`)

---

## 2. Comandos de Execução

### Modo de Desenvolvimento (Quarkus + React Quinoa)
```bash
cd codebase-admin
./mvnw quarkus:dev
```
Acesse o painel em: `http://localhost:8081`

### Testes do Backend
```bash
cd codebase-admin
./mvnw test
```

### Testes do Frontend
```bash
cd codebase-admin/src/main/webui
npm run test
```

### Build Nativo / Produção
```bash
cd codebase-admin
./mvnw clean package -Dnative -DskipTests
```

---

## 3. Deploy no Fly.io

Para realizar o deploy do aplicativo administrativo para `cifras-adm.fly.dev` sem interferir no app principal:

```bash
fly deploy --config fly.admin.toml --local-only --verbose
```

