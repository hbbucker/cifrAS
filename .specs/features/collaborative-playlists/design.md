# Design: Collaborative Playlists & Sharing

## Architecture Overview
The feature spans backend (Quarkus) and frontend (React). We need a way to link a public, unguessable token to a specific playlist, allowing read-only access for unauthenticated users while maintaining strict privacy limits.

## Database Schema (Concept)
- Add `share_token` (UUID) field and `is_shared` (boolean) flag to the `Playlist` entity.
- The UUID token provides a secure and public access URL (e.g., `/shared/playlist/:token`).

## Backend Components (Quarkus)
- **Domain/Model**: Update the Playlist model to support a `shareToken` property and a `generateShareToken()` business method.
- **Service**: 
  - `PlaylistService` requires methods to enable sharing and fetch a playlist by its share token without requiring JWT authentication.
- **Resource/Endpoints**:
  - `POST /api/playlists/{id}/share` (Auth required): Generates and returns a share link/token. Only the playlist owner can execute this.
  - `GET /api/playlists/shared/{token}` (Public): Returns playlist data in a read-only DTO format.

## Frontend Components (React)
- **Shared Playlist Route**: A new route `/shared/playlist/:token` to handle unauthenticated public tokens.
- **Share UI**: "Share" button on the Playlist view for owners to generate and copy the link.
- **Sign-up Wall Modal/UX**: Intercepts advanced actions (bulk transpose, auto-scroll) for unauthenticated users, displaying a modal to sign up/login via Supabase Auth (Purple Primary CTA).
- **API Client**: Make sure Axios is configured to handle the public endpoint without sending auth tokens, or handle 401 gracefully according to the ADR.

## Security Considerations
- The shared link must not expose any sensitive data of the owner (only return read-only DTOs for public endpoints).
- Supabase Row Level Security or application logic must enforce that only the owner can generate the link.
- The endpoint `GET /api/playlists/shared/{token}` must be unprotected (public).
