# FE-ONBOARDING-01: Empty State Educativo e Tooltips de primeiro uso

## 1. Vision & Goal
O objetivo desta feature é reduzir o atrito inicial e induzir o usuário a adicionar sua primeira música na plataforma.
Quando o usuário não tiver músicas cadastradas, o Empty State tradicional deve ser substituído por um **Empty State Educativo** que não apenas convida à ação, mas explica *como* e *por que* adicionar uma música. Além disso, devemos introduzir **Tooltips de Primeiro Uso** para destacar a ação de adicionar.

## 2. Scope & Requirements

### Requisitos Funcionais
- **REQ-01**: O `DashboardPage` e `SongsListPage` devem exibir o `EducationalEmptyState` quando a lista de músicas estiver vazia (`songs.length === 0`).
- **REQ-02**: O `EducationalEmptyState` deve conter uma breve instrução de como colar a cifra e o botão de ação (Call-to-Action) apontando para `/songs/new`.
- **REQ-03**: Uma Tooltip (ou pequeno Popover/Tour) deve apontar para o botão "Adicionar Música" (ou similar) na primeira vez que o usuário entrar no `SongsListPage`.
- **REQ-04**: O estado de visualização dos tooltips ("já viu onboarding") deve ser salvo localmente (`localStorage`).

### Requisitos Não-Funcionais
- **NFR-01**: Internacionalização (i18n) obrigatória. Todas as novas strings devem estar em `locales/pt/translation.json` e `en/translation.json`.
- **NFR-02**: UI limpa usando Tailwind CSS (sem novos pacotes gigantes, se possível usar componente de tooltip customizado ou um pacote leve já existente no projeto).

## 3. UI/UX
- O `EducationalEmptyState` deve ter um ícone ou ilustração, um título encorajador, 1-3 passos simples de como funciona (ex: 1. Clique em adicionar, 2. Cole sua cifra, 3. Pronto!), e um CTA primário.
- A Tooltip deve aparecer após renderizar a página, posicionada apontando para o botão "Adicionar".

## 4. Dependencies
- React (já existente)
- Tailwind CSS (já existente)
- i18next (já existente)
