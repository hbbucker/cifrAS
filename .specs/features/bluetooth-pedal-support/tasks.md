# Tarefas de Implementação: Suporte a Pedais Bluetooth

- [x] **Task 1: Hook `usePedalController` & Utilitários de Teclado**
  - [x] Criar `src/hooks/usePedalController.ts` com suporte a perfis padrão e customizados.
  - [x] Implementar prevenção de default, debounce e cálculo de salto de página relativo (ex: 65% do clientHeight).
  - [x] Escrever testes unitários em `src/tests/usePedalController.test.ts`.

- [x] **Task 2: Seção de Configuração de Pedais & Simulador de Teste**
  - [x] Criar componente `PedalSettingsSection` e `PedalSimulator` com cifra de teste (*Lorem Ipsum*).
  - [x] Adicionar suporte a HUD visual de pisada em tempo real.
  - [x] Integrar seção na `SettingsPage.tsx`.
  - [x] Escrever testes unitários em `src/tests/PedalSettings.test.tsx` e `src/tests/PedalSimulator.test.tsx`.

- [x] **Task 3: Integração no Modo Teatro (`TheaterModePage`)**
  - [x] Conectar `usePedalController` ao container de rolagem e controles do Modo Teatro.
  - [x] Adicionar suporte à navegação entre músicas da playlist ao atingir o limite de rolagem.
  - [x] Testar cobertura e compatibilidade com AutoScroll e Singer Mode.

- [x] **Task 4: Tour Guiado de Novidade (CoachMarks)**
  - [x] Configurar tour `pedal-settings-tour` (passos 1, 2 e 3) na tela de configurações com `CoachMark`.
  - [x] Escrever testes do fluxo de tour.

- [x] **Task 5: Divulgação na Landing Page & Dashboard**
  - [x] Adicionar card de recurso de pedal na grade de features da `LandingPage.tsx`.
  - [x] Adicionar banner responsivo de novidade `PedalFeatureBanner` no `DashboardPage.tsx`.
  - [x] Escrever testes unitários em `src/tests/PedalFeatureBanner.test.tsx`.

- [x] **Task 6: Internacionalização (i18n) & Validação de Cobertura Final**
  - [x] Inserir chaves de tradução em `pt-BR.json`, `en.json`, `es.json`.
  - [x] Executar pipeline de testes (53 arquivos de teste, 313 testes passando) e validar linter sem erros.
