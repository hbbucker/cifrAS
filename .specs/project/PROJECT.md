# CifrAS — Aplicativo de Cifras de Violão

**Vision:** Uma plataforma multi-dispositivo (web, mobile, tablet) para músicos gerenciarem, transposição e compartilharem cifras de violão, com modo de performance otimizado para apresentações ao vivo.
**For:** Músicos amadores e profissionais — especialmente aqueles que tocam em missas, bares e eventos que exigem adaptação rápida de repertório e tom.
**Solves:** Dificuldade de transpor músicas rapidamente, organizar repertórios e colaborar com outros músicos em playlists compartilhadas.

## Goals

- Permitir que um músico crie, visualize e transponha cifras em < 30 segundos
- Suportar grupos colaborativos e playlists compartilhadas com múltiplos membros
- Oferecer Modo Teatro (tela cheia + rolagem automática) para performances ao vivo
- Atingir cobertura de testes > 80% em lógica de negócio crítica (transposição, autenticação)

## Tech Stack

**Arquitetura Unificada (Quarkus Quinoa):**
O projeto roda como um monólito onde o Quarkus gerencia tanto o servidor de backend REST quanto a compilação e entrega do frontend estático gerado pelo Vite/React.

**Backend (Java Quarkus):**
- Framework: Quarkus 3.x
- Linguagem: Java 21
- Padrão Arquitetural: Domain-Driven Design (Separação estrita entre Modelos de Domínio puros e Entidades de Infraestrutura/JPA)
- ORM: Panache (Hibernate Reactive ou JPA)
- Banco de Dados: PostgreSQL via Supabase
- Auth: Supabase Auth (JWT validation)
- APIs: RESTful JSON (prefixadas em `/api`)

**Frontend (React):**
- Framework: React 19 + TypeScript
- Build/Server: Vite (integrado via Quinoa em `src/main/webui`)
- Estilização: TailwindCSS
- Gerenciamento de Estado: Context API (v1), Zustand (se necessário)
- HTTP Client: Axios
- Target: Web (PWA) — iOS/Android via React Native na v2

**Infraestrutura e Testes:**
- Supabase (PostgreSQL + Auth + Storage)
- Deploy: Executável nativo Quarkus (ou `.jar` standalone)
- Testes: Testcontainers (Backend), Playwright (E2E Frontend)

## Scope

**v1 includes:**
- Autenticação de usuário (registro, login, logout)
- CRUD de músicas com cifras estruturadas (título, artista, letra + acordes)
- Transposição de tom em tempo real (± meio tom)
- Playlists pessoais (criar, reordenar, visualizar em sequência)
- Grupos e playlists colaborativas (criar grupo, convidar membros, editar playlist compartilhada)
- Modo Teatro (tela cheia, rolagem automática, controles de tom e navegação)
- Busca por título, artista e trecho de letra

**Explicitly out of scope:**
- App nativo iOS/Android (v2)
- Upload de PDFs/partituras (possível v2)
- Detecção automática de acordes por áudio
- Marketplace / monetização
- Integração com streaming (Spotify, YouTube)

## Constraints

- Timeline: Não definido formalmente; MVP iterativo
- Technical: Supabase como BaaS obrigatório; JWT emitido pelo Supabase
- Resources: Time pequeno / projeto indie

## Glossário & Termos Canônicos (D3)

| Conceito | Termo Canônico | Termos Proibidos / Sinônimos Evitados | Descrição |
|---|---|---|---|
| Classificação de Músicas | `tags` | `labels`, `categories`, `genres` | Etiquetas textuais livres atribuídas a músicas para filtragem e organização. |
| Tom Musical | `key` / `originalKey` | `tone`, `scale`, `tuning` | Tom de referência ou tom original de uma música. |
| Estrutura de Cifra | `lyrics` | `chordsheet`, `tab`, `cifra` | Estrutura de seções, linhas e acordes serializada em JSON. |
