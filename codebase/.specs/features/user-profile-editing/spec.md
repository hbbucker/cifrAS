# User Profile Editing Specification

## 1. Feature Description
As a user, I want to be able to edit my user characteristics/properties in the system, specifically my name, so that I can keep my profile up-to-date. This will be accessed through a "Preferences" option in the main user menu, opening a pop-up (modal) with the editable fields.

## 2. Requirements
- **REQ-001**: Add a "Preferences" (or Profile) option in the `UserMenu` dropdown.
- **REQ-002**: Clicking the option must open a modal/pop-up.
- **REQ-003**: The modal must display an editable "Name" field.
- **REQ-004**: The modal must display a read-only "Email" field.
- **REQ-005**: Saving the modal should trigger a backend API call to update the user's name.
- **REQ-006**: The backend should update the user's metadata in Supabase Auth.
- **REQ-007**: The frontend UI (UserMenu, etc.) should reflect the updated name.

## 3. Scope
- **Backend**: Add a new `PUT /auth/profile` endpoint in `AuthResource.java` to update user data via `SupabaseAuthClient.java`.
- **Frontend**: Create a new `PreferencesModal` component, update `UserMenu.tsx` to include the toggle, and update `AuthContext.tsx` to refresh user data if necessary.
- **Size**: Medium.

## 4. Status
- [x] Specified
- [x] Implemented
- [x] Verified
