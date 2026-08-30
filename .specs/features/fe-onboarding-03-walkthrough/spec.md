# Discovery: Transição para Coach Marks e Walkthrough

## 1. O Problema Atual
O modelo atual baseado no `FeatureDiscoveryModal` apresenta falhas de experiência ao escalar:
- **Acúmulo de Informação:** Usuários antigos são forçados a ler sobre funcionalidades que já conhecem junto com as novas.
- **Falta de Contexto:** O modal centralizado descreve recursos que podem não estar visíveis na tela atual, exigindo que o usuário memorize a instrução.
- **Atrito:** Interrompe a jornada do usuário de forma abrupta.

## 2. A Solução Proposta: Coach Marks & Walkthrough
A substituição do modal genérico por uma jornada guiada em etapas (Walkthrough) utilizando "Coach Marks" (balões de dica ancorados em elementos específicos da interface).

### 2.1. Benefícios
- **Contextual:** A dica aparece exatamente sobre o botão ou área nova (ex: botão de Modo Teatro, campo de importação do Cifra Club).
- **Incremental:** Podemos controlar quais "tours" o usuário já viu individualmente.
- **Interativo:** O usuário aprende fazendo.

## 3. Avaliação Técnica (Bibliotecas vs. Customizado)

Dado o nosso rigor de design (Design System inspirado no Pinterest, Tailwind exclusivo), avaliamos as seguintes abordagens:

### Opção A: `react-joyride`
- **Prós:** Padrão de mercado, gerencia o estado do tour perfeitamente.
- **Contras:** Traz sua própria estilização (CSS-in-JS). Pode conflitar com o purismo do Tailwind.

### Opção B: Componente Customizado (Recomendado)
- **Abordagem:** Construir um sistema de `TourProvider` usando React Context e focar elementos usando posições relativas/absolutas ou bibliotecas primitivas (ex: `@floating-ui/react`).
- **Prós:** Controle total, zero dependências pesadas CSS, 100% aderente ao Design System e aos raios de borda rigorosos (16px/32px).

## 4. Próximos Passos (Plano de Ação)
1. Aprovar esta abordagem (Opção B).
2. Remover o antigo `FeatureDiscoveryModal`.
3. Implementar a arquitetura base do `CoachMark`.
4. Aplicar nas novas features (Importação Cifra Club, etc).
