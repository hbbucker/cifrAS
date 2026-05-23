# Group Invites Feature Tasks

## Task 1: Create GroupInvitation Entity
- Create `GroupInvitation` Panache entity (`id`, `group_id`, `inviter_id`, `invitee_email`, `status`, `created_at`).
- Status enum: PENDING, ACCEPTED, DECLINED.
- Create `GroupInvitationRepository`.

## Task 2: Validate Email via auth.users
- Create a service method or repository query that checks if `invitee_email` exists in the Supabase `auth.users` table using a native SQL query or a mapped read-only entity for `auth.users`.

## Task 3: GroupResource endpoints for Invitation
- Modify `POST /groups/{id}/members` or create `POST /groups/{id}/invites` to accept an email.
- Validate email exists.
- Create `GroupInvitation` record.
- Return success.

## Task 4: User Invitations Endpoint
- Create `GET /users/me/invites` (or under `/groups/invites`) to fetch pending invitations for the logged-in user.
- The user's email will be extracted from their JWT token to look up invites by `invitee_email`.

## Task 5: Accept/Decline Invitation Endpoints
- Create `POST /groups/invites/{id}/accept` to change status to ACCEPTED and add user to `group_members` using `groupService.addMember`.
- Create `POST /groups/invites/{id}/decline` to change status to DECLINED.

## Task 6: Frontend Integration
- Create notification/invitation icon in the `Sidebar` or `Header`.
- Display a modal or dropdown with pending invitations.
- Connect "Accept" and "Decline" buttons to the respective endpoints.
- Update `GroupsPage` invite functionality to use the new `/groups/{id}/invites` endpoint.
