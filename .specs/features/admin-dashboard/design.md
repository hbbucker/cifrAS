# Design: Admin Dashboard

## Architecture
- **Frontend**: React 19 + TypeScript + Vite.
- **Styling**: TailwindCSS following the Pinterest-inspired design system (16px/32px radius, no shadows, Purple Primary/Surface Card colors).
- **Routing**: React Router DOM (add `/admin/dashboard` route).
- **Data Fetching**: Custom hook `useAdminAnalytics` that queries Supabase.
- **Visualization**: Use a lightweight chart library (e.g., Recharts or Chart.js) or custom SVG for the MAU chart.

## Components
- `AdminDashboardPage`: Main page component for the route.
- `MauChart`: Component responsible for rendering the visual chart based on fetched data.
- `StatCard`: Reusable component for summary statistics (e.g., total MAU).

## Supabase Integration
- Query `users` or `profiles` table to aggregate new registrations by month/day.
- Ensure only admins can access this data (requires RLS policy or admin claim in JWT).
