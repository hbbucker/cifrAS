# Technical Specification: Collaboration & Groups (Epic 2)

## 1. Overview
Enable users to collaborate by creating groups, inviting members, and managing shared playlists. This feature introduces a robust access control system and real-time collaboration for song organization.

## 2. Domain Entities (Rich Domain Model)

### 2.1. `Group`
Represents the core unit of collaboration.
- **Attributes:** `id` (UUID v7), `name`, `description`, `ownerId` (Supabase User ID), `createdAt`, `updatedAt`.
- **Invariants:** 
    - Name cannot be empty.
    - Owner must be a valid user.
- **Methods:**
    - `static create(name, ownerId)`: Factory method to ensure initial state.
    - `updateDetails(name, description)`: Validates new details.
    - `isOwner(userId)`: Convenience check.

### 2.2. `GroupMember`
Represents a user's membership in a group.
- **Attributes:** `id` (UUID), `groupId`, `userId`, `role` (`OWNER`, `ADMIN`, `MEMBER`), `joinedAt`.
- **Roles:**
    - `OWNER`: Full control, can delete group, manage admins.
    - `ADMIN`: Manage members, manage playlists, edit songs.
    - `MEMBER`: View playlists, add songs to playlists.
- **Methods:**
    - `changeRole(newRole, actorRole)`: Validates that only `OWNER` can promote to `ADMIN` or demote `ADMIN`s.

### 2.3. `Invitation`
Manages the process of adding new members.
- **Attributes:** `id` (UUID), `groupId`, `token` (Secure UUID), `role`, `status` (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`), `expiresAt`, `createdBy`.
- **Methods:**
    - `accept(userId)`: Transitions status and validates expiry.
    - `revoke()`: Admin cancellation.
    - `isValid()`: Checks if not expired and status is `PENDING`.

## 3. Access Control (Supabase Integration)
- **Authentication:** Relies on Supabase JWT.
- **Authorization:** Handled at the application layer (Services) by checking `GroupMember` role for the `sub` claim of the JWT.
- **RLS (Database):** Supabase Row Level Security will ensure that even at the DB level, users can only see groups they belong to.

## 4. Invitation Flow
1. **Generation:** `ADMIN`/`OWNER` calls `POST /api/groups/:groupId/invitations` with a target `role`.
2. **Token:** A unique, secure token is generated and stored.
3. **Sharing:** A link is shared (e.g., `https://cifras.app/groups/join/:token`).
4. **Validation:** When a user clicks the link, the frontend calls `POST /api/groups/join` with the token.
5. **Completion:** The backend validates the token, creates a `GroupMember`, and marks the invitation as `ACCEPTED`.

## 5. Shared Playlist Logic
- **Playlist Association:** Playlists can now belong to a `Group` instead of an individual user.
- **Consistency (Reordering):**
    - **Strategy:** Fractional Indexing.
    - **Implementation:** Store a `position` as a `Double`. When moving a song between items A and B, the new position is `(A.pos + B.pos) / 2`. This avoids mass updates of other items.
    - **Consistency:** The backend ensures that `GroupMember` has write access before allowing reordering.

## 6. API Endpoints
- `POST /api/groups`: Create a new group.
- `GET /api/groups`: List user's groups.
- `GET /api/groups/:id/members`: List members.
- `POST /api/groups/:id/invitations`: Create invitation.
- `POST /api/groups/join`: Join group via token.
- `PATCH /api/groups/:id/playlists/:playlistId/order`: Update song order.
