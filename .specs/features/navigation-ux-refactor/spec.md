# UX Navigation Refactor

## 1. Description
The current implementation of the navigation system (Sidebar and BottomNav) is manually injected into each individual page. This has led to several UX issues:
- `BottomNav` is missing on important pages in mobile and tablet views (e.g., Groups, Settings, individual items).
- Inconsistent layout paddings (`pb-24`) that are required to prevent content from being hidden behind the absolute/fixed positioned `BottomNav` on mobile.
- Code duplication across 10+ page components.

## 2. Requirements

### [REQ-NAV-01] Unified Layout Component
Create a `MainLayout.tsx` that wraps all protected routes. It must provide the main structure (`flex h-screen bg-bg-main`), instantiate the `<Sidebar />` on the left (desktop), the `<main>` scrollable area in the middle, and the `<BottomNav />` at the bottom (mobile/tablet).

### [REQ-NAV-02] Fluid Bottom Padding on Mobile
The `<main>` content area inside the unified layout must have appropriate padding-bottom applied specifically on smaller screens so the `BottomNav` does not cover scrollable content.

### [REQ-NAV-03] Sub-route Active States
The `BottomNav` items must correctly highlight even when the user is deep into a sub-route (e.g., `/groups/123` should still highlight the "Groups" tab).

### [REQ-NAV-04] Application Refactoring
Remove manual `Sidebar`, `BottomNav`, and root layout `div`s (`<div className="flex h-screen bg-bg-main">`) from all page components and update `App.tsx` to wrap protected routes inside the new `MainLayout`.

## 3. Acceptance Criteria
- [ ] Mobile/tablet users can see the `BottomNav` on all main feature pages (Home, Playlists, Groups, Settings).
- [ ] Users can scroll to the absolute bottom of any page on mobile without the `BottomNav` covering the last items.
- [ ] Codebase has a single source of truth for the application's root layout structure.
