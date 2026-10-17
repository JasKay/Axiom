CREATE TABLE IF NOT EXISTS axiom.service_activity (church_id uuid NOT NULL REFERENCES axiom.churches ON DELETE CASCADE,service_id text NOT NULL,worked_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(church_id,service_id));
INSERT INTO axiom.migrations(name) VALUES('006_service_activity') ON CONFLICT DO NOTHING;
