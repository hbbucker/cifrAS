# Tasks Breakdown: Multi-Provider Song Import

**Feature:** `multi-provider-song-import`  
**Author:** Tasks Planner (sob autoridade técnica do CTO)  
**Status:** READY FOR IMPLEMENTATION  

---

## Task Matrix & Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│ T1: Backend Base - Strategy & ScraperRegistry               │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│T2: UltGuitar │        │T3: LaCuerda  │        │T4: Chordie & │
│   Provider   │        │   Provider   │        │   E-Chords   │
└──────┬───────┘        └──────┬───────┘        └──────┬───────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ T5: Backend UseCase & Resource Integration                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│ T6: Frontend Modal & Badges  │        │ T7: Frontend i18n & Tests    │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## Tasks Detalhadas

### Backend (CTO)

- [ ] **T1: Infraestrutura de Provedores & Registry**
  - Criar `SongScraperProvider` interface.
  - Implementar `SongScraperRegistry` com injeção de `@Any Instance<SongScraperProvider>`.
  - Refatorar `CifraClubScraper` para implementar `SongScraperProvider` (`CifraClubSongScraper`).

- [ ] **T2: Provedor Ultimate Guitar (`UltimateGuitarSongScraper`)**
  - Implementar parser de JSON/HTML para `ultimate-guitar.com`.
  - Converter tags `[ch]...[/ch]` e normalizar seções em inglês.
  - Extrair tom original (`originalKey`), título e artista.
  - Criar testes unitários com fixtures HTML em `src/test/resources/fixtures/ultimate-guitar/`.

- [ ] **T3: Provedor LaCuerda.net (`LaCuerdaSongScraper`)**
  - Implementar tratamento de charset `ISO-8859-1` e `UTF-8`.
  - Normalizar seções em espanhol (`[Coro]`, `[Verso]`, `[Estribillo]`, `[Puente]`).
  - Suportar conversão de notação de notas latinas (`Do, Re, Mi, ...`) para internacional (`C, D, E, ...`).
  - Criar testes unitários com fixtures HTML em `src/test/resources/fixtures/lacuerda/`.

- [ ] **T4: Provedores Chordie & e-Chords (`ChordieSongScraper` & `EChordsSongScraper`)**
  - Implementar parser de ChordPro para Chordie.
  - Implementar parser de `<pre id="core">` e sanitização de tags `<u>` para e-Chords.
  - Criar testes unitários com fixtures.

- [ ] **T5: Integração do UseCase e Resource**
  - Atualizar `ImportSongUseCase` para injetar `SongScraperRegistry`.
  - Criar testes de integração em `SongResourceTest` e `ImportSongUseCaseTest`.

### Frontend (Frontend Staff)

- [ ] **T6: Interface do Modal de Importação Multi-Provedor (`ImportSongModal.tsx`)**
  - Atualizar layout com badges visuais dos 5 provedores (`Cifra Club`, `Ultimate Guitar`, `LaCuerda`, `Chordie`, `e-Chords`).
  - Adicionar detecção e destaque dinâmico de URL.
  - Exibir dicas de formato e tratamento de erros amigável.

- [ ] **T7: Internacionalização & Testes Frontend**
  - Atualizar dicionários i18n (`pt`, `en`, `es`) com textos em português, inglês e espanhol.
  - Criar/atualizar testes com Vitest em `ImportSongModal.test.tsx`.
