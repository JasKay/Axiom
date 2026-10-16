ALTER TABLE axiom.members ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'lead' CHECK(audience IN ('lead','pro','u'));
ALTER TABLE axiom.invitations ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'lead' CHECK(audience IN ('lead','pro','u'));
CREATE TABLE IF NOT EXISTS axiom.handoffs (church_id uuid NOT NULL REFERENCES axiom.churches ON DELETE CASCADE,service_id text NOT NULL,snapshot jsonb NOT NULL,revision integer NOT NULL,sent_by text NOT NULL,sent_at timestamptz NOT NULL DEFAULT now(),received_by text,received_at timestamptz,PRIMARY KEY(church_id,service_id));
UPDATE axiom.members SET audience='u' WHERE role='viewer' AND audience='lead' AND NOT EXISTS(SELECT 1 FROM axiom.migrations WHERE name='004_audience_experiences');
INSERT INTO axiom.migrations(name) VALUES('004_audience_experiences') ON CONFLICT DO NOTHING;
