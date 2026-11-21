# SPEC-PEDAL-01: Integração de Pedais Bluetooth (Page Turners) & Simulador de Palco

## 1. Visão Geral & Proposta de Valor
Músicos amadores e profissionais que tocam instrumentos com as duas mãos ocupadas (violão, guitarra, teclado, baixo, violino) necessitam passar páginas de cifras e controlar a rolagem sem interromper a execução musical.
Esta funcionalidade traz suporte nativo e universal a **Pedais de Passagem de Página Bluetooth (HID)** (PageFlip, AirTurn, Donner, Lekato, iRig, pedais genéricos), com:
1. **Configuração Dedicada & Zero-Config:** Página exclusiva de configuração (`/settings/pedals` ou seção em `/settings`), mantendo o Modo Teatro limpo de menus complexos.
2. **Simulador de Palco Interativo (Sandbox):** Área de teste com cifra de exemplo (*Lorem Ipsum*) para validação imediata das pisadas e sensibilidade antes do show.
3. **Tour Guiado de Novidade (CoachMarks):** Apresentação contextual de onboarding para novos usuários no Modo Teatro e na tela de configurações.
4. **Divulgação na Home & Dashboard:** Destaque na Landing Page pública e banner de novidade no Dashboard do usuário.

---

## 2. Personas e Cenários de Uso
- **Violonista / Guitarrista em Apresentação Solo / Banda:** Conecta o pedal Bluetooth ao tablet. Ao tocar no Modo Teatro, pisa no pedal direito para rolar suavemente a cifra em 65% da tela sem errar o tempo da música.
- **Músico em Ensaio:** Acessa a tela de Configurações, testa a resposta do pedal no Simulador integrado com a cifra de teste e ajusta a fração de rolagem ao seu gosto antes de entrar na playlist.

---

## 3. Critérios de Aceite (Acceptance Criteria)

### AC-01: Painel Dedicado de Configuração de Pedais
- Localizado em `/settings` (seção de Pedais Bluetooth) com interface limpa seguindo o design system Pinterest-inspired (raio 16px/32px, cor `#aa3bff`, sem sombras pesadas).
- Seletor de Perfil:
  - **Plug-and-Play Automático (Padrão):** Aceita `PageDown`/`PageUp`, `ArrowDown`/`ArrowUp`, `ArrowRight`/`ArrowLeft`.
  - **Personalizado / Aprender Tecla:** Permite mapear teclas específicas para cada ação através de escuta de eventos.
- Ajuste de Fração de Rolagem (Salto de Página): slider de 40% a 90% da altura da tela (padrão 65%).

### AC-02: Simulador de Modo Teatro (Área de Teste com Lorem Ipsum)
- Integrado na página de configuração ao lado do painel de ajustes.
- Renderiza uma cifra de teste estruturada com acordes e letra.
- Responde em tempo real às pisadas no pedal, executando rolagem suave e exibindo HUD visual discreto de feedback (ex.: *"Pedal detectado: Rolando bloco [PageDown]"*).

### AC-03: Suporte no Modo Teatro (Palco)
- No `TheaterModePage`, o hook de controle de pedal escuta eventos globais de teclado (quando nenhum `input`/`textarea` está focado).
- Executa a ação configurada (rolagem por bloco, play/pause de autoscroll ou navegação de música na playlist).
- Previne comportamentos conflitantes padrão do navegador (`e.preventDefault()`).

### AC-04: Tour Guiado de Novidade (CoachMarks)
- **Modo Teatro:** CoachMark de anúncio ("Novidade: Pedais Bluetooth") com link para `/settings` no primeiro acesso.
- **Configuração de Pedais:** Tour de 3 passos (`pedal-tour-presets`, `pedal-tour-mapping`, `pedal-tour-simulator`) explicando o Plug-and-Play, personalização e o simulador.
- Persistência no perfil/storage para evitar reexibição indesejada e botão de reabrir tour sob demanda.

### AC-05: Divulgação na Landing Page e Dashboard
- **Landing Page:** Card de recurso com destaque na grade de features ("Controle por Pedal Bluetooth") e menção no fluxo de palco.
- **Dashboard:** Banner de novidade com CTA direto para a configuração e teste do pedal.

### AC-06: Internacionalização (i18n)
- Todos os textos, títulos, badges, tooltips e passos do tour extraídos para dicionários de tradução (`pt`, `en`, `es`).

---

## 4. Classificação de Impacto
- **Nível de Impacto:** **I1** (Frontend Feature pura — sem migração de banco de dados ou impacto crítico de backend).
