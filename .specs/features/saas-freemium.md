# Spec: SaaS Freemium & Licenciamento Comercial

## 1. Visão Geral
Transição do projeto CifrAS para um modelo **SaaS Freemium** com proteção de licenciamento Source-Available. O código permanece aberto para inspeção, mas a exploração comercial como serviço de nuvem é exclusiva do proprietário. O aplicativo contará com cotas para forçar a conversão e um sistema administrativo para gestão de assinaturas e promoções.

## 2. Escopo
- **Licenciamento:** Adoção de licença Source-Available.
- **Repositório:** Restrição das doações exclusivamente para o ambiente do GitHub.
- **Backend (Quarkus):** Controle de cotas para usuários Free e processamento automático de pagamentos via Webhooks (Stripe).
- **Frontend (React):** Ocultação de doações, Página de Preços Multidioma (PT-BR, EN, ES) e bloqueios de interface (Paywall).
- **Admin (codebase-admin):** Gestão manual de usuários (concessão de acessos PRO gratuitos) e suporte estratégico a campanhas.

## 3. Critérios de Aceite (ACs)

**AC1: Proteção Legal e Repositório**
- Arquivo `LICENSE` consolidado na raiz proibindo concorrência comercial (SaaS).
- Arquivo `.github/FUNDING.yml` e `README.md` focados em apoio de desenvolvedores.

**AC2: Cotas do Plano Free e Webhooks (Backend/Quarkus)**
- Bloqueio de criação para usuários `FREE` acima de:
  - **10 Cifras/Músicas**.
  - **1 Playlist**.
  - **1 Grupo** (até **3 membros**).
- Integração de Webhooks do Stripe para garantir que o status do usuário mude para `PRO` de forma automática.
- O valor do plano é gerenciado externamente pelo Stripe (Dashboard), sem necessidade de CRUD de preços no backend.

**AC3: Paywall, Checkout e Pricing (Frontend/React)**
- Remoção total de links de "Doação" no app principal.
- Exibição de Modal de Paywall oferecendo o plano PRO ao atingir os limites.
- **Página de Preços (/pricing):** Criação de uma página dedicada comparando os limites do plano Free com as vantagens do plano PRO.
- **Internacionalização (i18n):** A página de preços e o modal de paywall devem estar obrigatoriamente traduzidos para **PT-BR, EN e ES**.
- O fluxo de pagamento deve suportar a inserção de Cupons/Promocodes.

**AC4: Gestão no Painel Administrativo (codebase-admin)**
- **Dashboard de Usuários:** Visão clara de usuários Free e PRO.
- **Bypass Manual:** Liberação manual do plano `PRO` para parceiros e testadores.
- **Gestão de Cupons:** Suporte a cupons gerados no Stripe.

## 4. Notas Técnicas e UI/UX
- O fluxo financeiro usará o Stripe Checkout Hospedado.
- A segurança das cotas é garantida via backend Quarkus.
