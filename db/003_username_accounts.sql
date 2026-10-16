DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='axiom' AND table_name='members' AND column_name='email') THEN ALTER TABLE axiom.members RENAME COLUMN email TO username; END IF;
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='axiom' AND table_name='invitations' AND column_name='email') THEN ALTER TABLE axiom.invitations RENAME COLUMN email TO username; END IF;
END $$;
INSERT INTO axiom.migrations(name) VALUES('003_username_accounts') ON CONFLICT DO NOTHING;
