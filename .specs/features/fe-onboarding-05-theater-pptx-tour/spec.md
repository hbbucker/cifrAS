# Spec: Onboarding Tour — Modo Teatro e Gerador de Slides PPTX

## 1. Visão Geral e Contexto
O usuário solicitou guias de onboarding (Coach Marks e Tour) para os botões de **Gerar Slides (PPTX)** e **Modo Teatro** na visualização de Playlists (`/playlists/:id`).
Ao acessar uma playlist, o usuário precisa entender claramente:
1. Como adicionar músicas (`playlist-add-song`) — já implementado;
2. Como gerar apresentações em PowerPoint / Slides com as letras das cifras para projeção em cultos, missas, shows ou ensaios (`playlist-presentation`);
3. Como acionar o Modo Teatro para execução ao vivo em tela cheia com rolagem automática e controles rápidos (`playlist-theater`).

## 2. Classificação de Impacto
- **Nível consolidado:** I1 (Padrão)
- **Justificativa:** Modificação exclusivamente no frontend (UI/UX de tours e CoachMarks), sem alteração de schemas de banco, contratos de API, autenticação, financeiro ou operações destrutivas.

## 3. Critérios de Aceite Binários (ACs)
- [ ] **AC-01**: Na página `/playlists/:id`, o tour do botão de Gerar Slides (`playlist-presentation`) deve destacar o botão de exportar apresentação (`data-testid="export-presentation-btn"`), orientando sobre a criação de slides com as letras das músicas para projeção.
- [ ] **AC-02**: Na página `/playlists/:id`, o tour do botão de Modo Teatro (`playlist-theater`) deve destacar o botão de iniciar o Modo Teatro (`data-testid="start-theater-btn"`), explicando o recurso de tela cheia, rolagem automática e performance ao vivo.
- [ ] **AC-03**: O `CoachMark` deve suportar transição sequencial (`nextTourId`) permitindo que o usuário avance fluentemente pelo fluxo guiado (`playlist-add-song` -> `playlist-presentation` -> `playlist-theater`) ao clicar em "Próximo".
- [ ] **AC-04**: O fechamento do tour pelo botão de fechar (X) encerra a sequência ativa sem travar a navegação nem poluir a tela.
- [ ] **AC-05**: Todas as novas mensagens, títulos e botões utilizam chaves i18n em Português (`pt-BR.json`), Inglês (`en.json`) e Espanhol (`es.json`), sem nenhuma string hardcoded.
- [ ] **AC-06**: Os testes unitários e de integração frontend cobrem a cadeia de tours, a renderização dos Coach Marks nos botões de apresentação e teatro, e as transições de estado com cobertura ≥ 90% no diff.
