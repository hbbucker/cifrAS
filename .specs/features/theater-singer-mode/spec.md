# Spec — Modo Cantor no Modo Teatro (Singer Mode) 🎤

## 1. Resumo Funcional

O **Modo Cantor (Singer Mode)** no **Modo Teatro** permite que vocalistas, cantores e líderes de louvor/música visualizem a letra da música em tela cheia com rolagem automática suave e tipografia ampliada, **sem a exibição de cifras (acordes) e sem tablaturas**.

Essa funcionalidade elimina a poluição visual de acordes e tablaturas para músicos que apenas cantam, otimizando o espaço da tela, aumentando a legibilidade e garantindo que o auto-scroll seja ainda mais fluido e direto durante shows, ensaios e celebrações.

---

## 2. Personas & Jobs To Be Done (JTBD)

- **Persona 1 — O Vocalista / Cantor:** Está no palco ou ensaio usando tablet ou celular e não precisa ver acordes de violão ou tablaturas de solo; precisa apenas da letra grande e das marcações de estrutura (`[Refrão]`, `[Verso 2]`, `[Ponte]`) com rolagem automática contínua.
- **Persona 2 — O Músico Multi-Instrumentista / Regente:** Alterna rapidamente entre o modo completo (com cifras para instrumentos harmônicos) e o modo de letra pura conforme a necessidade da apresentação.

> **JTBD:** *"Quando estou cantando em uma apresentação ou ensaio com o Modo Teatro ativo, quero alternar para o Modo Cantor com um único toque, para focar exclusivamente na letra da música com máxima legibilidade e sem distrações visuais de cifras ou tablaturas."*

---

## 3. Jornadas do Usuário (UX Flow)

### 3.1 Fluxo Principal: Ativação e Desativação do Modo Cantor
1. O usuário entra no **Modo Teatro** a partir de uma música (`/theater/song/:id`) ou de uma playlist (`/theater/:playlistId`).
2. Na barra de controles do Modo Teatro (`TheaterControls`), o usuário visualiza o botão com ícone de microfone (**Modo Cantor** / *Singer Mode*).
3. Ao clicar no botão de microfone:
   - O Modo Cantor é ativado instantaneamente.
   - As linhas de acordes e tablaturas são ocultadas.
   - Apenas o texto limpo das letras e os marcadores de seção (ex: `[Intro]`, `[Verso 1]`, `[Refrão]`, `[Ponte]`, `[Final]`) permanecem visíveis.
   - O botão de microfone assume estado ativo com destaque visual (cor roxa primária `#8629cc` e indicação clara).
   - O auto-fit recalcula o tamanho ideal da tipografia para preencher a tela harmoniosamente sem quebras indesejadas.
   - Os controles de transposição de tom no painel podem ser ocultados ou receber indicação sutil, mantendo a barra de controles minimalista e focada.
4. Ao clicar novamente no botão:
   - O modo retorna imediatamente à visualização completa de cifras e tablaturas.

### 3.2 Recursos Preservados no Modo Cantor
- **Rolagem Automática (Auto-Scroll):** Play/Pause e ajuste fino de velocidade (1 a 10) continuam 100% operacionais.
- **Tamanho de Fonte Manual:** Botões `A-` e `A+` continuam funcionando para ajuste sob demanda.
- **Navegação na Playlist:** Gestos de swipe (deslizar horizontalmente), atalhos de teclado (Setas Esquerda/Direita) e botões Anterior/Próxima continuam navegando pelas músicas mantendo o Modo Cantor ativo.
- **Tela Cheia & Bloqueio (Wake Lock / Stage Lock):** Bloqueio contra toque acidental e modo tela cheia continuam ativos.
- **Teclado / Pedais de Palco:** Barra de espaço para Play/Pause continua funcionando normalmente.

### 3.3 Fluxos de Exceção
- **Música Instrumental / Sem Letra:** Se a música for puramente instrumental (apenas acordes ou tablaturas), o sistema exibe de forma elegante uma mensagem informativa ou as seções instrumentais sem quebrar a renderização.
- **Música com Letra em Bloco sem Acordes:** O Modo Cantor renderiza o texto normalmente com a mesma fluidez.

---

## 4. Regras de Negócio e Filtragem

1. **Filtragem Estrita de Linhas:**
   - **Linhas de Acordes:** Linhas identificadas como linhas de acordes (densidade $\ge 60\%$ de acordes musicais válidos) são omitidas.
   - **Linhas de Tablatura:** Linhas contendo notação de tablatura (ex: iniciadas por `e|`, `B|`, `G|`, `D|`, `A|`, `E|`) são omitidas.
   - **Linhas de Dedilhado/Strumming:** Linhas contendo setas de batida/ritmo soltas (ex: `↓↑v^`) são omitidas no modo cantor.
   - **Linhas de Letra:** Todo o texto lírico é preservado fielmente.
   - **Cabeçalhos de Seção:** Rótulos entre colchetes (ex: `[Intro]`, `[Verso 1]`, `[Refrão]`, `[Solo]`) são preservados como guia estrutural para o cantor.
2. **Responsividade & Auto-Fit:**
   - Ao ativar o modo cantor, o auto-fit recalcula a largura máxima das linhas de letra para proporcionar o tamanho de fonte ideal sem overflow horizontal.
3. **Persistência de Sessão:**
   - O estado do Modo Cantor pode ser mantido durante a navegação entre músicas da mesma playlist no Modo Teatro.

---

## 5. Requisitos de UI/UX & Design System

- **Design System Pinterest-inspired:**
  - Botão de toggle no `TheaterControls` com cantos arredondados, ícone `Mic` do Lucide React.
  - Estado ativo: destaque na cor primária `#8629cc` com fundo sutil ou texto iluminado.
  - Estado inativo: estilo discreto `text-text-mute hover:text-text-main`.
- **Acessibilidade (a11y):**
  - Atributo `aria-label` e `title` dinâmicos ("Modo Cantor" / "Modo Cifras").
  - `role="button"` e navegação acessível por teclado.
- **Internacionalização (i18n):**
  - Chaves nos arquivos `pt-BR.json`, `en.json` e `es.json` sob a seção `"theater"`:
    - `"singerMode"`: "Modo Cantor" / "Singer Mode" / "Modo Cantante"
    - `"chordsMode"`: "Modo Cifras" / "Chords Mode" / "Modo Acordes"
    - `"singerModeDesc"`: "Ocultar cifras e tablaturas para focar na letra" / "Hide chords and tabs to focus on lyrics" / "Ocultar acordes y tablaturas para enfocarse en la letra"

---

## 6. Critérios de Aceite (Checklist Binário para QA Lead)

- [ ] **AC-01:** O botão "Modo Cantor" (ícone de microfone) está presente e visível na barra de controles do Modo Teatro (`TheaterControls`).
- [ ] **AC-02:** Ao clicar no botão "Modo Cantor", todas as linhas de acordes (cifras) são ocultadas da visualização da música.
- [ ] **AC-03:** Ao clicar no botão "Modo Cantor", todas as linhas de tablaturas (`e|`, `B|`, etc.) e diagramas de ritmo/dedilhado são ocultadas da visualização.
- [ ] **AC-04:** As seções estruturais (ex: `[Intro]`, `[Verso]`, `[Refrão]`) e todo o texto da letra permanecem visíveis e bem formatados.
- [ ] **AC-05:** Clicar novamente no botão restaura a exibição completa das cifras e tablaturas (Modo Cifras).
- [ ] **AC-06:** O auto-scroll (Play/Pause, ajuste de velocidade e barra de espaço) funciona perfeitamente no Modo Cantor.
- [ ] **AC-07:** Os controles de tamanho de fonte (`A-` e `A+`) funcionam perfeitamente no Modo Cantor.
- [ ] **AC-08:** A navegação entre músicas da playlist (swipe, setas e botões) preserva o estado do Modo Cantor.
- [ ] **AC-09:** O botão possui `aria-label` e `title` acessíveis e 100% integrados ao `react-i18next` em pt-BR, en e es.
- [ ] **AC-10:** A suíte de testes unitários do frontend cobre as novas funcionalidades com $\ge 90\%$ no diff e 0 erros de lint.

---

## 7. Classificação de Impacto

- **Nível Consolidado:** **I1 — Padrão** (Fluxo delimitado de interface no Modo Teatro sem alteração de contratos públicos ou regras de banco de dados).
- **Sinais:** Modificação no componente `ChordSheet`, acréscimo de controle no `TheaterControls`, gerenciamento de estado no `TheaterModePage`, suporte a i18n.
- **Gates Exigidos:** Testes unitários no frontend com $\ge 90\%$ de cobertura no diff, 0 erros no ESLint e verificação dos critérios de aceite pelo QA Lead.
