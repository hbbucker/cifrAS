# CifrAS — Roadmap Oficial

> Documento canônico de planejamento, ciclo de vida e evolução do produto CifrAS.  
> Governança: Startup OS (CEO / CPO / CTO)

---

## Entregas Recentes (Concluídas)

- [x] **[song-editor-fullscreen-preview]** Modo Tela Cheia e Live Preview Dividido no Editor: Experiência imersiva no formulário de músicas com Live Preview em tempo real, seletor de modos (Editor/Split/Preview), linha guia responsiva de quebra (37/40 colunas), atalhos Esc/Ctrl+S e onboarding guiado. status: completed release: v1.5.0 date: 2026-11-07
- [x] **[theater-landscape-orientation]** Orientação Landscape e Quebra Manual de Colunas no Modo Teatro: Suporte a rotação horizontal destravada no PWA, marcador de quebra explícita de coluna `[coluna]`, botão dedicado no editor, balanceamento inteligente e CoachMarks contextuais. status: completed release: v1.4.0 date: 2026-11-07
- [x] **[landscape-columns-and-fullwidth]** Múltiplas Colunas e Expansão Full Width no Modo Teatro: Renderização em 2 colunas balanceadas com prevenção de quebra de versos, largura total automática e persistência de tamanho de fonte sincronizada. status: completed release: v1.3.0 date: 2026-09-07
- [x] **[fix-chordsheet-blank-line-height]** Espaçamento Compacto de Linhas em Branco no ChordSheet: Otimização da altura de linhas vazias para 12px fixos, eliminando gaps excessivos entre estrofes e preservando controle de fonte. status: completed release: v1.2.2 date: 2026-09-07
- [x] **[bug-pwa-icon-01]** Correção e Padronização dos Ícones de Instalação PWA: Resolução de inconsistências de manifest e assets vetoriais/rasterizados para instalação em dispositivos móveis e desktop. status: completed release: v1.2.1 date: 2026-09-03
- [x] **[fe-onboarding-06-groups-tour]** Onboarding Guiado de Grupos e Playlists Compartilhadas: Sistema de CoachMarks e tours encadeados para criação de grupos, convites de integrantes e compartilhamento colaborativo com Empty States educativos. status: completed release: v1.2.0 date: 2026-09-03
- [x] **[admin-user-blocking]** Bloqueio, Moderação e Auditoria de Usuários no Admin: Sistema completo de moderação e governança com justificativa obrigatória, trilha imutável em user_audit_logs, bloqueio imediato e proteção contra auto-bloqueio. status: completed release: v1.1.0 date: 2026-08-25
- [x] **[theater-persistent-header]** Cabeçalho Persistente e Badges de Tom no Modo Teatro: Título e artista visíveis continuamente no topo da tela, badge de tom atual vs original e controles com auto-hide inteligente. status: completed release: v1.0.0 date: 2026-09-06
- [x] **[user-feedback-channel]** Canal Integrado de Feedback do Usuário: Envio de sugestões e relatos de problemas diretamente pelo app com painel administrativo dedicado para triagem. status: completed release: v1.0.0 date: 2026-08-26
- [x] **[song-tags-classification]** Classificação de Músicas por Tags e Filtros Rápidos: Catalogação por tags livres com autocompletar no formulário, barra de filtros horizontal e índice GIN invertido no PostgreSQL. status: completed release: v1.0.0 date: 2026-08-24
- [x] **[playlist-theater-start-song]** Iniciar Modo Teatro a partir de Música Selecionada: Ação de execução individual por faixa na playlist com setlist completa carregada para navegação sequencial. status: completed release: v1.0.0 date: 2026-08-22
- [x] **[theater-singer-mode]** Modo Cantor sem Cifras no Modo Teatro: Visualização focada exclusivamente na letra e seções estruturais com supressão de acordes, tablaturas e ritmos, mantendo auto-scroll. status: completed release: v1.0.0 date: 2026-08-18
- [x] **[playlist-presentation-export]** Exportação de Apresentações de Slides PPTX e Letras Limpas: Geração client-side de PowerPoint 16:9 de alto contraste para telões com temas visualmente adaptáveis e limpeza de cifras. status: completed release: v1.0.0 date: 2026-08-18
- [x] **[mobile-brand-identity-and-icon]** Identidade Visual Mobile e Novo Ícone The Chord Pick: Top bar mobile de 52px, ícone vetorial proprietário (palheta + C + acordes), atualização de favicon e telas centrais. status: completed release: v1.0.0 date: 2026-08-18
- [x] **[group-members-management]** Gestão Completa de Membros e Convites em Grupos: Listagem com badges de papel, contagem O(1), envio/cancelamento de convites e ações de moderação com modais de confirmação. status: completed release: v1.0.0 date: 2026-08-18
- [x] **[song-sharing]** Compartilhamento Direto de Músicas por E-mail: Fluxo com convite, aceite/recusa, clonagem isolada para o destinatário, modal acessível e badge de pendências no menu mobile. status: completed release: v1.0.0 date: 2026-08-18
- [x] **[fe-onboarding-05-theater-pptx-tour]** Tour Sequencial do Gerador de Slides e Modo Teatro: Onboarding contextual para apresentação em telões e navegação imersiva de palco. status: completed release: v1.0.0 date: 2026-09-03
- [x] **[fe-onboarding-04-playlist-tour]** Tour Guiado e Empty States para Playlists e Músicas: Guia de primeiro uso para montagem de repertório e gerenciamento de setlists. status: completed release: v1.0.0 date: 2026-09-03
- [x] **[fe-onboarding-02]** Discovery Modal e Onboarding de Transposição e Persistência: Apresentação de novas capacidades e preferências de tom para usuários ativos. status: completed release: v1.0.0 date: 2026-08-15
- [x] **[fe-onboarding-01]** Empty State Educativo e Tooltips de Primeiro Uso: Orientação em 3 passos para novos músicos cadastrados na plataforma. status: completed release: v1.0.0 date: 2026-07-25
- [x] **[cifraclub-import]** Importação Automática de Músicas do CifraClub: Scraper e parser de cifras estruturadas com conversão automática para o formato canônico JSON do CifrAS. status: completed release: v1.0.0 date: 2026-07-20
- [x] **[dashboard-favorites]** Filtragem e Gestão de Músicas Favoritas: Marcação rápida de favoritos no dashboard e persistência no perfil do usuário. status: completed release: v1.0.0 date: 2026-07-20
- [x] **[user-preferences-settings]** Preferências de Notação, Enarmonia e Velocidade: Customização de sustenidos/bemóis (Bb/Eb), velocidade padrão de rolagem e tamanho tipográfico. status: completed release: v1.0.0 date: 2026-07-15
- [x] **[theater-session-state]** Persistência de Sessão e Estado do Modo Teatro: Sincronização de estado de rolagem, tamanho de fonte e configurações durante a performance. status: completed release: v1.0.0 date: 2026-07-27
- [x] **[infra-ci-cd-observability]** Pipeline CI/CD Automatizado e Observabilidade: Build, lint, testes automatizados no GitHub Actions, health checks SmallRye e deploy contínuo no Fly.io. status: completed release: v1.0.0 date: 2026-07-26
- [x] **[auth-and-user-profile]** Autenticação Supabase JWT e Google OAuth: Login seguro, proteção de rotas frontend, validação offline de tokens via JWKS e perfil de usuário. status: completed release: v1.0.0 date: 2026-05-22
- [x] **[song-crud-core]** CRUD Completo de Músicas com Cifras em JSON: Gestão de acordes posicionais e letras integradas sem parsing frágil de texto livre. status: completed release: v1.0.0 date: 2026-05-22
- [x] **[transposition-engine]** Motor de Transposição Cromática em Tempo Real: Transposição stateless instantânea nos 12 semitons cromáticos com suporte a acordes complexos. status: completed release: v1.0.0 date: 2026-05-22
- [x] **[playlist-management]** CRUD e Organização de Playlists com Reordenação: Agrupamento de setlists para apresentações com suporte a drag-and-drop. status: completed release: v1.0.0 date: 2026-05-22
- [x] **[theater-mode-core]** Modo Teatro com Tela Cheia e Auto-Scroll: Visualização focada para palco com controles táteis em tempo real e rolagem configurável. status: completed release: v1.0.0 date: 2026-05-22

---

## Em Andamento

- [ ] **[gtm-beta-acquisition]** Go-to-Market e Aquisição de Beta Testers: Tração hand-to-hand com músicos e líderes de bandas/igrejas, captação de feedback e validação de retenção. status: in_progress priority: P1 target: v1.6.0
- [ ] **[performance-optimization]** Otimização de Performance e Core Web Vitals: Garantir LCP abaixo de 3s no frontend e latência p95 abaixo de 300ms nos endpoints REST do backend. status: in_progress priority: P1 target: v1.6.0

---

## Próximas Fases

- [ ] **[accessibility-wcag-audit]** Auditoria Completa de Acessibilidade WCAG 2.1 AA: Revisão e conformidade em navegação por teclado, leitores de tela, contrastes e landmarks ARIA. status: planned priority: P2 target: v1.6.0
- [ ] **[advanced-search]** Busca Full-Text Otimizada no Catálogo de Músicas: Pesquisa avançada com PostgreSQL Full-Text Search indexando título, artista, tags e trechos de letras. status: paused priority: P2 target: v1.7.0
- [ ] **[offline-pwa-sync]** Suporte Offline PWA com Sincronização Local: Cache completo de cifras e playlists via Service Worker para uso em palcos e igrejas sem sinal de internet. status: planned priority: P3 target: v2.0.0
- [ ] **[fretboard-chords-diagram]** Diagrama Interativo de Acordes e Braço de Instrumentos: Exibição visual de desenhos de acordes no braço do violão e variações de dedilhado. status: planned priority: P3 target: v2.0.0
- [ ] **[pdf-sheet-music-import]** Upload e Extração Inteligente de PDFs e Partituras: Parser OCR e estruturação automática de cifras a partir de arquivos PDF e fotos. status: planned priority: P3 target: v2.0.0
- [ ] **[push-notifications-groups]** Notificações Push para Atualizações em Grupos: Avisos automáticos de novas músicas adicionadas a repertórios e alterações de setlist de ensaio. status: planned priority: P3 target: v2.0.0
- [ ] **[native-mobile-app]** Aplicativo Nativo iOS e Android: Versão nativa mobile desenvolvida com React Native para máxima performance e integração com hardware. status: planned priority: P3 target: v2.0.0
