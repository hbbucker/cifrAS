# Architecture & Technical Design: Multi-Provider Song Import

**Feature:** `multi-provider-song-import`  
**Author:** CTO (Alex Vance)  
**Consolidated Impact:** I2 (Novos Scrapers, Parsers, Strategy Pattern, Test Coverage Gate)  
**Status:** DESIGNED / CONTRACT SEALED  

---

## 1. Arquitetura do Backend

### 1.1 Diagrama de Classes e Strategy Pattern

```
                            ┌────────────────────────┐
                            │   ImportSongUseCase    │
                            └───────────┬────────────┘
                                        │ (Injeta)
                                        ▼
                            ┌────────────────────────┐
                            │   SongScraperRegistry  │
                            └───────────┬────────────┘
                                        │ (Itera / busca provedor)
                                        ▼
                            ┌────────────────────────┐
                            │   «interface»          │
                            │   SongScraperProvider  │
                            │ ────────────────────── │
                            │ + supports(url): bool  │
                            │ + scrape(url): SongReq │
                            └───────────┬────────────┘
                                        │
     ┌──────────────────┬───────────────┼───────────────┬────────────────┐
     ▼                  ▼               ▼               ▼                ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│  CifraClub   ││UltimateGuitar││  LaCuerda    ││   Chordie    ││   EChords    │
│   Scraper    ││   Scraper    ││   Scraper    ││   Scraper    ││   Scraper    │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
```

### 1.2 Interface `SongScraperProvider`
Localizada em `br.com.cifras.song.application.service.provider.SongScraperProvider`:
```java
package br.com.cifras.song.application.service.provider;

import br.com.cifras.song.dto.CreateSongRequest;

public interface SongScraperProvider {
    /**
     * Retorna true se este provedor sabe processar a URL fornecida.
     */
    boolean supports(String url);

    /**
     * Extrai os dados da página web e retorna o CreateSongRequest estruturado.
     */
    CreateSongRequest scrapeAndParse(String url);

    /**
     * Nome identificador do provedor (ex: "cifraclub", "ultimate-guitar", "lacuerda", "chordie", "e-chords").
     */
    String getProviderName();
}
```

### 1.3 `SongScraperRegistry`
```java
package br.com.cifras.song.application.service;

import br.com.cifras.song.application.service.provider.SongScraperProvider;
import br.com.cifras.song.dto.CreateSongRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

@ApplicationScoped
public class SongScraperRegistry {

    @Inject
    Instance<SongScraperProvider> providers;

    public CreateSongRequest scrape(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("URL não informada.");
        }
        for (SongScraperProvider provider : providers) {
            if (provider.supports(url)) {
                return provider.scrapeAndParse(url);
            }
        }
        throw new BadRequestException("Provedor não suportado para a URL informada.");
    }
}
```

### 1.4 Estratégia de Parsing e Tratamento por Provedor

1. **CifraClubScraper:**
   - Mantém suporte ao padrão atual (`<pre>` com tags `<b>`), adiciona tag `["imported", "cifraclub"]`.
2. **UltimateGuitarScraper:**
   - Suporta URLs `ultimate-guitar.com/tab/...` e `tabs.ultimate-guitar.com/...`.
   - Extrai o JSON embutido na tag `<div class="js-store" data-content="...">` ou regex no script `window.UGAPP.store.page`.
   - Se JSON estiver presente, extrai:
     - `song_name`, `artist_name`, `tonality_name` (ou fallback "C").
     - Conteúdo da tab (`wiki_tab.content`).
   - Converte `[ch]...[/ch]` em acordes e limpa tags `[tab]...[/tab]` preservando tablatura.
   - Trata seções multilíngue `[Verse]`, `[Chorus]`, etc.
3. **LaCuerdaScraper:**
   - Suporta URLs `lacuerda.net/...` e `acordes.lacuerda.net/...`.
   - Trata encoding HTTP com `StandardCharsets.ISO_8859_1` (com fallback `UTF-8`).
   - Extrai título/artista da tag `<title>` ou cabeçalho.
   - Converte cifras latinas opcionais (`Do`, `Re`, `Mi`, `Fa`, `Sol`, `La`, `Si`) para notação internacional (`C`, `D`, `E`, `F`, `G`, `A`, `B`).
   - Trata seções em espanhol `[Intro]`, `[Verso]`, `[Coro]`, `[Estribillo]`, `[Puente]`.
4. **ChordieScraper:**
   - Suporta URLs `chordie.com/...`.
   - Extrai texto e processa sintaxe ChordPro (`[Am]letra`, `{title:...}`, `{artist:...}`).
5. **EChordsScraper:**
   - Suporta URLs `e-chords.com/...`.
   - Extrai `<pre id="core">` e limpa tags `<u>...</u>` mantendo o offset das notas.

---

## 2. Frontend Design

### 2.1 Detecção Dinâmica de Provedor no Modal (`ImportSongModal.tsx`)
```typescript
interface SupportedProvider {
  id: 'cifraclub' | 'ultimate-guitar' | 'lacuerda' | 'chordie' | 'e-chords';
  name: string;
  pattern: RegExp;
  color: string;
}
```
- A lista de provedores suportados é renderizada como badges abaixo do campo de input.
- Conforme o usuário digita a URL, o badge correspondente é realçado com anel de foco e badge "Reconhecido".

---

## 3. Estratégia de Testes

- Testes unitários para cada `SongScraperProvider` usando fixtures HTML offline para isolamento total de rede e determinismo nos testes de CI.
- Teste de integração do `ImportSongUseCase` e `SongResource.importSong`.
- Teste de unidade dos componentes de frontend (`ImportSongModal.test.tsx`).
- Meta de cobertura: **≥ 90%** nas linhas adicionadas/modificadas.
