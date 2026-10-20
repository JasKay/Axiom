ALTER TABLE axiom.comments ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'message';
ALTER TABLE axiom.comments ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;
INSERT INTO axiom.migrations(name) VALUES('008_team_updates') ON CONFLICT DO NOTHING;
