# Security Investigation Checklist

Use this checklist during Deep investigations or when the user explicitly requests
a security audit. This is not a penetration test — it's a static code review for
common security concerns.

## Secrets & Credentials

- [ ] Grep for hardcoded secrets: `password`, `secret`, `api_key`, `token`, `credential`
- [ ] Check `.env` files — are they gitignored? Any `.env` committed in git history?
  - `git log --all --diff-filter=A -- '.env*'`
- [ ] Look for AWS keys: `AKIA[0-9A-Z]{16}`
- [ ] Look for private keys: `-----BEGIN.*PRIVATE KEY-----`
- [ ] Check for secrets in config files, docker-compose, CI configs

## Input Validation

- [ ] Are API endpoints validating input? Look for validation libraries or manual checks
- [ ] Grep for raw SQL queries (SQL injection risk): `query(`, `execute(`, `` ` ``
  with string interpolation
- [ ] Look for `dangerouslySetInnerHTML`, `innerHTML`, `v-html` (XSS risk)
- [ ] Check file upload handling — is file type validated? Size limited?

## Authentication & Authorization

- [ ] How is authentication implemented? (JWT, session, OAuth, API key)
- [ ] Is there role-based access control? Where are permissions checked?
- [ ] Are auth middleware/guards applied consistently to protected routes?
- [ ] Look for authorization bypass patterns: routes without auth checks

## Dependency Security

- [ ] Are there known vulnerable dependencies? (check for audit configs)
- [ ] Look for `npm audit`, `pip-audit`, `cargo audit` in CI
- [ ] Are dependencies pinned to specific versions?
- [ ] Any dependencies from non-standard registries?

## Error Handling & Information Disclosure

- [ ] Are stack traces exposed to clients in production?
- [ ] Do error messages reveal internal structure? (file paths, query details)
- [ ] Is there a global error handler?

## Cryptography

- [ ] Is crypto used? Check for: `crypto`, `bcrypt`, `argon2`, `sha`, `md5`
- [ ] Are passwords hashed with a strong algorithm? (bcrypt/argon2, not MD5/SHA1)
- [ ] Is HTTPS enforced? Look for redirect configs

## Data Handling

- [ ] Is PII (personally identifiable information) logged?
- [ ] Grep for: `email`, `phone`, `ssn`, `address` in log statements
- [ ] Is sensitive data encrypted at rest?
- [ ] Are database connections using TLS?

## Severity Ratings

| Severity | Criteria |
|----------|----------|
| CRITICAL | Exploitable vulnerability with direct impact (e.g., SQL injection, hardcoded secrets) |
| HIGH | Significant security gap likely exploitable (e.g., missing auth on admin routes) |
| MEDIUM | Security concern requiring specific conditions (e.g., verbose error messages) |
| LOW | Best practice deviation with minimal direct risk (e.g., unpinned dependencies) |
