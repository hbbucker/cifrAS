# 🚨 Root Cause Analysis: Pipeline Quebrada (`theater.spec.ts`)

## 1. O Sintoma
O teste E2E `theater mode session state is preserved` estava falhando na pipeline com o seguinte erro:
```
Expected: "D"
Received: "C"
```
Ele simulava a entrada no modo *Theater*, realizava 2 incrementos na tonalidade (Transpose C -> C# -> D), saía e voltava para o modo *Theater*, esperando que o tom `D` fosse mantido (já que adicionamos persistência de sessão recentemente). No entanto, o componente recarregava exibindo a tonalidade `C`.

## 2. A Causa Raiz (The Bug)
Existiam **dois** problemas fundamentais atuando em conjunto: um na aplicação (lógica de persistência) e um no teste (race condition).

### Bug na Aplicação (Divergência de Fontes da Verdade)
1. Quando a página `TheaterModePage.tsx` disparava as atualizações de estado (ex: alteração de tom), ela salvava apenas na tabela `user_song_preferences` (via `PUT /api/theater/session`).
2. Ao sair para a página `SongViewPage.tsx`, o componente disparava um `GET /api/songs/{id}` para carregar os dados da música, que trazia as preferências de uma **outra** entidade (`SongEntity`), onde `prefTransposeSteps` ainda era `0`.
3. Ao retornar para o modo *Theater*, a página anterior passava o state recém-carregado (`0`) via React Router, forçando o *Theater Mode* a ignorar a sessão salva e adotar `0` (C).

### Flakiness no Teste (Race Condition)
O script do Playwright estava sofrendo de severas *race conditions*:
1. Ele não esperava o *debounce* (1000ms) terminar de salvar as configurações antes de clicar em `Exit Theater Mode`.
2. Após clicar em sair, ele **não esperava** o `GET /api/songs/{id}` terminar de carregar os dados atualizados antes de clicar em `Perform` novamente. Isso fazia o React repassar o estado inicial (em carregamento) de `0` de volta para o *Theater*.

## 3. A Solução (Fix)
### Backend / Frontend Sync
- Modifiquei o `TheaterModePage.tsx` para sincronizar a atualização de preferências disparando **dois** PUTs simultâneos durante o debounce:
  - `PUT /api/theater/session` (Sessão do usuário logado)
  - `PUT /api/songs/{id}/preferences` (Preferências padrão da cifra na entidade legado, mantendo o fallback sincronizado).
- Adicionei os headers `Cache-Control: no-cache, no-store` no fetch do `SongViewPage.tsx` para garantir que o *GET* na volta não pegasse lixo em cache de disco do navegador.

### Ajuste no Playwright
- Adicionado um `await page.waitForTimeout(2000)` para garantir que o debounce assíncrono tenha tempo de disparar as requisições de persistência de sessão.
- Adicionado um *interceptor* para o clique de saída:
  ```typescript
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/songs/') && response.request().method() === 'GET');
  await page.getByTestId('exit-theater-btn').click();
  await responsePromise; // Garante que a página leu o estado correto antes de prosseguir!
  ```

## 4. Status
O teste agora roda 100% verde (`1 passed (5.2s)`) e reflete o real comportamento em produção, validando com precisão a persistência das tonalidades.
