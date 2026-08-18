# Especificação Funcional & UX — Identidade Visual Mobile e Ícone Exclusivo CifrAS 🎸✨

## 1. Resumo Funcional & Diagnóstico de UX (Discovery)

### 1.1 Contexto e Diagnóstico
Durante a auditoria de experiência do usuário em dispositivos móveis (smartphones com viewport ≤ 640px), identificou-se uma quebra crítica de presença de marca e reconhecimento do produto após a etapa de login:

1. **Desaparecimento da Marca no Mobile:**
   - No desktop, a barra lateral (`Sidebar`) fixa exibe continuamente a tipografia da marca `CifrAS` e o menu do usuário (`UserMenu`).
   - No mobile, a `Sidebar` é ocultada (`hidden sm:flex`) e a navegação migra para a barra inferior (`BottomNav`). No entanto, não há uma **Top Bar / Header unificado de marca** no `MainLayout`.
   - Como consequência, páginas como `DashboardPage`, `PlaylistsPage`, `GroupsPage`, `SharedWithMePage` e `SettingsPage` exibem cabeçalhos fragmentados que omitem completamente o logotipo, nome ou ícone da plataforma.
   - O aplicativo opera visualmente de forma "anônima/white-label" em telas de celular.

2. **Fragilidade Semântica do Ícone Atual:**
   - Os arquivos de ícone (`public/favicon.svg`) contêm formas geométricas abstratas aleatórias de template.
   - Na tela de login (`LoginPage`) e na tela inicial (`LandingPage`), o aplicativo utiliza o ícone genérico `Music` (nota musical dupla padrão da biblioteca Lucide React).
   - O produto carece de um **ícone proprietário e exclusivo** que comunique visualmente o seu propósito essencial: **cifras, violão/guitarra, acordes estruturados e transposição tonal para músicos**.

### 1.2 Objetivos da Feature
- **Identidade Unificada:** Implementar presença de marca elegante e consistente na Top Bar mobile em todas as telas autenticadas, sem comprometer o espaço vertical de visualização.
- **Novo Ícone Exclusivo:** Definir e vetorizar um ícone proprietário para o CifrAS (conectando palheta, acordes e a inicial "C" em gradiente/cor púrpura `#8629cc` / `#aa3bff`).
- **Harmonização do Header:** Padronizar os cabeçalhos mobile das páginas autenticadas com ancoragem de marca, busca ágil, ações contextuais e acesso ao perfil (`UserMenu`).

---

## 2. Conceito da Nova Marca e Ícone Exclusivo

### 2.1 As 3 Opções Conceituais Avaliadas no Discovery

| Opção | Conceito | Metáfora Visual & Elementos | Avaliação CPO & UX |
| :--- | :--- | :--- | :--- |
| **Opção 1 (Recomendada)** | **"The Chord Pick" (A Palheta Cifrada)** | Silhueta orgânica de uma palheta de violão (pick) combinada internamente com o traçado da letra maiúscula **"C"** e três divisões de trastes/cordas formando um diagrama de acordes minimalista. | **Vencedora:** Altamente memorável, funciona em 16x16px (favicon), 28px (header mobile) e como app icon (PWA). Representa diretamente violão e cifra. |
| **Opção 2** | **"The Harmonic Soundhole" (A Boca Harmônica)** | Círculo da boca acústica do violão fundido com a curvatura da letra **"C"** e uma onda sonora de transposição tonal. | Elegante para marketing, porém perde clareza geométrica em escalas reduzidas (< 20px). |
| **Opção 3** | **"The Transpose Arc" (O Arco de Transposição)** | Glifo geométrico da letra **"C"** interceptado por cordas paralelas e capotraste vertical de transposição. | Conceito técnico e moderno, mas com menor apelo emocional para músicos amadores. |

### 2.2 Especificação Vetorial do Ícone Selecionado ("The Chord Pick")
- **Dimensões Base:** `viewBox="0 0 32 32"`
- **Cores Oficiais:**
  - Primária: `#aa3bff` (Purple Primary CifrAS)
  - Variação Dark / Contorno: `#8629cc` / `#721eb8`
  - Acento de Contraste: `#ffffff` (para ícone preenchido) ou `#fbfbf9`
- **Geometria SVG do Ícone (`BrandIcon` / `BrandLogo`):**
  - Corpo da palheta: Triângulo curvo equilátero invertido (`border-radius` nos 3 vértices: topo largo e base afunilada suave).
  - Recorte central: Letra "C" fluida em espaço negativo ou traço sólido, com 3 linhas verticais sutis que remetem às cordas de violão e à grade de cifras.

---

## 3. Requisitos de UI/UX e Design System

### 3.1 Anatomia da Top Bar / Header Mobile
Para não desperdiçar espaço vertical em telas móveis:
- **Altura Máxima:** `52px` a `56px` (`min-h-[52px]` no mobile vs `64px` no desktop).
- **Estilo Visual:** `bg-bg-card/95 backdrop-blur border-b border-border-main`.
- **Comportamento Responsivo:**
  - **No Dashboard Mobile:**
    - *Esquerda:* Ícone da marca CifrAS (28x28px) + Logotipo tipográfico `CifrAS` (18px font-bold cor `#8629cc`).
    - *Centro/Direita:* Botão/Input compacto de Busca (`SearchBar` adaptada com chip de pesquisa ou expandível) e Avatar do Usuário (`UserMenu`).
  - **Nas Páginas Internas (Playlists, Grupos, Compartilhados, Configurações):**
    - *Esquerda:* Logotipo compacto com Ícone da Marca (24x24px) como âncora clicável para Home + Separador sutil `/` + Título da Página (ex: `Playlists`, `Grupos`).
    - *Direita:* Ação primária contextual (ex: botão `+` de criar) e `UserMenu`.
  - **Na Página de Cifra (`SongViewPage` / Modo Performance):**
    - Mantém a prioridade da cifra: botão de voltar à esquerda, título da música, transposição e botão de Modo Teatro, com presença de marca limpa sem competir com a leitura instrumental.

### 3.2 Atualização do Favicon e Telas Públicas
- Substituir o arquivo `public/favicon.svg` e gerar `public/favicon.png` com o novo ícone exclusivo "The Chord Pick".
- Atualizar a tela de Login (`LoginPage.tsx`) e a Landing Page (`LandingPage.tsx`) substituindo o ícone genérico `Music` pelo novo componente de marca `<BrandLogo size="lg" />` e `<BrandIcon />`.
- Atualizar a `Sidebar.tsx` no Desktop para exibir o novo ícone vetorial ao lado do texto `CifrAS`.

---

## 4. Jornadas do Usuário (UX Flows)

### Jornada 1: Navegação Mobile no Dashboard
1. O músico autenticado abre o aplicativo em seu smartphone.
2. No topo da tela (Top Bar de 52px), ele visualiza instantaneamente o ícone e nome da marca **CifrAS** em roxo vibrante (`#8629cc`), acompanhado da barra de busca e seu avatar de perfil.
3. No rodapé, a barra inferior (`BottomNav`) permite alternar entre Músicas, Playlists, Compartilhados, Grupos e Ajustes.
4. **Sentimento do Usuário:** Sensação clara de produto nativo, profissional e com forte identidade musical.

### Jornada 2: Navegação em Subpáginas (ex: Playlists / Grupos)
1. O usuário toca na aba "Playlists" na `BottomNav`.
2. A tela exibe no cabeçalho superior o ícone do CifrAS integrado ao título da tela ("Playlists") e o botão de ação rápida "+ Nova Playlist".
3. Ao tocar no ícone da marca CifrAS, o usuário pode retornar diretamente ao Dashboard.

---

## 5. Critérios de Aceite (Acceptance Criteria — AoC) para o QA Lead

- [ ] **AC-01 (Componente de Marca Reutilizável):** Deve existir um componente dedicado de logotipo/ícone (`BrandLogo` / `BrandIcon`) implementado em SVG puro, suportando tamanhos (`sm`, `md`, `lg`), variações (ícone isolado ou ícone + texto tipográfico) e cores do Design System.
- [ ] **AC-02 (Identificação Visual Mobile no Dashboard):** Ao acessar o Dashboard em viewport mobile (≤ 640px), o usuário visualiza no cabeçalho superior a marca identificadora do CifrAS com ícone exclusivo e nome.
- [ ] **AC-03 (Consistência de Header nas Páginas Internas):** As páginas de Playlists, Grupos, Músicas, Compartilhados e Configurações no mobile devem exibir a identificação visual da marca integrada ao título da seção.
- [ ] **AC-04 (Ergonomia e Espaço Vertical Mobile):** A altura do cabeçalho superior no mobile não deve exceder 56px (`h-14` / `min-h-[52px]`), garantindo área útil máxima para leitura de cifras e listas.
- [ ] **AC-05 (Acesso ao Menu de Usuário no Mobile):** O menu do usuário (`UserMenu`) deve permanecer acessível e utilizável na Top Bar mobile em todas as telas principais autenticadas.
- [ ] **AC-06 (Atualização de Favicon e Telas de Auth/Landing):** O novo ícone exclusivo deve ser aplicado ao `favicon.svg`, `favicon.png`, `LoginPage.tsx`, `LandingPage.tsx` e `Sidebar.tsx`, eliminando o ícone genérico `Music` para representação da marca.
- [ ] **AC-07 (Responsividade e Acessibilidade):** Elementos interativos no header mobile devem ter área de toque mínima de 44x44px e atributos de acessibilidade adequados (`aria-label`, `role="banner"`).

---

## 6. Classificação de Impacto (Startup OS Matrix)

- **Decisão do CPO:** Nível **I1 — Moderado (Interface & UX)**
- **Justificativa:**
  - Alterações concentradas na camada de apresentação frontend (`MainLayout`, headers de páginas, componentes de marca e assets visuais).
  - Sem impacto em modelos de dados relacionais ou regras de negócio de backend.
  - Elegível para Fast-Track com validação independente do QA Lead.
