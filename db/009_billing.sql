CREATE TABLE IF NOT EXISTS axiom.billing_accounts (
 church_id uuid NOT NULL REFERENCES axiom.churches ON DELETE CASCADE,
 livemode boolean NOT NULL,
 customer_id text UNIQUE,
 subscription_id text UNIQUE,
 checkout_session_id text,
 status text NOT NULL DEFAULT 'none',
 price_id text,
 paid_until timestamptz,
 paid_at timestamptz,
 cancel_at_period_end boolean NOT NULL DEFAULT false,
 risk_state text,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(church_id,livemode)
);
CREATE TABLE IF NOT EXISTS axiom.billing_events (
 event_id text PRIMARY KEY,
 livemode boolean NOT NULL,
 church_id uuid REFERENCES axiom.churches ON DELETE SET NULL,
 event_type text NOT NULL,
 processed_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO axiom.migrations(name) VALUES('009_billing') ON CONFLICT DO NOTHING;