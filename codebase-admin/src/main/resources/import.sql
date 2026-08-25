ALTER TABLE songs ADD COLUMN IF NOT EXISTS fts_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') || setweight(to_tsvector('portuguese', coalesce(artist, '')), 'B')) STORED;

-- Insert dummy songs for E2E testing user (e2e-user-1234)
INSERT INTO songs (id, userid, title, artist, originalkey, lyrics, is_favorite, createdat, updatedat, pref_auto_scroll_speed, pref_transpose_steps, pref_use_bb, pref_use_eb)
VALUES
('00000000-0000-0000-0000-000000000001', 'e2e-user-1234', 'Mock Song 1', 'Mock Artist', 'C', '{"sections": [{"label": "Intro", "lines": [{"text": "Intro text", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('00000000-0000-0000-0000-000000000002', 'e2e-user-1234', 'Mock Song 2', 'Mock Artist', 'D', '{"sections": [{"label": "Intro", "lines": [{"text": "Intro text", "chords": [{"position": 0, "chord": "D"}]}]}]}'::jsonb, true, NOW(), NOW(), 1, 0, false, false),
('00000000-0000-0000-0000-000000000003', 'e2e-user-1234', 'Mock Song 3', 'Mock Artist', 'E', '{"sections": [{"label": "Intro", "lines": [{"text": "Intro text", "chords": [{"position": 0, "chord": "E"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false)
ON CONFLICT (id) DO NOTHING;

-- Insert dummy songs for hbbucker@gmail.com
-- Note: Replace 'USER_UUID_HERE' with the actual Supabase Auth UUID (sub claim) for hbbucker@gmail.com
-- Or if the system allows email as userId in local testing, leave it as is.
INSERT INTO songs (id, userid, title, artist, originalkey, lyrics, is_favorite, createdat, updatedat, pref_auto_scroll_speed, pref_transpose_steps, pref_use_bb, pref_use_eb)
VALUES
('11111111-1111-1111-1111-111111111111', '0503abef-1673-4048-95f3-031caf21573c', 'Minha Música 1', 'Bucker', 'G', '{"sections": [{"label": "Verso", "lines": [{"text": "Um texto qualquer", "chords": [{"position": 0, "chord": "G"}]}]}]}'::jsonb, true, NOW(), NOW(), 1, 0, false, false),
('11111111-1111-1111-1111-111111111112', '0503abef-1673-4048-95f3-031caf21573c', 'Minha Música 2', 'Bucker', 'A', '{"sections": [{"label": "Verso", "lines": [{"text": "Outro texto", "chords": [{"position": 0, "chord": "A"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false)
ON CONFLICT (id) DO NOTHING;

-- 30 musicas de teste geradas para 0503abef-1673-4048-95f3-031caf21573c
INSERT INTO songs (id, userid, title, artist, originalkey, lyrics, is_favorite, createdat, updatedat, pref_auto_scroll_speed, pref_transpose_steps, pref_use_bb, pref_use_eb) VALUES
('a05b41c3-1982-48b9-b8bd-d20b07e04dbf', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 3', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 3", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('74c1ef1f-2c0f-4ff6-95f8-121028949312', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 4', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 4", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('4ec41611-636e-4c84-aef7-1ee410650462', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 5', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 5", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('7bba09a8-f1b3-45e7-9ba9-498b86a918a0', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 6', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 6", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('4cb3925d-73fb-4482-be10-b377ea6de111', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 7', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 7", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('d079f51c-b7c0-4dcf-a0f2-b1896448a651', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 8', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 8", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('f5c2660e-a669-4952-b1d4-4305c5484a6c', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 9', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 9", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('66b443ec-4b44-4523-b9bd-7a589c334149', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 10', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 10", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('b22f3146-0c04-4527-afed-818249f66b7a', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 11', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 11", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('a7ee5f38-a5ff-49af-a796-22da6cf6cf5b', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 12', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 12", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('9abc354a-3113-40cc-b402-353bb3fa9ab1', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 13', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 13", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('43bd8f26-77b8-467f-b6a0-01d6345a5efe', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 14', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 14", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('f98d49a7-1b8f-4793-b99a-e8e8e52af7d9', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 15', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 15", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('398e1eef-f0e2-455a-b3ae-ad74b217739c', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 16', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 16", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('1e407fd4-c2c5-4130-bfb5-44f872d6741e', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 17', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 17", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('6e5ed231-edee-4c06-a104-956cf23a6db2', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 18', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 18", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('7b994e09-7932-4287-97b1-aaf14e7d2ade', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 19', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 19", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('9e1e8e2d-1c87-4ad8-ade1-dd90fde3ef48', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 20', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 20", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('e32d5575-c1ce-4af0-9ea6-128d5a6e3ea8', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 21', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 21", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('37f8c805-334d-43d1-874d-2971e3dde622', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 22', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 22", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('a2f9dc33-1021-4f95-8db1-5fc1e7c8467a', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 23', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 23", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('d9a941ff-4510-4177-9261-c32e3332c707', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 24', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 24", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('7be48c76-9821-4332-90fb-edb0f0233fda', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 25', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 25", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('555ca135-1614-4ed9-a21f-06aa78845c7a', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 26', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 26", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('72ffd749-46f2-460e-9ef0-cd72994b75f5', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 27', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 27", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('4dd3f799-c748-4665-b8ae-7ba44c9b2ff8', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 28', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 28", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('b91e5827-2b1f-4b51-b3fa-86a342235a16', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 29', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 29", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('ed9230ef-d3e6-43a5-a202-d0cbfac3be34', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 30', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 30", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('62477cc8-679d-4350-bd5c-f275241c3670', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 31', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 31", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false),
('e44578d4-3bad-4967-8ec7-189339cdd198', '0503abef-1673-4048-95f3-031caf21573c', 'Música de Teste 32', 'Artista Teste', 'C', '{"sections": [{"label": "Verso", "lines": [{"text": "Letra da música 32", "chords": [{"position": 0, "chord": "C"}]}]}]}'::jsonb, false, NOW(), NOW(), 1, 0, false, false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    admin_id VARCHAR(36) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_audit_logs_user_id ON user_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_admin_id ON user_audit_logs(admin_id);
