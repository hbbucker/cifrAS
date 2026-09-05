# Especificação da Nova Landing Page com Recursos Expandidos — CifrAS

## 1. Problem Statement
A Landing Page atual do CifrAS possui apenas um cabeçalho simples e 3 cartões genéricos de funcionalidades. Novos usuários e visitantes não conseguem visualizar a amplitude dos recursos do aplicativo (como transposição inteligente com enarmonia, modo teatro com rolagem automática suave ajustável, setlists com Drag-and-Drop, colaboração para bandas e grupos, editor de cifras estruturadas e responsividade total para uso em pedestais e estantes de partitura).

## 2. Objetivos
- [ ] Expandir a seção de recursos apresentando os 6 pilares centrais do produto de forma visual e intuitiva.
- [ ] Incluir um preview interativo/demonstrativo de cifra no Hero com controle rápido de tom e simulação de rolagem.
- [ ] Adicionar seção de fluxo de uso prático ("Como Funciona em 3 Passos").
- [ ] Garantir 100% de responsividade mobile-first com layouts específicos para Desktop (PC), Tablet (estantes musicais) e Smartphone.
- [ ] Manter internacionalização total (`useTranslation`) para Português (pt-BR), Inglês (en) e Espanhol (es), sem strings hardcoded.
- [ ] Garantir conformidade com o Design System (TailwindCSS, cores `#aa3bff` / `#9926f0` e `#e60023`, `rounded-md` 16px, sem sombras pesadas, alvos de toque >= 44px).
- [ ] Cobertura de testes unitários >= 90% nas alterações.

## 3. Classificação de Impacto
- **Impacto**: I1 (Interface, Internacionalização e Testes de Frontend)
- **Risco**: Baixo (página pública de entrada, sem alterações de persistência ou schema de backend).

## 4. User Stories & Critérios de Aceite (AC)

### AC-01: Hero Section Rico e Responsivo
- **Dado** que o visitante acessa a página inicial `/`,
- **Quando** a tela for renderizada,
- **Então** o Hero deve exibir a headline principal, badge de destaque, subtítulo explicativo e botões de ação ("Comece Gratuitamente" / "Explorar Recursos"), além de um card visual simulando uma cifra com controle de transposição e auto-scroll.

### AC-02: Grade com 6 Recursos Principais
- **Dado** que o visitante rola até a seção de recursos (`#features`),
- **Quando** visualizado em:
  - **Desktop (≥ 1024px)**: Deve exibir um grid de 3 colunas.
  - **Tablet (768px - 1023px)**: Deve exibir um grid de 2 colunas.
  - **Smartphone (≤ 640px)**: Deve exibir 1 coluna fluida com botões acessíveis.
- **Então** deve listar os 6 recursos:
  1. Transposição Instantânea & Enarmonia (sustenidos/bemóis como Bb/Eb).
  2. Modo Teatro & Rolagem Suave (velocidades 1-10 e tela cheia).
  3. Setlists & Playlists Dinâmicas (Drag-and-Drop).
  4. Grupos & Bandas Colaborativas (sincronização de tons e repertório).
  5. Editor Estruturado & Busca Global (acordes atômicos).
  6. 100% Otimizado para Pedestal & Palco (toques rápidos).

### AC-03: Seção "Como Funciona na Prática"
- **Dado** que o visitante visualiza a seção do fluxo prático,
- **Então** deve apresentar 3 etapas simples e diretas:
  1. Importe ou crie sua cifra.
  2. Monte e personalize sua setlist.
  3. Ative o Modo Teatro e toque ao vivo sem virar páginas.

### AC-04: Banner CTA de Conversão e Rodapé
- **Dado** que o visitante chega ao fim da página,
- **Então** deve ser exibido um banner de incentivo para criação de conta com redirecionamento para `/login` (ou `/dashboard` se autenticado), além de rodapé com links institucionais e suporte a idiomas.

### AC-05: Internacionalização Completa (i18n)
- **Dado** a troca de idioma do sistema ou navegador,
- **Então** todos os novos títulos, badges, descrições e botões devem estar traduzidos em `pt-BR.json`, `en.json` e `es.json`.
