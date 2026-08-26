# CifrAS — Estrutura de Diretórios

O projeto agora usa uma estrutura unificada sob duas pastas principais: `codebase/` e `codebase-admin/`.

```text
/
├── codebase/                 # Aplicativo Principal (Músicos e Usuários Finais)
│   ├── .mvn/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/         # Backend Quarkus (Java 21)
│   │   │   │   └── br/com/cifras/
│   │   │   │       ├── shared/
│   │   │   │       ├── config/
│   │   │   │       └── [feature]/# Módulos (song, group, playlist, user)
│   │   │   ├── resources/
│   │   │   └── webui/        # Frontend React principal (Vite + Quinoa)
│   │   │       ├── src/
│   │   │       │   ├── api/
│   │   │       │   ├── components/
│   │   │       │   ├── context/
│   │   │       │   ├── features/
│   │   │       │   ├── hooks/
│   │   │       │   ├── pages/
│   │   │       │   ├── types/
│   │   │       │   └── utils/
│   │   │       ├── e2e/
│   │   │       └── vite.config.ts
│   │   └── test/
│   └── pom.xml
│
├── codebase-admin/           # Painel Administrativo (Moderação, Auditoria, Dashboards)
│   ├── .mvn/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/         # Backend Quarkus Admin
│   │   │   │   └── br/com/cifras/admin/
│   │   │   │       ├── shared/
│   │   │   │       ├── config/
│   │   │   │       └── [feature]/# Módulos (audit, auth, dashboard, song)
│   │   │   ├── resources/
│   │   │   └── webui/        # Frontend React administrativo (Vite + Quinoa)
│   │   └── test/
│   └── pom.xml
│
└── .github/
    └── workflows/
        └── ci.yml            # Pipeline automatizada do GitHub Actions
```
