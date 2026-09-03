# Design Arquitetural: Tour do Modo Teatro e Gerador de Slides PPTX

## 1. Arquitetura de Estado e Componentes

### 1.1 Evolução do `TourContext`
Adicionar método `nextTour(nextTourId: string)` no `TourContextType`:
- Marca o `activeTourId` atual como visto no `localStorage` (`tour_seen_${activeTourId} = true`).
- Se `nextTourId` ainda não tiver sido visto, atualiza `activeTourId` para `nextTourId`.
- Caso contrário, encerra o tour (`activeTourId = null`).

### 1.2 Evolução do `CoachMark`
Adicionar a prop opcional `nextTourId?: string`:
- Se `nextTourId` for definido e `confirmText` não for fornecido, o botão exibe por padrão `t('common.next', 'Próximo')`.
- Ao clicar no botão de confirmação, chama `nextTour(nextTourId)` se existir, ou `endTour()`.
- O botão de fechar (X) continua chamando `endTour()`, encerrando a sequência.

### 1.3 Sequenciamento na `PlaylistViewPage`
Na visualização de Playlist (`PlaylistViewPage.tsx`):
1. **Passo 1 (`playlist-add-song`):**
   - Destaca o botão `+ Adicionar Música` (`playlist-add-song-header-btn`).
   - `nextTourId="playlist-presentation"`.
2. **Passo 2 (`playlist-presentation`):**
   - Destaca o botão `Gerar Slides` (`export-presentation-btn`).
   - `nextTourId="playlist-theater"`.
   - Texto de ajuda sobre exportação de slides PPTX com letras para projeção.
3. **Passo 3 (`playlist-theater`):**
   - Destaca o botão `Modo Teatro` (`start-theater-btn`).
   - Texto de ajuda sobre tela cheia, rolagem automática e uso ao vivo.
   - Botão final "Entendi" (`common.gotIt`).

## 2. Dicionário de Internacionalização (i18n)

### `pt-BR`
- `common.next`: "Próximo"
- `playlistView.tourPresentationTitle`: "Gerar Slides (PPTX)"
- `playlistView.tourPresentationDesc`: "Exporte e apresente slides com as letras das músicas da sua playlist para projeção em cultos, missas ou shows."
- `playlistView.tourTheaterTitle`: "Modo Teatro"
- `playlistView.tourTheaterDesc`: "Toque ao vivo com visualização limpa em tela cheia, rolagem automática suave e transposição instantânea."

### `en`
- `common.next`: "Next"
- `playlistView.tourPresentationTitle`: "Generate Slides (PPTX)"
- `playlistView.tourPresentationDesc`: "Export and present slides with the lyrics of your playlist songs for projection in services, masses, or gigs."
- `playlistView.tourTheaterTitle`: "Theater Mode"
- `playlistView.tourTheaterDesc`: "Play live with a clean full-screen view, smooth auto-scroll, and instant chord transposition."

### `es`
- `common.next`: "Siguiente"
- `playlistView.tourPresentationTitle`: "Generar Diapositivas (PPTX)"
- `playlistView.tourPresentationDesc`: "Exporta y presenta diapositivas con las letras de las canciones de tu playlist para proyección en cultos, misas o conciertos."
- `playlistView.tourTheaterTitle`: "Modo Teatro"
- `playlistView.tourTheaterDesc`: "Toca en vivo con vista limpia en pantalla completa, desplazamiento automático suave y transposición instantánea."

## 3. Estratégia de Rollback
Reverter commits do branch `feat/fe-onboarding-05-theater-pptx-tour`. Como as alterações não alteram persistência ou contratos de backend, a reversão é puramente de componentes visuais do frontend.
