# Feature Specification: Admin Dashboard

## 1. Overview
The Admin Dashboard provides a basic analytics panel to visualize Monthly Active Users (MAU) growth after the release of Collaborative Playlists.

## 2. Scope
- New React screen at `/admin/dashboard`.
- Integration with Supabase API to generate a chart for new users over time.

## 3. Requirements
- **REQ-001**: Implement `/admin/dashboard` route in React Router.
- **REQ-002**: Fetch user registration/activity data from Supabase API.
- **REQ-003**: Render a chart displaying new users to track MAU growth.
- **REQ-004**: Maintain 95% test coverage.
- **REQ-005**: All linters and tests must pass.
