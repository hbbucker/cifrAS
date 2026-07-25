# Tasks: Admin Dashboard

## Phase 1: Setup & Routing
- [ ] **TASK-001**: Add `/admin/dashboard` route to the main React Router configuration.
  - *Verify*: Navigating to `/admin/dashboard` renders a placeholder component.

## Phase 2: Data Integration
- [ ] **TASK-002**: Create `useAdminAnalytics` hook to fetch MAU data from Supabase.
  - *Verify*: Hook returns correct mock or real aggregated data from the Supabase client.
- [ ] **TASK-003**: Update Supabase RLS policies or create a database function to aggregate MAU securely.
  - *Verify*: Data is returned correctly when queried as an admin, and forbidden for regular users.

## Phase 3: UI Implementation
- [ ] **TASK-004**: Implement `MauChart` component using a chart library (or simple UI).
  - *Verify*: Chart renders visually using the Tailwind design system.
- [ ] **TASK-005**: Implement `AdminDashboardPage` bringing together `MauChart` and layout.
  - *Verify*: The page matches the Pinterest-inspired aesthetics and renders real data.

## Phase 4: Testing & Quality
- [ ] **TASK-006**: Write unit and component tests (Vitest/RTL or Playwright for E2E) to reach 95% coverage.
  - *Verify*: `npm run test` or `npx playwright test` passes, coverage report shows >=95%.
- [ ] **TASK-007**: Run linters and final quality gatekeeper checks.
  - *Verify*: `npm run lint` passes without warnings.
