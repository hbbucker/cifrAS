# Group Invites Feature Specification

## Context
Currently, groups can be created, but inviting members is incomplete or immediately adds a member without their consent if we just link them. We need a proper invitation flow.
The new flow allows inviting users by email, provided they are already registered in the application.

## Requirements

### ID: REQ-GRP-INV-01 (Invite by Email)
- The group owner must be able to invite a user to their group by providing the user's email address.
- The system must validate that the provided email belongs to a registered user. If not, an error should be returned.

### ID: REQ-GRP-INV-02 (Invitation Creation)
- Instead of immediately adding the user to the group, an "Invitation" record should be created.
- The invited user must receive a notification/message within the application asking them to join the group.

### ID: REQ-GRP-INV-03 (Accept/Decline Invitation)
- The invited user can choose to Accept or Decline the invitation.
- If accepted: The user is added to the `group_members` table and the invitation is marked as accepted (or deleted).
- If declined: The invitation is marked as declined (or deleted), and the user who sent the invite receives a notification about the refusal.

### ID: REQ-GRP-INV-04 (Notifications)
- The system must support in-app notifications for:
  - Receiving a group invitation.
  - An invitation being declined by the invitee (sent to the inviter).

## User Flows

**Inviter Flow:**
1. User goes to Groups page.
2. Selects "Invite Member" on a group they own.
3. Enters an email address.
4. System verifies the email and creates an invitation.
5. If the invite is declined later, the inviter sees a notification.

**Invitee Flow:**
1. User logs into the application.
2. User sees an indicator for a new notification/invitation.
3. User opens notifications and sees "User X invited you to join Group Y".
4. User clicks "Accept" or "Decline".
5. If Accept, user immediately sees the group in their groups list.
