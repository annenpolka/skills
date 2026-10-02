CREATE TABLE subscriptions (
    id           bigserial PRIMARY KEY,
    customer_id  bigint NOT NULL REFERENCES customers(id),
    plan_type    text NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    status       text NOT NULL CHECK (status IN ('active', 'past_due', 'canceled')),
    price        numeric(12, 2) NOT NULL,
    currency     char(3) NOT NULL,
    renews_at    timestamptz NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_due_idx ON subscriptions (plan_type, status, renews_at);

-- customers(id, email, name, billing_address, payco_customer_id, ...) は 0003_customers.sql
