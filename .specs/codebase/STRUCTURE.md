# CifrAS — Estrutura de Diretórios

O projeto agora usa uma estrutura unificada sob a pasta `codebase/`.

```text
codebase/
├── .mvn/                     # Wrapper do Maven
├── src/
│   ├── main/
│   │   ├── java/             # Código fonte do backend Quarkus (Java 21)
│   │   │   └── br/com/cifras/
│   │   │       ├── shared/   # Código compartilhado (Exceções genéricas, DTOs globais, Security)
│   │   │       ├── config/   # Configurações do framework (Ex. ObjectMapper, Cors)
│   │   │       └── [feature]/# Módulos organizados por Feature (ex: song, group, playlist, user)
│   │   │           ├── model/        # Modelos de Domínio Puros (POJOs independentes de infra)
│   │   │           ├── application/  # Casos de Uso (Services)
│   │   │           ├── infra/        # Adapters de Infraestrutura (Entities JPA, Repositories, Mappers)
│   │   │           ├── resource/     # Controladores REST (JAX-RS)
│   │   │           └── dto/          # Data Transfer Objects (Requests/Responses)
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
