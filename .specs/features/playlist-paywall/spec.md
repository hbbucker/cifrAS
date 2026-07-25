# Specification: Playlist Paywall (1st Song Free)

## Overview
Implement a Product-Led Growth (PLG) engine by gating access to collaborative playlists for unauthenticated users. The first song of a playlist is free to view. Attempting to view the second song or use advanced features prompts the user to create an account.

## Requirements

- **REQ-PAY-001 (Intercept 2nd Song)**: When an unauthenticated user attempts to view a song at `songIndex >= 1` in a playlist, they must be intercepted and prevented from viewing it.
- **REQ-PAY-002 (Intercept Advanced Tools)**: When an unauthenticated user attempts to use advanced tools (e.g., Theater Mode), they must be intercepted.
- **REQ-PAY-003 (Sign-up Wall Modal)**: The interception mechanism must display a modal with the following text: "Para ver o resto do repertório da sua banda e usar o Modo Teatro, crie uma conta grátis."
- **REQ-PAY-004 (Design System)**: The modal must adhere to the Pinterest-like design system (clean, `32px` border radius for modal, primary button color `#aa3bff`, white canvas).
- **REQ-PAY-005 (Deep Linking / Redirect)**: After a successful sign-up/login via Supabase, the user must be redirected exactly back to the playlist they were attempting to view.
- **REQ-PAY-006 (Testing Coverage)**: There must be at least 95% test coverage for route blocking and modal rules, and 100% pass rate for Playwright E2E tests validating the redirected login flow.
