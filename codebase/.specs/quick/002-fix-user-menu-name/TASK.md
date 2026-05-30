# Fix User Menu Name Display

**Scope:** The user menu displayed the email twice because `user.name` fell back to the email when `full_name` was missing from the JWT metadata. Additionally, the signup form was collecting the user's name but never sending it to the backend.

**Changes:**
1. Modified `AuthContext.tsx` to derive a friendly name from the email prefix (e.g. `john@doe.com` -> `John`) if `full_name` is missing, preventing the email from being repeated verbatim.
2. Updated `RegisterPage.tsx` to pass the `name` field in the POST request to `/api/auth/register`.
3. Updated `AuthRequest.java` and `AuthResource.java` to extract the `name` and save it to the Supabase user metadata under `data.full_name`.
