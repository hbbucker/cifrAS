# Quick Task 008: Dashboard Favorites

**Date:** 2026-07-04
**Status:** Done

## Description

The dashboard should only display songs marked as favorites, rather than all recently added songs.

## Files Changed

- `codebase/src/main/webui/src/pages/DashboardPage.tsx` — Added a filter for `isFavorite` on the fetched songs before mapping and slicing. Changed the label to display favorites.
- `codebase/src/main/webui/src/locales/pt-BR.json` — Added favorites translation string.
- `codebase/src/main/webui/src/locales/en.json` — Added favorites translation string.
- `codebase/src/main/webui/src/locales/es.json` — Added favorites translation string.

## Verification

- [x] Tested with `npm run lint` in webui.
- [x] The code correctly filters the dashboard display based on `song.isFavorite`.

## Commit

TBD
