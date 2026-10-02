CREATE TABLE orders (
    id          bigserial PRIMARY KEY,
    user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id     bigint NOT NULL,
    quantity    integer NOT NULL,
    total_yen   integer,
    created_at  timestamptz NOT NULL DEFAULT now()
);
