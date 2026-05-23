# Summary: Song Edit Form Fix

Bug reported by user: "tela de edição de música não está salvando as alterações" AND "está dando 401".
Cause: 
1. The frontend edit form was mocked (Fixed).
2. The frontend login system was creating a `"mock-token"` locally because it bypassed real authentication. The Quarkus backend correctly blocked this fake token with a `401 Unauthorized` error since it expects a valid signed Supabase JWT.
Action: 
- Replaced song view/edit mocks with real API endpoints (Done).
- Next Step: Remove mock auth from `LoginPage.tsx` and wire it to the real backend `/api/auth/login` endpoint so the user receives a genuine JWT.
