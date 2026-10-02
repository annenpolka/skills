CREATE TABLE orders (
    id               bigserial PRIMARY KEY,
    user_id          bigint NOT NULL,
    payco_charge_id  text UNIQUE,
    payment_status   text NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at       timestamptz NOT NULL DEFAULT now()
);
