# Specification: FE-ONBOARDING-02 - Novos Recursos Discovery

## 1. Visão Geral (Specify)
**Problema:** Os usuários não estão descobrindo as novas funcionalidades: "Persistência de Tom" e "Configurações de Modo Teatro".
**Objetivo:** Criar um fluxo de onboarding ativo e focado (Feature Discovery) para instruir os usuários no primeiro acesso às telas onde esses recursos existem.
**Abordagem:** Seguir o padrão introduzido em `FE-ONBOARDING-01`, mas introduzindo um foco maior. Optamos por um **Modal de Novidades (FeatureDiscoveryModal)** com overlay translúcido para focar a atenção, obrigando o usuário a interagir clicando em "Entendi".

## 2. Design Visual & UX (Design)
- **Estética Pinterest:** Interface limpa, cards em surface card (`#f6f6f3`) ou roxo primário. 
- **Raio de Borda:** 16px para botões (`rounded-2xl` ou `rounded-xl`), 32px para o container do modal (`rounded-[32px]`).
- **Componente: `FeatureDiscoveryModal`**
  - **O que é:** Um modal focado para anúncios de novas funcionalidades de alto valor.
  - **Background:** Overlay preto 50% de opacidade (`bg-black/50`), sem blur exagerado para manter leveza visual.
  - **Card:** Fundo branco (`bg-white`) ou surface (`#fbfbf9`), bordas arredondadas de 32px (`rounded-[32px]`), flat (sem sombras pesadas).
  - **Header:** Ícone ilustrativo (ex: `Sparkles` usando Lucide Icons) contido em um círculo `rounded-full` de cor roxa leve (`bg-[#8629cc]/10`).
  - **Typography:**
    - Título (Ink `#000000`): Fonte bold. Ex: "Novidades no CifrAS!"
    - Corpo (Body `#33332e`): Explicação clara de:
      1. **Persistência de Tom:** O tom escolhido agora é salvo automaticamente para a próxima vez.
      2. **Modo Teatro:** Novas configurações disponíveis durante a performance.
  - **Botão de Ação:** Botão roxo primário (`#8629cc`), 16px radius, texto "Entendi!".

### 2.1. Fluxo e Interação
1. **Gatilho:** O usuário entra na tela de uma música (`SongPage`).
2. **Verificação:** O `localStorage` é consultado (chave: `feature_discovery_02_seen`).
3. **Exibição:** Se `false`, o `FeatureDiscoveryModal` é renderizado após 1 segundo de delay.
4. **Interação:** O usuário lê as novidades e deve obrigatoriamente clicar em "Entendi" (o click no overlay escurecido *não* deve fechar o modal, exigindo ação explícita).
5. **Encerramento:** O estado no `localStorage` é atualizado para `true` e o modal desaparece de forma suave.

## 3. Escopo Funcional (MVP)
- **INCLUSO:**
  - Componente `FeatureDiscoveryModal.tsx`.
  - Textos usando `react-i18next` (chaves em `pt-BR` e afins para onboarding).
  - Integração no ciclo de vida de renderização do `SongPage.tsx`.
  - Controle de visualização persistido via `localStorage`.
- **FORA DO ESCOPO:**
  - Tours guiados (tipo "step-by-step"). Manteremos simples: apenas um modal informativo central.
  - Sincronização deste estado (seen/unseen) no banco de dados (Supabase). O `localStorage` atende perfeitamente à necessidade de UX imediata.

## 4. Handoff Técnico (PO & Engenharia)
A etapa de Especificação e Design está concluída. As próximas etapas (Tasks) envolvem:
1. Criar o componente `FeatureDiscoveryModal` seguindo o design system.
2. Adicionar as chaves de tradução no i18n.
3. Inserir a renderização do modal no `SongPage.tsx`.
4. Garantir cobertura E2E (Playwright) para o modal (garantir que não bloqueie testes de outras features, dispensando o modal ou mockando o localStorage).
