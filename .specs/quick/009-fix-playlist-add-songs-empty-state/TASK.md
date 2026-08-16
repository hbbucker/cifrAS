# Quick Task 009: Fix Playlist Add Songs Empty State

**Date:** 2026-08-16
**Status:** In Progress
**Role:** Maker (Frontend Staff / CTO)

## Description

When trying to add a song to a playlist in `PlaylistViewPage`, the modal opens and queries `/api/songs?size=50`. The backend returns a `PagedResponse` structure `{ items: [...], totalCount: ... }`. The frontend was incorrectly checking only `Array.isArray(data) ? data : (data.data || [])`, missing the `data.items` array and causing the modal to always show the empty state "No matching songs found." even when songs exist.

## Root Cause

1. `PlaylistViewPage.tsx` and `SearchBar.tsx` read `data.data` instead of `data.items || data.data || []`.
2. `pageSize` parameter used in some queries instead of `size` supported by `SongResource`.
3. Hardcoded English strings in `PlaylistViewPage.tsx` violating the i18n ADR rule.

## Acceptance Criteria

- [ ] `PlaylistViewPage` properly parses `PagedResponse` (`data.items`) and displays all available songs to add.
- [ ] Songs already in the playlist are filtered out correctly.
- [ ] `SearchBar` also reliably handles `data.items` from paginated responses.
- [ ] All user-facing strings are localized with `useTranslation` (pt-BR, en, es).
- [ ] Unit tests for `PlaylistViewPage` are created/updated and passing.
- [ ] Linter passes with 0 warnings.
