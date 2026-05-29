-- ==========================================
-- 1. ÍNDICES DE PERFORMANCE (Fk Indexes)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON public.group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON public.playlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_playlists_group_id ON public.playlists(group_id);

-- ==========================================
-- 2. POLÍTICAS PARA GROUP_MEMBERS
-- ==========================================
-- Garante que a tabela tenha RLS ativo
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros e donos veem associados" ON public.group_members;
CREATE POLICY "Membros e donos veem associados"
ON public.group_members FOR SELECT TO authenticated
USING (
    user_id::uuid = (SELECT auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_members.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Apenas donos gerenciam membros (INSERT)" ON public.group_members;
CREATE POLICY "Apenas donos gerenciam membros (INSERT)"
ON public.group_members FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_members.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Apenas donos gerenciam membros (UPDATE)" ON public.group_members;
CREATE POLICY "Apenas donos gerenciam membros (UPDATE)"
ON public.group_members FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_members.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_members.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Membros podem sair ou donos podem deletar (DELETE)" ON public.group_members;
CREATE POLICY "Membros podem sair ou donos podem deletar (DELETE)"
ON public.group_members FOR DELETE TO authenticated
USING (
    user_id::uuid = (SELECT auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_members.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

-- ==========================================
-- 3. POLÍTICAS PARA GROUP_INVITATIONS
-- ==========================================
-- Garante que a tabela tenha RLS ativo
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Envolvidos veem o convite" ON public.group_invitations;
CREATE POLICY "Envolvidos veem o convite"
ON public.group_invitations FOR SELECT TO authenticated
USING (
    inviter_id::uuid = (SELECT auth.uid()) OR
    invitee_email = (SELECT auth.jwt() ->> 'email') OR
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_invitations.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Apenas donos criam convites" ON public.group_invitations;
CREATE POLICY "Apenas donos criam convites"
ON public.group_invitations FOR INSERT TO authenticated
WITH CHECK (
    inviter_id::uuid = (SELECT auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_invitations.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Convidado responde ou dono gerencia (UPDATE)" ON public.group_invitations;
CREATE POLICY "Convidado responde ou dono gerencia (UPDATE)"
ON public.group_invitations FOR UPDATE TO authenticated
USING (
    invitee_email = (SELECT auth.jwt() ->> 'email') OR
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_invitations.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
)
WITH CHECK (
    invitee_email = (SELECT auth.jwt() ->> 'email') OR
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_invitations.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Dono deleta convite" ON public.group_invitations;
CREATE POLICY "Dono deleta convite"
ON public.group_invitations FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.grupos
        WHERE grupos.id = group_invitations.group_id
        AND grupos.ownerid::uuid = (SELECT auth.uid())
    )
);

-- ==========================================
-- 4. OTIMIZAÇÃO DE POLÍTICAS EXISTENTES
-- ==========================================
-- Otimização para performance e correção de IDOR/BOLA

DROP POLICY IF EXISTS "Donos gerenciam grupos" ON public.grupos;
CREATE POLICY "Donos gerenciam grupos" ON public.grupos FOR ALL TO authenticated
USING ((SELECT auth.uid()) = ownerid::uuid);

DROP POLICY IF EXISTS "Membros veem seus grupos" ON public.grupos;
CREATE POLICY "Membros veem seus grupos" ON public.grupos FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) = ownerid::uuid OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = grupos.id
    AND group_members.user_id::uuid = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Apenas criador gerencia suas músicas" ON public.songs;
CREATE POLICY "Apenas criador gerencia suas músicas" ON public.songs FOR ALL TO authenticated
USING ((SELECT auth.uid()) = userid::uuid)
WITH CHECK ((SELECT auth.uid()) = userid::uuid);

DROP POLICY IF EXISTS "Dono gerencia suas playlists" ON public.playlists;
CREATE POLICY "Dono gerencia suas playlists" ON public.playlists FOR ALL TO authenticated
USING ((SELECT auth.uid()) = userid::uuid);

DROP POLICY IF EXISTS "Playlists visíveis para dono ou grupo" ON public.playlists;
CREATE POLICY "Playlists visíveis para dono ou grupo" ON public.playlists FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) = userid::uuid OR
  (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = playlists.group_id
      AND group_members.user_id::uuid = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Dono da playlist gerencia suas músicas" ON public.playlist_songs;
CREATE POLICY "Dono da playlist gerencia suas músicas" ON public.playlist_songs FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.userid::uuid = (SELECT auth.uid())
  )
);
