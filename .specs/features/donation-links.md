# Spec: Links de Doação e Apoio (Donations)

## 1. Visão Geral
Adicionar canais para recebimento de doações (PIX, Ko-fi e GitHub Sponsors) para ajudar a custear e manter o projeto CifrAS. A integração deve ser discreta, focada na visibilidade sem prejudicar a experiência do usuário.

## 2. Escopo
- **Repositório:** Arquivo de configuração de patrocínio do GitHub e atualização do README.
- **Frontend (WebUI):** Inclusão de botões/links estratégicos para incentivar o apoio da comunidade.

## 3. Critérios de Aceite (ACs)

**AC1: Configuração do GitHub Sponsors**
- Criar o arquivo `.github/FUNDING.yml` configurado para suportar as plataformas escolhidas.

**AC2: Atualização do README.md**
- Adicionar _badges_ (escudos) no topo do arquivo linkando para as plataformas de apoio.
- Adicionar uma seção "☕ Apoie o Projeto" no rodapé, detalhando os motivos para apoiar e fornecendo os links diretos (PIX e Ko-fi).

**AC3: Frontend - Ponto de Entrada (Navegação)**
- Adicionar um link/botão "Apoie" ou "Donate" (com ícone correspondente) no Menu Principal (Sidebar no Desktop, ou menu de perfil/configurações no Mobile).

**AC4: Frontend - Modal/Página de Apoio**
- Ao acessar a área de apoio, o usuário deve ser apresentado a:
  - Opção de PIX: Chave e QR Code (ou apenas a chave com botão "Copiar").
  - Opção de Ko-fi/Outros: Botão redirecionando para a plataforma externa.
  
## 4. Notas Técnicas e UI/UX
- **Design System:** Seguir as diretrizes do CifrAS (TailwindCSS, raios de 16px/32px, sem sombras excessivas, seguindo o padrão minimalista).
- **Tradução:** Todos os textos da interface no WebUI devem ser extraídos e configurados via hooks de tradução (i18n), sem strings hardcoded nos componentes.
- **Hierarquia:** A chamada para doação não deve competir visualmente com o botão primário (Purple Primary) de ações centrais do app.
