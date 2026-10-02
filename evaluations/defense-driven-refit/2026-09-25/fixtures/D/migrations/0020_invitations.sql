CREATE TABLE invitations (
    id           bigserial PRIMARY KEY,
    org_id       bigint NOT NULL REFERENCES orgs(id),
    email        text NOT NULL,
    token        text NOT NULL UNIQUE,
    invited_by   bigint NOT NULL REFERENCES users(id),
    accepted_at  timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now()
);
