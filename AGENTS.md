# CifrAS — Guia do Desenvolvedor & Instruções para Agentes de IA 🤖🎸

Este documento serve como o manual definitivo para Agentes de IA (como Claude, Gemini, etc.) e desenvolvedores humanos que trabalham no projeto **CifrAS**. Ele compila e unifica as especificações arquiteturais, regras de domínio, convenções de código, stack tecnológica, design system e fluxos de execução do repositório.

---

## 1. Visão Geral do Projeto

O **CifrAS** é uma plataforma moderna e responsiva projetada para músicos (amadores e profissionais) que precisam gerenciar, transpor e compartilhar cifras de violão e guitarra. É especialmente otimizado para performances ao vivo (shows, missas, ensaios) com recursos como rolagem automática e transposição instantânea.

### Objetivos do Produto
- **Eficiência:** Transposição de cifras em menos de 30 segundos.
- **Organização:** CRUD completo de cifras e organização de playlists (DnD).
- **Modo Teatro:** Visualização limpa em tela cheia com rolagem automática e controles rápidos de toque.
- **Colaboração:** Criação de grupos e playlists colaborativas compartilhadas.

---

## 2. Stack Tecnológica e Integrações

### Backend
- **Linguagem & Framework:** Java 21 + Quarkus 3.10+
- **Acesso a Dados:** Hibernate ORM com Panache (Padrão Repository) sobre PostgreSQL.
- **Banco de Dados & Autenticação:** **Supabase** (PostgreSQL na nuvem e autenticação via OAuth/Google exclusivo emitindo JWT).
- **Validação:** Hibernate Validator (Bean Validation) e serialização Jackson.
- **Testes:** JUnit 5 + REST Assured + Testcontainers (para instâncias Postgres isoladas nos testes de integração).

### Frontend
- **Linguagem & Framework:** TypeScript + React 19
- **Build & Dev:** Vite integrado ao Quarkus via **Quarkus Quinoa**.
- **Estilização:** TailwindCSS v3 (design system rigoroso de 16px/32px de raio e sem sombras).
- **Ícones:** Lucide React.
- **Cliente HTTP:** Axios centralizado em `api/` com interceptores de cabeçalho `Authorization: Bearer <token>`.
- **Roteamento:** React Router DOM.
- **Testes E2E:** Playwright.

---

## 3. Arquitetura e Estrutura de Diretórios (Monorepo)

O projeto adota uma arquitetura unificada sob a pasta `codebase/` onde o servidor Quarkus serve tanto os endpoints REST (`/api/*`) quanto os arquivos estáticos compilados do React na raiz (`/`).

```text
codebase/
├── .mvn/                     # Wrapper do Maven
├── src/
│   ├── main/
│   │   ├── java/             # Backend Quarkus (Java 21)
│   │   │   └── br/com/cifras/
│   │   │       ├── shared/   # Código compartilhado (Exceções globais, DTOs genéricos, Security)
│   │   │       ├── config/   # Configurações do framework (ObjectMapper, Cors, etc.)
│   │   │       └── [feature]/# Módulos organizados por Feature (song, group, playlist, user)
│   │   │           ├── model/        # Modelos de Domínio Puros (POJOs ricos, sem anotações JPA)
│   │   │           ├── application/  # Casos de Uso / Services (Vertical Slicing)
│   │   │           ├── infra/        # Adapters de Infraestrutura (Entities JPA, Repositories, Mappers)
│   │   │           ├── resource/     # Controladores REST JAX-RS
│   │   │           └── dto/          # Records DTO (Requests e Responses)
│   │   │
│   │   ├── resources/        # Recursos do backend (application.properties)
│   │   │
│   │   └── webui/            # Frontend React (Vite + Quinoa)
│   │       ├── src/
│   │       │   ├── api/      # Clientes HTTP (Axios) apontando para /api
│   │       │   ├── components/ # Componentes UI genéricos e de layout
│   │       │   ├── context/  # Contextos globais (AuthContext)
│   │       │   ├── features/ # Funcionalidades isoladas (groups, songs, playlists)
│   │       │   ├── hooks/    # Custom hooks (e.g., useSupabaseAuth)
│   │       │   ├── pages/    # Telas completas da aplicação
│   │       │   ├── types/    # Tipagem TypeScript compartilhada
│   │       │   └── utils/    # Utilitários (lyricsParser, formatting)
│   │       ├── e2e/          # Testes E2E com Playwright
│   │       ├── package.json
│   │       └── vite.config.ts
│   │
│   └── test/
│       └── java/             # Testes integrados e unitários do backend (Testcontainers)
└── pom.xml                   # Build Maven
```

---

## 4. Convenções de Código e Boas Práticas

### Backend (Java / Quarkus)
1. **Domínio Rico (DDD Tático):** O modelo de domínio em `[feature]/model` deve ser composto por POJOs puros sem acoplamento com o banco de dados. Os atributos devem ser `private`, as classes devem proteger suas invariantes nos construtores (evitando construtores anêmicos vazios desnecessários) e as mutações de estado devem usar métodos verbais expressivos (ex: `acceptInvitation()`, `addSong()`, `changeTheme()`).
2. **Padrão Repository & Mappers:** Toda a persistência é feita via `PanacheRepository` e isolada na pasta `infra/`. As entidades JPA e as tabelas do banco de dados não vazam para a camada de domínio. Mappers (MapStruct ou manuais) convertem de/para Modelos de Domínio e Entidades JPA.
3. **DTOs Estritos:** Controladores JAX-RS (`Resources`) devem usar apenas records DTO para entrada e saída de dados, nunca expondo entidades JPA ou modelos de domínio diretamente.
4. **Segurança & JWT:** O usuário autenticado deve ser obtido de forma stateless usando a `SecurityIdentity` do Quarkus. O token JWT emitido pelo Supabase é validado offline usando a URL JWKS do Supabase configurada na propriedade `mp.jwt.verify.publickey.issuer` no `application.properties`. A claim `"sub"` (UUID) é usada como o ID único do usuário.
5. **Soft Delete:** A deleção de músicas e playlists deve usar soft delete para auditoria e prevenção de perda de dados. (Utilize anotações como `@SQLRestriction` do Hibernate para filtrar automaticamente entidades deletadas e `@SQLDelete` para sobrescrever a deleção padrão).

### Frontend (React)
1. **TypeScript Rígido:** Sem uso de `any`. Toda resposta de API deve ter seu respectivo tipo em `src/types/` ou no diretório da feature correspondente.
2. **Estilização Exclusiva com TailwindCSS:** Não adicione estilos CSS customizados a não ser para animações complexas ou hacks de scroll muito específicos.
3. **Avisos de Lint:** A pipeline do GitHub Actions falha em qualquer warning do ESLint (variáveis não utilizadas, dependências ausentes em `useEffect`).
4. **Chamadas de API:** Centralize chamadas no diretório `src/main/webui/src/api/` organizadas por domínio, utilizando a instância do Axios pré-configurada.
5. **Autenticação, Refresh Token e Redirecionamento (ADR):** O Axios deve interceptar erros `401`. No fluxo de refresh silencioso, é mandatório atualizar o header `Authorization` da requisição original (`originalRequest.headers.Authorization = 'Bearer ' + novoToken`) antes do retry para evitar loop de falhas. Caso o refresh falhe (token inválido/expirado), deve-se limpar o localStorage e forçar o redirecionamento imediato para o login via `window.location.href = '/login'`, evitando que o usuário fique preso em telas com erro.
6. **Internacionalização (i18n - ADR Tradução):** É estritamente proibido o uso de strings hardcoded (textos fixos) nos componentes React para mensagens de interface. Toda string voltada para o usuário deve ser extraída e consumida via hooks de tradução (ex: `useTranslation` do `react-i18next`), garantindo o suporte e consistência multi-idioma em toda a plataforma.

---

## 5. Regras Críticas de Domínio (Transposição e Cifras)

### 1. Formato de Cifra Estruturado (JSON)
O campo `lyrics` das músicas é armazenado como um JSON estruturado:
- `sections[]`: Representa seções (Intro, Verso, Refrão, etc.) contendo um label e uma lista de linhas (`lines[]`).
- `lines[]`: Contém um array de acordes com suas posições (`chords[]`) e o texto da letra associado (`text`).
Isso permite renderizar e transpor acordes de forma atômica no backend e no frontend sem parsing de texto livre frágil.

### 2. Motor de Transposição (`TranspositionService`)
A transposição de acordes ocorre *stateless* e *on-the-fly* ao passar o query param `?transpose=N` no endpoint `GET /songs/{id}` ou ao chamar `POST /songs/{id}/transpose`.
- **Ciclo Cromático:** `C → C# → D → D# → E → F → F# → G → G# → A → A# → B → C`.
- **Sufixos Suportados:** `m`, `7`, `m7`, `add9`, `sus2`, `dim`, `aug`, `/baixo` (apenas a nota raiz é transposta, o sufixo é mantido intacto).
- **Substituições Enarmônicas (Configurações de Exibição):** O sistema deve respeitar preferências de enarmonia do usuário (ex: "Usar Bb" para trocar A# por Bb, "Usar Eb" para trocar D# por Eb) na renderização e na transposição. Essa preferência já é persistida nas configurações de usuário no sistema.
- **Transposição de Tablaturas:** Ao transpor cifras que contenham tablaturas estruturadas, o motor deve recalcular as casas numéricas das cordas sem alterar a largura dos traços (`-`) para manter o alinhamento estrito.

---

## 6. Diretrizes do Design System (Pinterest-inspired)

O CifrAS adota uma interface limpa baseada no design do Pinterest: o foco visual é a cifra, e a interface recua de forma elegante.

- **Cores Principais:**
  - **Purple Primary (`#aa3bff`):** Usado para o botão de CTA principal ("Salvar", "Criar", "Sign up"). Deve-se priorizar o uso do componente padrão `<Button variant="primary">`.
  - **Pinterest Red (`#e60023`):** Usado apenas para a marca, indicadores de abas ativas e detalhes pontuais.
  - **Canvas (`#ffffff`) & Soft Surface (`#fbfbf9`):** Superfícies claras dominantes.
  - **Surface Card (`#f6f6f3`):** Cor de fundo creme para cards de música, botão secundário e barra de busca.
  - **Textos:** Ink (`#000000`) para títulos fortes e Body (`#33332e`) para parágrafos.
- **Geometria:**
  - **`border-radius: 16px` (`rounded-md`):** O raio padrão para botões, inputs, cards e seções.
  - **`border-radius: 32px` (`rounded-lg`):** Reservado para modais e grandes cards.
  - **`border-radius: 9999px` (`rounded-full`):** Para chips de filtros, avatares e barra de pesquisa.
  - **Sem sombras:** Apenas o modal de login/signup possui sombra de 16px sobre um background escurecido com 50% de opacidade.
- **Responsividade (Mobile-First):**
  - **Mobile (≤640px):** Layout em coluna única, bottom navigation substituindo a sidebar desktop, botões de toque com tamanho mínimo de `44x44px` (controles de transposição e Modo Teatro grandes para toque ágil durante shows).
  - **Teatro / Performance:** Minimalista, tela cheia, rolagem automática suave com velocidade regulável de 1 a 10.

---

## 7. Comandos de Terminal e Fluxo de Execução

### Regra Crítica: RTK (Rust Token Killer) ⚠️
Para economizar tokens de contexto nas interações com o terminal e o git, todos os comandos executados no shell do sistema devem ser rodados usando o proxy `rtk`.
- O hook automático do terminal reescreve os comandos comuns (ex: `git status` vira `rtk git status`). Se o hook automático não estiver presente em seu ambiente de agente, envolva os comandos manualmente com `rtk proxy` (ex: `rtk proxy git status`).
- Comandos analíticos podem ser invocados diretamente:
  - `rtk gain` (exibe estatísticas de economia de tokens).
  - `rtk gain --history` (histórico de comandos e savings).
  - `rtk discover` (analisa histórico para oportunidades perdidas).
  - `rtk proxy <cmd>` (para rodar comandos crus em caso de debug).

### Comandos do Backend (na pasta `codebase/`)
- **Iniciar servidor de Desenvolvimento (Quarkus + Quinoa + React):**
  ```bash
  ./mvnw quarkus:dev
  ```
  *(Nota: Isso inicia o Vite em background em uma porta randômica e expõe a aplicação unificada em http://localhost:8080)*
- **Executar todos os testes do backend (Unitários e Integração com Testcontainers):**
  ```bash
  ./mvnw test
  ```
- **Executar build completo e empacotamento da aplicação:**
  ```bash
  ./mvnw verify
  ```

### Comandos do Frontend (na pasta `codebase/src/main/webui/`)
- **Executar linter (ESLint):**
  ```bash
  npm run lint
  ```
- **Executar testes End-to-End (E2E) com Playwright:**
  ```bash
  npx playwright test
  ```

---

## 8. Equipe do Projeto e StartupOS

Este projeto opera sob uma arquitetura de **Sistema Operacional para Startups (StartupOS)**. A tomada de decisão é orquestrada pelo CEO AI, que conta com um time expansível de especialistas. 

As definições e system prompts estão consolidados como **Agentes Antigravity Persistentes** (Subagents). Eles são inicializados por meio do plugin local configurado em `.gemini/plugins/startupos/agents/`.

Para invocar um dos agentes abaixo em suas tarefas, os agentes do conselho devem utilizar a tool `invoke_subagent` indicando o respectivo nome (ex: `TypeName: "ceo"`).

- **ceo (CEO AI / Founder):** Orquestrador principal. Focado em estratégia, priorização, tomada de decisão e aumento do valor da empresa. (Permissões: Subagents, Código, MCP).
- **cto (CTO AI):** Arquitetura técnica, infraestrutura, qualidade do código e liderança da equipe de engenharia. (Permissões: Subagents, Código, MCP).
- **maya-rivers (CPO AI):** Descoberta de produto, roadmap, UX (Pinterest-style), validação de hipóteses e ativação.
- **po (Product Owner AI):** Tradução de requisitos, detalhamento de sprints e acompanhamento de tarefas granulares.
- **leo-sterling (CMO AI):** Marketing digital, relações com desenvolvedores, SEO, redes sociais, aquisição e comunidade.
- **alex-j-code (Frontend Performance Engineer):** Otimizações pesadas de front-end, Web Vitals e refinamento de interface.
- **Demais Especialistas (CRO, CFO, COO, QA, Research):** Podem ser definidos sob demanda ou agregados futuramente via plugin.

---

## 9. Guia de Trabalho para Agentes de Desenvolvimento de IA

Se você é um Agente de IA trabalhando neste projeto, siga este fluxo rigoroso para garantir a conformidade e qualidade das entregas:

1. **Abordagem Orientada a Specs (Spec-driven workflow):**
   - Antes de implementar qualquer código, valide o escopo nos arquivos de especificação correspondentes dentro de `.specs/features/[feature]/spec.md`.
   - Se a especificação não existir ou precisar de alterações, utilize a skill tlc-spec-driven para planejar a criação/atualização de um documento de design técnico antes de começar a codificar.
2. **Abordagem TDD (Test-Driven Development):**
   - Escreva testes unitários para validar a lógica de domínio enriquecida e o motor de transposição. A cobertura deve ser de no mínimo 95%.
   - Não submeta código de backend sem o correspondente teste de integração utilizando `REST Assured` e/ou `Testcontainers` se houver persistência.
3. **Validação E2E com Playwright:**
   - Ao alterar telas ou fluxos visuais do React, certifique-se de executar os testes E2E do Playwright (`npx playwright test`) a partir do diretório `src/main/webui` para validar que nenhum fluxo foi quebrado.
   - **Autenticação E2E (Bypass):** Os testes contornam a UI de login do Google injetando um mock JWT e navegando direto para `/auth/callback`. O backend (Quarkus) precisa rodar com o perfil `e2e` ativado (`-Dquarkus.profile=e2e`), que suporta validação local do algoritmo `RS256`. Use o script `generate_jwt.py` caso precise emitir novos tokens de teste com claims atualizadas (`iat`, `exp`).
4. **Preservação do Legado:**
   - Preserve integralmente todos os comentários, JSDoc e documentação existente no código que não forem alvo direto da alteração.
5. **Verificação de Portão Final e Playwright:**
   - Sempre execute a verificação final (testes locais, build, e `npx playwright test` no diretório webui) antes de declarar uma tarefa como concluída, propor commits ou abrir Pull Requests. Garanta que o projeto compila localmente com sucesso. Utilize a CLI do GitHub (`gh pr create`) para abrir PRs de forma autônoma, se aplicável.

## 10. Workflow de implementação

Todas as atividades seja planejamento, execução ou correção, devem utilizar a skill `tlc-spec-driven` seguindo o seguinte workflows.

**SE SKILL TLC-SPEC-DRIVEN NÃO ESTIVER DISPONÍVEL CANCELAR AÇÃO E REPORTAR**

1. **Análise:** Primeira etapa, pode ser uma feature, correção de bug ou quick-fix;
2. **Spec:** Especificação técnica para a atividade analisada;
3. **Tasks:** Definição das tasks que serão executadas;
4. **Execução:** Implementação das tasks criadas utilizando TDD, para qualquer tipo de implementação;
5. **Validação de Testes:** Build, Lints e cobertura devem atender os critérios já especificados;
6. **Worktree:** Trabalhar com branches e worktrees não conflitantes;
7. **Commit/Push:** Utilização de commits atômicos e padrão conventional commits. Um novo PR deve ser aberto no GitHub (usando `gh pr create` por exemplo) e **SEMPRE VERIFIQUE SE A PIPELINE PASSOU**;
8. **Deploy:** Report final de todo o fluxo para a decisão do humano para autorizar o Merge do PR e deploy no Fly.io