# Design System - Aplicativo de Cifras

## 1. Introdução

Este documento apresenta o Design System completo para o aplicativo de cifras de violão. Ele define os princípios de design, arquitetura de informação, componentes reutilizáveis, paleta de cores, tipografia e padrões de interação que garantem uma experiência de usuário consistente, intuitiva e acessível em todos os dispositivos (mobile, tablet e desktop).

## 2. Princípios de Design

O design do aplicativo de cifras é fundamentado em cinco princípios principais que orientam todas as decisões de design:

**Clareza e Legibilidade:** As cifras e letras devem ser apresentadas de forma clara e legível, com contraste adequado e tamanhos de fonte apropriados para diferentes contextos (edição, visualização, performance).

**Eficiência:** O aplicativo deve permitir que músicos realizem tarefas comuns (transposição, navegação entre músicas, ajuste de tom) com o mínimo de cliques ou toques.

**Consistência:** Todos os componentes, padrões de interação e layouts devem seguir convenções consistentes em toda a aplicação.

**Acessibilidade:** O design deve ser inclusivo, respeitando as diretrizes WCAG 2.1 para garantir que usuários com diferentes necessidades possam utilizar o aplicativo.

**Responsividade:** A interface deve se adaptar perfeitamente a diferentes tamanhos de tela, desde smartphones até monitores de desktop.

## 3. Arquitetura de Informação

A estrutura hierárquica do aplicativo é organizada em torno de três contextos principais de uso:

### 3.1. Contexto de Gerenciamento (Desktop/Tablet)

Neste contexto, o usuário está em um ambiente de trabalho, criando, editando e organizando suas músicas e playlists. A interface oferece mais espaço para exibição de informações e controles detalhados.

**Hierarquia de Navegação:**

```
Início
├── Minhas Músicas
│   ├── Visualizar Música
│   ├── Editar Música
│   └── Deletar Música
├── Playlists
│   ├── Criar Playlist
│   ├── Visualizar Playlist
│   ├── Editar Playlist
│   └── Deletar Playlist
├── Grupos
│   ├── Criar Grupo
│   ├── Gerenciar Membros
│   └── Visualizar Grupos
├── Compartilhadas Comigo
│   └── Visualizar Músicas/Playlists Compartilhadas
└── Configurações
    ├── Perfil
    ├── Preferências
    └── Logout
```

### 3.2. Contexto de Performance (Mobile/Tablet)

Neste contexto, o usuário está em uma apresentação ao vivo, usando o Modo Teatro. A interface é minimalista, focando apenas na música atual e nos controles essenciais de transposição, navegação e rolagem automática.

**Hierarquia de Navegação:**

```
Modo Teatro
├── Música Atual (Visualização em Tela Cheia)
├── Controles de Transposição (Tom +/-)
├── Controles de Navegação (Próxima/Anterior)
├── Controles de Rolagem Automática (Play/Pause, Velocidade)
└── Botão de Sair do Modo Teatro
```

### 3.3. Contexto de Busca e Descoberta (Todos os Dispositivos)

O usuário está procurando músicas específicas ou explorando o repertório compartilhado. A interface oferece filtros, busca e visualizações em grid ou lista.

## 4. Paleta de Cores

A paleta de cores foi escolhida para refletir a natureza musical do aplicativo, combinando tons quentes e vibrantes com tons neutros para garantir legibilidade e acessibilidade.

| Cor | Código Hex | Uso | Descrição |
|-----|-----------|-----|-----------|
| Primária | #8B5CF6 | Botões principais, links, destaques | Roxo vibrante que evoca criatividade e música |
| Primária Escura | #6D28D9 | Hover, estados ativos | Versão mais escura da cor primária |
| Primária Clara | #EDE9FE | Backgrounds, estados hover leves | Versão clara para backgrounds |
| Secundária | #EC4899 | Ações secundárias, alertas | Rosa vibrante para chamar atenção |
| Sucesso | #10B981 | Confirmações, salvar, sucesso | Verde para indicar ações bem-sucedidas |
| Aviso | #F59E0B | Avisos, transições | Âmbar para avisos e ações importantes |
| Erro | #EF4444 | Erros, deletar, perigo | Vermelho para indicar erros ou ações perigosas |
| Neutro 50 | #F9FAFB | Backgrounds claros | Branco quase puro |
| Neutro 100 | #F3F4F6 | Backgrounds secundários | Cinza muito claro |
| Neutro 200 | #E5E7EB | Bordas, separadores | Cinza claro |
| Neutro 500 | #6B7280 | Texto secundário | Cinza médio |
| Neutro 700 | #374151 | Texto principal | Cinza escuro |
| Neutro 900 | #111827 | Texto forte, backgrounds escuros | Preto quase puro |

## 5. Tipografia

A tipografia foi selecionada para garantir legibilidade em diferentes tamanhos de tela e contextos de uso.

### 5.1. Fonte Principal

**Família:** Inter (sans-serif)
**Pesos:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
**Uso:** Textos gerais, labels, botões

### 5.2. Fonte de Código (para Cifras)

**Família:** Courier New ou Monospace
**Pesos:** 400 (Regular), 700 (Bold)
**Uso:** Exibição de cifras, acordes

### 5.3. Escala Tipográfica

| Elemento | Tamanho | Peso | Altura da Linha | Uso |
|----------|--------|------|-----------------|-----|
| Heading 1 | 32px | 700 | 1.2 | Títulos principais de páginas |
| Heading 2 | 24px | 600 | 1.3 | Subtítulos, seções |
| Heading 3 | 20px | 600 | 1.4 | Títulos de cards, subsecções |
| Body Large | 16px | 400 | 1.5 | Texto principal, descrições |
| Body Regular | 14px | 400 | 1.5 | Texto padrão |
| Body Small | 12px | 400 | 1.4 | Texto secundário, labels |
| Caption | 11px | 400 | 1.3 | Notas, timestamps |
| Cifra | 18px-24px | 400 | 1.6 | Acordes em visualização de música |

## 6. Componentes Principais

### 6.1. Botões

Os botões seguem uma hierarquia clara, com variações para diferentes contextos de uso.

**Variações:**

*   **Primário:** Usado para ações principais (Salvar, Criar, Compartilhar)
*   **Secundário:** Usado para ações secundárias (Cancelar, Editar)
*   **Terciário:** Usado para ações menos importantes (Mais opções)
*   **Perigo:** Usado para ações destrutivas (Deletar)

**Estados:**

Cada botão possui estados visuais para feedback do usuário: normal, hover, active, disabled.

### 6.2. Inputs e Formulários

Os campos de entrada devem ser claramente identificáveis e fornecer feedback visual ao usuário.

**Tipos:**

*   **Text Input:** Para títulos, nomes, busca
*   **Textarea:** Para letra e cifras
*   **Select:** Para seleção de tom, velocidade de rolagem
*   **Checkbox:** Para seleção múltipla (ex: membros do grupo)
*   **Radio Button:** Para seleção única (ex: tipo de playlist)

### 6.3. Cards

Os cards são usados para agrupar informações relacionadas e criar layouts modulares.

**Variações:**

*   **Card de Música:** Exibe título, artista, tom original e ações (editar, deletar, compartilhar)
*   **Card de Playlist:** Exibe nome, número de músicas, membros colaboradores e ações
*   **Card de Grupo:** Exibe nome do grupo, membros e ações

### 6.4. Modais

Os modais são usados para ações que requerem confirmação ou entrada de dados adicionais.

**Exemplos:**

*   Modal de confirmação antes de deletar
*   Modal para criar nova música
*   Modal para convidar membros a um grupo

### 6.5. Navegação

A navegação deve ser intuitiva e acessível em todos os dispositivos.

**Componentes:**

*   **Header:** Contém logo, busca e menu de usuário
*   **Sidebar (Desktop):** Menu de navegação principal
*   **Bottom Navigation (Mobile):** Abas de navegação na parte inferior
*   **Breadcrumbs:** Para indicar a localização do usuário na hierarquia

## 7. Layouts Principais

### 7.1. Layout de Gerenciamento (Desktop/Tablet)

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Logo, Busca, Menu Usuário)                          │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Sidebar     │  Conteúdo Principal                          │
│  (Menu)      │  ┌────────────────────────────────────────┐  │
│              │  │ Título da Página                       │  │
│              │  ├────────────────────────────────────────┤  │
│              │  │ Filtros / Busca                        │  │
│              │  ├────────────────────────────────────────┤  │
│              │  │ Grid/Lista de Músicas/Playlists       │  │
│              │  │ ┌──────┐ ┌──────┐ ┌──────┐            │  │
│              │  │ │ Card │ │ Card │ │ Card │            │  │
│              │  │ └──────┘ └──────┘ └──────┘            │  │
│              │  │                                        │  │
│              │  └────────────────────────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 7.2. Layout de Performance (Modo Teatro - Mobile)

```
┌─────────────────────────────────┐
│ Música Atual (Tela Cheia)       │
│                                 │
│ [Título - Artista]              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Letra com Cifras            │ │
│ │ (Rolagem Automática)        │ │
│ │                             │ │
│ │ [Acordes] [Acordes]         │ │
│ │ [Acordes] [Acordes]         │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Tom -  [Tom Atual]  Tom +   │ │
│ │ ◄  Anterior  |  Próximo  ►  │ │
│ │ ⏸ Play/Pause  ⊙ Velocidade  │ │
│ │ ✕ Sair do Modo Teatro       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 7.3. Layout de Visualização de Música (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumb: Minhas Músicas > Música                         │
├─────────────────────────────────────────────────────────────┤
│ Título: [Nome da Música]                                    │
│ Artista: [Nome do Artista]                                  │
│ Tom Original: [Tom]                                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tom -  [Tom Atual]  Tom +  | Editar | Compartilhar     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Letra com Cifras (Monospace)                            │ │
│ │                                                         │ │
│ │ [Verso 1]                                               │ │
│ │ Am                    E                                 │ │
│ │ Letra da música...                                      │ │
│ │                                                         │ │
│ │ [Verso 2]                                               │ │
│ │ Dm                    G                                 │ │
│ │ Mais letra...                                           │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Botão: Modo Teatro] [Botão: Adicionar a Playlist]        │
└─────────────────────────────────────────────────────────────┘
```

## 8. Fluxos de Usuário Principais

### 8.1. Fluxo de Transposição de Tom

```
Usuário visualiza música
    ↓
Clica em "Tom +" ou "Tom -"
    ↓
Sistema recalcula acordes
    ↓
Música é exibida com novo tom
    ↓
Usuário pode continuar transponindo ou sair
```

### 8.2. Fluxo de Criação de Playlist Colaborativa

```
Usuário acessa seção de Playlists
    ↓
Clica em "Criar Nova Playlist"
    ↓
Preenche nome e marca como "Colaborativa"
    ↓
Seleciona membros para convidar
    ↓
Clica em "Salvar"
    ↓
Sistema cria playlist e envia convites
    ↓
Playlist é exibida na tela principal
```

### 8.3. Fluxo de Modo Teatro

```
Usuário seleciona uma playlist
    ↓
Clica em "Iniciar Modo Teatro"
    ↓
Aplicativo entra em modo tela cheia
    ↓
Primeira música da playlist é exibida
    ↓
Rolagem automática inicia
    ↓
Usuário pode transpor tom, navegar entre músicas
    ↓
Clica em "Sair" para retornar ao modo normal
```

## 9. Responsividade

O design deve se adaptar perfeitamente a diferentes tamanhos de tela. A estratégia de responsividade segue a abordagem mobile-first.

### 9.1. Breakpoints

| Dispositivo | Largura | Descrição |
|-------------|---------|-----------|
| Mobile | 320px - 640px | Smartphones |
| Tablet | 641px - 1024px | Tablets em retrato e paisagem |
| Desktop | 1025px+ | Computadores e telas grandes |

### 9.2. Adaptações por Breakpoint

**Mobile (320px - 640px):**

*   Layout em coluna única
*   Bottom navigation em vez de sidebar
*   Botões maiores para facilitar toque
*   Modais em tela cheia

**Tablet (641px - 1024px):**

*   Layout com sidebar retrátil
*   Grid de 2 colunas para cards
*   Modais em tamanho reduzido

**Desktop (1025px+):**

*   Layout com sidebar permanente
*   Grid de 3-4 colunas para cards
*   Modais em tamanho padrão

## 10. Acessibilidade

O design segue as diretrizes WCAG 2.1 para garantir acessibilidade.

### 10.1. Contraste de Cores

Todos os textos devem ter uma razão de contraste mínima de 4.5:1 para texto normal e 3:1 para texto grande.

### 10.2. Navegação por Teclado

Todos os elementos interativos devem ser acessíveis via teclado, com indicadores visuais claros de foco.

### 10.3. Leitores de Tela

Todos os elementos devem ter labels descritivos e atributos ARIA apropriados para compatibilidade com leitores de tela.

### 10.4. Tamanho de Fonte

O tamanho mínimo de fonte para texto principal deve ser de 14px em desktop e 16px em mobile.

## 11. Animações e Transições

As animações devem ser sutis e melhorar a experiência do usuário sem distrair.

### 11.1. Transições de Página

Transições suaves entre páginas usando fade-in/fade-out (200ms - 300ms).

### 11.2. Hover e Interação

Efeitos de hover em botões e cards (mudança de cor, sombra) com duração de 150ms.

### 11.3. Rolagem Automática

A rolagem automática no Modo Teatro deve ser suave e contínua, com velocidade ajustável.

## 12. Padrões de Interação

### 12.1. Feedback Visual

Todas as ações do usuário devem fornecer feedback visual imediato (mudança de cor, animação, toast notification).

### 12.2. Confirmação de Ações Destrutivas

Ações destrutivas (deletar) devem exigir confirmação via modal.

### 12.3. Carregamento

Estados de carregamento devem ser indicados com spinners ou skeletons.

### 12.4. Erros e Validação

Erros de validação devem ser exibidos próximos ao campo afetado, com mensagens claras e acionáveis.

## 13. Referências de Design

*   [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Diretrizes de acessibilidade web
*   [Material Design](https://material.io/design/) - Sistema de design do Google
*   [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - Diretrizes de design da Apple
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Documentação do framework CSS utilizado
