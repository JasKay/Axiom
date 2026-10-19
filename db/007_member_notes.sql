CREATE TABLE IF NOT EXISTS axiom.member_notes (
 church_id uuid NOT NULL, user_id text NOT NULL, service_id text NOT NULL,
 body text NOT NULL DEFAULT '' CHECK(length(body)<=50000), updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(church_id,user_id,service_id),
 FOREIGN KEY(church_id,user_id) REFERENCES axiom.members(church_id,user_id) ON DELETE CASCADE
);
INSERT INTO axiom.migrations(name) VALUES('007_member_notes') ON CONFLICT DO NOTHING;
