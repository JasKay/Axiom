CREATE TABLE IF NOT EXISTS axiom.files (id uuid PRIMARY KEY,church_id uuid NOT NULL REFERENCES axiom.churches ON DELETE CASCADE,service_id text NOT NULL,created_by text NOT NULL,name text NOT NULL,pathname text UNIQUE NOT NULL,size bigint NOT NULL DEFAULT 0,ready boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS files_service ON axiom.files(church_id,service_id,created_at);
INSERT INTO axiom.migrations(name) VALUES('002_files') ON CONFLICT DO NOTHING;
