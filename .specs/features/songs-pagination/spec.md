# Feature Specification: Songs Pagination & Sticky Header

## 1. Visão Geral (Overview)
A tela de listagem de músicas ("Songs") atualmente exibe os itens em uma única lista. Com o aumento do repertório, precisamos implementar paginação para otimizar o carregamento e a usabilidade. O músico precisa de acesso rápido à barra de busca e navegação entre páginas, mantendo a contagem total visível.

## 2. Requisitos Funcionais (Functional Requirements)
- **Paginação de Itens:** A lista de músicas deve ser dividida em páginas, com 20 itens por página.
- **Contagem Total:** Exibir de forma clara o total de músicas cadastradas no sistema.
- **Navegação de Páginas:** Controles visuais para ir para a página anterior, próxima página e páginas numéricas.
- **Sticky Header (Cabeçalho Fixo):** O campo de filtro/pesquisa e a barra de paginação devem ficar fixos (sticky) no topo da tela durante o scroll (rolagem), garantindo acesso contínuo.

## 3. Experiência do Usuário e Design (UX & Design System)
*Baseado no nosso padrão Pinterest-inspired, focado no músico.*

- **Minimalismo e Flat Design:** Sem sombras (no shadows). Uso inteligente de cores de contraste e "whitespace".
- **Bordas Arredondadas (Border Radius):** Utilizar raios de `16px` para os botões de paginação e containers, mantendo a consistência do design system.
- **Sticky Header:** O container que agrupa a busca e a paginação deve ter um fundo sólido opaco (ou blur compatível com o tema) para evitar sobreposição visual ao rolar a grade de músicas (cards) por trás dele.
- **Barra de Paginação:**
  - **Indicador de Total:** Texto sutil substituindo o atual "20 músicas", ex: *"Total: 120 músicas"*, com peso de fonte menor.
  - **Controles de Página:** Botões simples `[ < ]` `[ 1 ]` `[ 2 ]` `[ ... ]` `[ > ]`. A página ativa deve usar a cor primária de destaque (flat), sem sombra. As demais com cor secundária ou contorno suave.
- **Ergonomia Mobile:** Os alvos de toque (touch targets) dos botões de paginação devem ser grandes o suficiente para facilitar a interação no celular.

## 4. Fluxo de Usuário (User Flow)
1. O músico acessa a aba/tela de "Músicas" (Songs).
2. O sistema carrega os primeiros 20 itens e exibe o header com a busca e a paginação, além do total de músicas.
3. O músico rola a tela (scroll) para procurar uma música visualmente. O header (busca + paginação) permanece colado no topo (sticky).
4. Ao chegar no final ou desejar avançar, o músico clica no botão "Próxima" ou no número da página na barra fixa superior.
5. O sistema atualiza a lista de músicas para refletir a nova página (levando o scroll de volta para o topo da lista de forma suave).

## 5. Regras de Negócio (Business Rules)
- **Limite por Página:** Rigorosamente 20 itens por página para manter previsibilidade de consumo de dados e performance.
- **Comportamento da Busca:** Ao realizar uma busca/filtro, o total de itens deve refletir os resultados filtrados, e a paginação deve ser obrigatoriamente resetada para a página 1.
- **Dados Iniciais:** Se houver menos de 20 músicas no total, a barra de navegação de páginas pode ser inativada visualmente ou ocultar controles de navegação, mas o "Total de Músicas" ainda deve ser exibido.

## 6. Critérios de Aceite (Acceptance Criteria)
- [ ] O header contendo a barra de pesquisa e a paginação permanece fixo (sticky) no topo ao rolar a lista de músicas.
- [ ] A listagem exibe no máximo 20 músicas simultaneamente.
- [ ] O texto com o total de músicas cadastradas/encontradas está perfeitamente visível.
- [ ] Os botões de paginação permitem ir para a página seguinte, anterior e selecionar páginas numéricas específicas.
- [ ] O design respeita as diretrizes visuais estritas: botões flat sem sombra, border-radius de 16px, e touch targets grandes apropriados para uso no palco.
- [ ] A filtragem de busca interage corretamente com a paginação (busca nova reseta para página 1 dos resultados da busca).

## 7. Próximos Passos (Next Steps)
- Handoff para o Product Owner (PO) para quebra dessa especificação em User Stories/Tasks técnicas granulares (ex: API limits/offsets, Frontend state management e componentes de UI).
