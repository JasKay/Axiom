CREATE TABLE IF NOT EXISTS axiom.join_codes (
 id uuid PRIMARY KEY,
 church_id uuid NOT NULL REFERENCES axiom.churches ON DELETE CASCADE,
 audience text NOT NULL CHECK(audience IN ('lead','pro','u')),
 role text NOT NULL CHECK(role IN ('editor','viewer')),
 token_hash text NOT NULL UNIQUE,
 created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
 max_uses integer NOT NULL CHECK(max_uses BETWEEN 1 AND 500),
 uses integer NOT NULL DEFAULT 0 CHECK(uses>=0 AND uses<=max_uses),
 revoked_at timestamptz,
 CHECK((audience='u' AND role='viewer') OR (audience IN ('lead','pro') AND role='editor'))
);
CREATE INDEX IF NOT EXISTS join_codes_church ON axiom.join_codes(church_id);
INSERT INTO axiom.migrations(name) VALUES('005_church_join_codes') ON CONFLICT DO NOTHING;
