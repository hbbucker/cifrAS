# Feature: Internacionalização (i18n)

## 1. Visão Geral
O sistema deve suportar múltiplos idiomas, garantindo que mensagens, menus e rótulos sejam apresentados no idioma de preferência do usuário ou no idioma padrão do navegador.

## 2. Requisitos

### 2.1. Comportamento Padrão e Fallback (REQ-I18N-001)
- O sistema deve detectar automaticamente o idioma principal configurado no navegador do usuário.
- A detecção e aplicação do idioma do navegador devem ocorrer apenas se o usuário não possuir uma preferência de idioma salva no sistema.

### 2.2. Opções de Idioma Suportadas (REQ-I18N-002)
- O sistema deve oferecer suporte e tradução completa para as seguintes opções:
  - Português (Brasil) - `pt-BR`
  - Inglês - `en`
  - Espanhol - `es`

### 2.3. Interface de Seleção de Idioma (REQ-I18N-003)
- O usuário deve poder escolher seu idioma de preferência através da interface.
- Devem existir dois pontos de acesso para a seleção de idioma:
  - **Menu de Perfil (Canto Superior Direito):** No menu dropdown do ícone do usuário, deve haver uma opção "Language" (ou equivalente traduzido de acordo com o idioma atual) que abre um submenu listando as opções de idiomas.
  - **Menu Inferior (Canto Inferior Esquerdo):** Deve haver um menu de acesso rápido "Language" (ou equivalente traduzido) apresentando o mesmo submenu com as opções de idioma.
- A alteração do idioma deve aplicar-se à aplicação, atualizando os textos visíveis.

### 2.4. Persistência da Preferência do Usuário (REQ-I18N-004)
- A seleção de idioma feita pelo usuário deve ser persistida como uma definição nas preferências do usuário (`UserPreference`) no backend.
- O sistema deve sempre respeitar a configuração persistida do usuário, sobrepondo de forma definitiva a configuração do idioma do navegador.
- Ao carregar a aplicação, a preferência de idioma recuperada do banco de dados deve ditar o idioma renderizado.

### 2.5. Arquivos de Tradução e Textos Estáticos (REQ-I18N-005)
- Devem ser criados, desde já, os arquivos de tradução contendo todo o mapeamento de textos estáticos da interface (mensagens, menus, labels, botões e alertas).
- Os arquivos de tradução devem cobrir integralmente os três idiomas suportados: Inglês (`en`), Português - Brasil (`pt-BR`) e Espanhol (`es`).

## 3. Fora do Escopo Atual
- Internacionalização para conteúdos cadastrados no banco (ex: letras de músicas, playlists). A funcionalidade aplica-se apenas aos textos estruturais da aplicação (UI estática).

## 4. Dependências
- Alteração na entidade/recurso de `UserPreference` no backend (Quarkus) para suportar a nova propriedade de idioma.
- Integração de biblioteca de i18n no frontend Vite/React (como `i18next` e `react-i18next`).
