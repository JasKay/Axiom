CREATE TABLE IF NOT EXISTS axiom.upload_usage (
 file_id uuid PRIMARY KEY,
 church_id uuid NOT NULL REFERENCES axiom.churches ON DELETE CASCADE,
 reserved_bytes bigint NOT NULL CHECK(reserved_bytes>0),
 actual_bytes bigint,
 reserved_until timestamptz NOT NULL,
 completed_at timestamptz,
 status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','completed','rejected'))
);
CREATE INDEX IF NOT EXISTS upload_usage_church ON axiom.upload_usage(church_id,completed_at,reserved_until);
INSERT INTO axiom.upload_usage(file_id,church_id,reserved_bytes,actual_bytes,reserved_until,completed_at,status)
 SELECT id,church_id,GREATEST(size,1),size,created_at,created_at,'completed' FROM axiom.files WHERE ready=true ON CONFLICT DO NOTHING;
INSERT INTO axiom.migrations(name) VALUES('010_storage_usage') ON CONFLICT DO NOTHING;
