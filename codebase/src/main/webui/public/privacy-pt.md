# 🛡️ Política de Privacidade e Segurança do CifrAS

Última atualização: **Junho de 2026**

O **CifrAS** leva a sua privacidade muito a sério. Esta Política de Privacidade descreve como coletamos, usamos, protegemos e armazenamos as suas informações quando você utiliza nossa plataforma de cifras e transposição de acordes. 

Nosso compromisso está alinhado com a **LGPD (Lei Geral de Proteção de Dados Pessoais - Lei nº 13.709/2018)** e melhores práticas internacionais de segurança da informação (como a GDPR).

## 1. Quais Dados Coletamos?

Para que o CifrAS funcione e ofereça a melhor experiência musical, coletamos o mínimo de dados necessários (Princípio da Minimização):

* **Dados de Cadastro (Autenticação):** Nome, endereço de e-mail e senha criptografada (gerenciados com segurança via provedor de identidade).
* **Dados de Integração (Google Drive):** Quando você opta por conectar o CifrAS ao seu Google Drive para importar documentos, nós solicitamos acesso de leitura aos seus arquivos. Armazenamos apenas os **Tokens de Acesso** fornecidos pelo Google (OAuth 2.0). **Nós não armazenamos sua senha do Google.**
* **Dados de Uso (Conteúdo):** As cifras criadas, playlists organizadas e configurações de interface (ex: Modo Teatro, transposição padrão).

## 2. Como Usamos Seus Dados?

Os seus dados são utilizados estritamente para o funcionamento da plataforma:

* **Autenticação:** Para permitir que você acesse sua conta de qualquer dispositivo.
* **Importação de Cifras:** O token do Google Drive é usado **exclusivamente** para listar e extrair o texto dos documentos (Google Docs, DOCX) que você escolher importar para o aplicativo. 
* **Sincronização:** Para manter suas playlists e configurações de transposição de acordes salvas na nuvem.

*O CifrAS não vende, não aluga e não compartilha seus dados pessoais ou arquivos importados com anunciantes ou terceiros para fins de marketing.*

## 3. Como Protegemos Seus Dados?

A segurança dos seus dados é nossa prioridade técnica. Implementamos as seguintes medidas de segurança:

* **Criptografia em Repouso (LGPD):** Todos os tokens de acesso (como o *Refresh Token* do Google Drive) são fortemente criptografados no nosso banco de dados (padrão de mercado AES-256). Mesmo em caso de vazamento de dados, esses tokens ficam ilegíveis e protegidos.
* **Comunicação Segura:** Todo tráfego de dados é protegido por TLS/SSL (HTTPS).
* **Acesso Limitado:** O banco de dados do CifrAS é protegido com políticas rigorosas de acesso e fica hospedado em infraestrutura de nuvem certificada.

## 4. Compartilhamento com Terceiros

Para operar o aplicativo, dependemos de serviços fornecidos por provedores de nuvem confiáveis e em conformidade com as leis de proteção de dados:

* **Supabase:** Para armazenamento do banco de dados (PostgreSQL) e gerenciamento de autenticação (SSO e Login).
* **Google Cloud / Workspace:** Apenas para autenticação OAuth e acesso pontual à API do Google Drive (quando autorizado por você).
* **Infraestrutura de Hospedagem (Fly.io):** Onde nossos servidores de aplicação estão hospedados.

## 5. Seus Direitos (De Acordo com a LGPD e GDPR)

Você tem controle total sobre os seus dados. A qualquer momento, você pode:

* **Direito de Acesso:** Solicitar uma cópia de todos os dados que temos sobre você.
* **Direito de Correção:** Atualizar informações incorretas ou desatualizadas no seu perfil.
* **Direito de Revogação e Exclusão (Direito ao Esquecimento):** Excluir sua conta e todos os dados associados (cifras, playlists, integrações) de forma permanente dos nossos servidores.
* **Revogação de Integração:** Desconectar o Google Drive a qualquer momento pelas configurações do app, o que deletará imediatamente nossos tokens de acesso. Você também pode revogar o acesso do CifrAS diretamente pelo painel de segurança da sua conta do Google.

## 6. Uso de Cookies

Utilizamos apenas **Cookies Essenciais** (tokens JWT) necessários para manter sua sessão de usuário ativa e segura. O CifrAS não utiliza cookies de rastreamento de terceiros, pixels de publicidade ou ferramentas invasivas de análise de comportamento.

## 7. Contato e Encarregado de Dados (DPO)

Se você tiver dúvidas sobre como tratamos seus dados, quiser exercer seus direitos ou reportar uma preocupação de segurança, entre em contato conosco através do e-mail oficial de suporte da plataforma.
