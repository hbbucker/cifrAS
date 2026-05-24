# CifrAS — Tech Stack

O CifrAS utiliza uma stack moderna e unificada para garantir alta performance, segurança e uma excelente experiência de desenvolvimento.

## Backend
- **Linguagem:** Java 21
- **Framework:** Quarkus 3.10+
- **Database Access:** Hibernate ORM com Panache
- **Driver de Banco de Dados:** PostgreSQL JDBC Driver
- **Validação:** Hibernate Validator (Bean Validation)
- **Serialização/JSON:** Jackson
- **Testes:**
  - JUnit 5
  - REST Assured (para testes de integração de API)
  - Testcontainers (para instanciar um PostgreSQL isolado nos testes)

## Frontend (Vite + Quinoa)
O frontend é gerenciado automaticamente durante o ciclo de build do Quarkus através da extensão Quinoa, usando a stack React padrão do mercado.
- **Linguagem:** TypeScript
- **Framework UI:** React 19
- **Build Tool:** Vite
- **Estilização:** TailwindCSS v3
- **Ícones:** Lucide React
- **Rotas:** React Router DOM
- **Cliente HTTP:** Axios
- **Formulários/Validação:** Custom hooks & gerenciamento local de estado.
- **Testes E2E:** Playwright

## Autenticação e Autorização
A responsabilidade de gerenciamento de usuários, tokens e emails de reset é delegada ao **Supabase**.
- **Login/Signup Flow:** Feito no frontend usando chamadas à API REST do Supabase Auth.
- **Validação de Sessão:** O token JWT retornado pelo Supabase é validado nativamente pelo Quarkus (via extensão SmallRye JWT), configurado com a URL JWKS (Public Keys) do Supabase. O Quarkus mapeia as claims do token e garante que chamadas às rotas protegidas sejam devidamente autorizadas.

## CI/CD
- **Automação:** GitHub Actions (`.github/workflows/ci.yml`).
- **Verificações Backend:** Maven `test` e `verify`.
- **Verificações Frontend:** ESLint, Prettier, TypeScript Compiler (`tsc`), Playwright E2E.
