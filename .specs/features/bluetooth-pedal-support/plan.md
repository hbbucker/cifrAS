# Plano Técnico de Implementação: Suporte a Pedais Bluetooth & Simulador

## 1. Arquitetura Frontend

### 1.1 Hook Reutilizável de Controle de Pedais (`usePedalController`)
- **Responsabilidade:** Gerenciar escuta de eventos de teclado (HID Bluetooth), debounce de repetição de tecla e despacho das ações correspondentes (Scroll por bloco, Alternar AutoScroll, Próxima/Anterior música na playlist).
- **Parâmetros:**
  - `containerRef`: Referência ao container rolável (`HTMLDivElement`).
  - `onNextSong?`: Callback para avançar música (se aplicável).
  - `onPrevSong?`: Callback para retroceder música (se aplicável).
  - `onToggleAutoScroll?`: Callback para alternar play/pause de autoscroll.
  - `onTriggerFeedback?`: Callback para HUD visual de pisada.
- **Configurações Lidas/Persistidas no LocalStorage:**
  - `cifras_pedal_profile`: `'default'` | `'custom'`
  - `cifras_pedal_scroll_step`: porcentagem de salto (padrão `65`)
  - `cifras_pedal_custom_keys`: mapeamento personalizado de teclas

### 1.2 Componentes de Interface
1. **`PedalSettingsSection.tsx` / `PedalSettingsCard.tsx`:**
   - Painel integrado à página de configurações (`SettingsPage.tsx`).
   - Gerenciamento de presets (Plug-and-Play padrão e captura de novas teclas).
   - Sliders de sensibilidade e seletores de ação.
2. **`PedalSimulator.tsx`:**
   - Visualizador de cifra simulada (*Lorem Ipsum*) com acordes.
   - Integração com `usePedalController` em ambiente sandbox isolado.
   - HUD flutuante com feedback visual da tecla pressionada e ação disparada.
3. **`PedalFeatureBanner.tsx`:**
   - Banner responsivo no `DashboardPage.tsx` informando sobre o novo recurso.
4. **Atualizações em `LandingPage.tsx`:**
   - Card de divulgação na grade de recursos e menção na seção "Como Funciona no Palco".
5. **Tour Guiado (`TourContext` & `CoachMark`):**
   - IDs de tour: `pedal-theater-announcement`, `pedal-settings-tour`.

---

## 2. Estratégia de Testes (Coverage Gate ≥ 90%)
- **Testes Unitários (Vitest + Testing Library):**
  - `usePedalController.test.ts`: testar captura de teclas padrão (`PageDown`, `PageUp`, `ArrowDown`, `ArrowUp`), prevenção de eventos padrão, bloqueio em elementos `input`/`textarea`, saltos percentuais de scroll.
  - `PedalSettings.test.tsx`: testar alternância de perfis, captura de tecla personalizada e persistência no localStorage.
  - `PedalSimulator.test.tsx`: testar resposta do simulador e acionamento do HUD visual.
- **Testes de Integração / E2E (Playwright):**
  - Simulação de navegação no Modo Teatro via teclas de pedal (`PageDown`, `PageUp`).
  - Fluxo completo de configuração e teste no simulador.

---

## 3. Avaliação de ADR
- Não há necessidade de alteração de banco ou introdução de novas dependências externas; a solução utiliza a API nativa de eventos do DOM (`KeyboardEvent` via Bluetooth HID).
