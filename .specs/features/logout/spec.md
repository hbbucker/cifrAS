# Specification: User Logout

## 1. Overview
The application currently lacks a way for authenticated users to log out. This feature will add a dropdown menu to the user's avatar icon in the top right corner of the screen, allowing them to explicitly log out, terminating their session both on the client and the server.

## 2. Requirements

*   **REQ-LOGOUT-001 (UI Integration):** The user icon in the top right corner of the screen must be interactive.
*   **REQ-LOGOUT-002 (Dropdown Menu):** Clicking the user icon must open a dropdown menu containing a "Logout" option (and optionally the user's name/email).
*   **REQ-LOGOUT-003 (Backend API):** The system must provide a backend endpoint (`POST /auth/logout`) to handle the logout process.
*   **REQ-LOGOUT-004 (Token Invalidation):** The backend must communicate with Supabase Auth to invalidate the current access token.
*   **REQ-LOGOUT-005 (Client Cleanup):** Upon triggering the logout, the frontend must clear the `token` and `refreshToken` from memory/cookies/localStorage.
*   **REQ-LOGOUT-006 (Redirection):** After clearing the local state, the user must be redirected to the `/login` screen.

## 3. Out of Scope
*   Managing sessions across multiple devices simultaneously (beyond what Supabase handles by default).
*   "Remember me" functionality modifications.
