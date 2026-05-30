# Summary: Fix User Menu Name Display

- Bug: User menu showed email twice instead of Name and Email. Registration ignored the `name` field.
- Fix: 
  - `AuthContext.tsx` defaults missing names to the capitalized email prefix.
  - `RegisterPage.tsx`, `AuthRequest.java`, and `AuthResource.java` were updated to properly capture and store the `full_name` metadata in Supabase.
- Status: Completed.
