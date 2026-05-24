# CifrAS — Estrutura de Diretórios

O projeto agora usa uma estrutura unificada sob a pasta `codebase/`.

```text
codebase/
├── .mvn/                     # Wrapper do Maven
├── src/
│   ├── main/
│   │   ├── java/             # Código fonte do backend Quarkus (Java 21)
│   │   │   └── br/com/cifras/
│   │   │       ├── config/   # Configurações globais (Exceções, Filtros, ObjectMapper)
│   │   │       ├── model/    # Entidades Panache (Songs, Groups, etc.)
│   │   │       ├── resource/ # Endpoints JAX-RS /api/*
│   │   │       ├── service/  # Regras de negócio, transposição e validação
│   │   │       └── dto/      # Data Transfer Objects (Requests e Responses)
│   │   │
│   │   ├── resources/        # Recursos do backend
│   │   │   └── application.properties # Configurações do Quarkus
│   │   │
│   │   └── webui/            # Código fonte do frontend React (Vite + Quinoa)
│   │       ├── src/
│   │       │   ├── api/      # Clientes HTTP (Axios) para /api
│   │       │   ├── components/ # Componentes UI genéricos e de layout
│   │       │   ├── context/  # Contextos globais do React (AuthContext)
│   │       │   ├── features/ # Funcionalidades isoladas (groups, songs, playlists)
│   │       │   ├── hooks/    # Custom hooks (e.g., useSupabaseAuth)
│   │       │   ├── pages/    # Telas completas da aplicação
│   │       │   ├── types/    # Definições de tipagem TypeScript compartilhadas
│   │       │   └── utils/    # Utilitários (parsing de cifra, formatação)
│   │       │
│   │       ├── e2e/          # Testes End-to-End com Playwright
│   │       ├── public/       # Imagens estáticas e favicon
│   │       ├── playwright.config.ts # Configuração dos testes E2E
│   │       ├── package.json  # Dependências do frontend
│   │       └── vite.config.ts # Configuração de build do Vite
│   │
│   └── test/
│       └── java/             # Testes integrados e unitários do backend (Testcontainers)
│
├── .github/
│   └── workflows/
│       └── ci.yml            # Pipeline automatizada do GitHub Actions
│
└── pom.xml                   # Configurações de build do Maven (dependências Quarkus)
```
