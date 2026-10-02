CREATE TABLE audit_logs (
    id          bigserial PRIMARY KEY,
    user_id     bigint NOT NULL REFERENCES users(id),
    action      text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);
