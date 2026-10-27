# AI Visibility Engine

A multi-tenant SaaS for AI search visibility monitoring. Enter a domain and a market; the engine discovers the
brand, generates neutral questions, collects real answers from supported AI/search APIs, and reports how often
the brand is mentioned and cited — with every metric traceable to the stored answers.

> **Status: Phase 1 (Foundation) complete; audits are not implemented yet.** Authentication, organizations,
> roles, projects, the public site, dashboard shell and admin panel work. Website discovery, prompt generation,
> provider integrations and metrics are the next milestones. See [docs/progress.md](docs/progress.md) for the
> live checklist. No visibility data is shown anywhere until a real audit has produced it.

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript, Tailwind CSS 4
- MongoDB + Mongoose 9, Zod 4
- Vitest (unit + MongoDB integration tests), GitHub Actions CI

The original plan named Next.js 14; the repository was already on Next.js 16, so it was kept rather than
downgraded. See [docs/architecture.md](docs/architecture.md) for structure and design decisions.

## Local setup

Requires Node.js 22.18+ and a MongoDB database (local `mongod`, Docker, or a free Atlas cluster).

```bash
npm ci
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
# edit .env.local and set MONGODB_URI
npm run dev
```

Open http://localhost:3000, create an account at `/register`, then create a project.

| Variable       | Required          | Purpose                                                                 |
| -------------- | ----------------- | ----------------------------------------------------------------------- |
| `MONGODB_URI`  | yes               | MongoDB connection string                                               |
| `MONGODB_DB`   | no                | Database name override                                                  |
| `APP_BASE_URL` | in production     | Exact public origin; cookie-authenticated mutations from other origins are rejected |

Provider variables (OpenAI, Gemini, SerpApi) will be added to `.env.example` as each integration is implemented.
Keep secrets in `.env.local` (git-ignored) or your host's secret settings — never in client code.

### Make yourself an administrator

Register normally, then:

```bash
npm run admin:grant -- you@example.com          # grant
npm run admin:grant -- you@example.com --revoke # revoke
```

The admin panel is at `/admin`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` runs unit tests everywhere. The MongoDB integration tests (auth, sessions, rate limits, organization
isolation, roles, admin suspension) need a database: they use `MONGODB_TEST_URI` if set, otherwise download a
temporary in-memory MongoDB. If neither is available they are skipped with a warning — except in CI, where
`REQUIRE_DB_TESTS=1` makes that a failure. CI runs them against a `mongo:8` service container.

## API

Versioned JSON endpoints under `/api/v1`, authenticated by the session cookie. Errors share one shape:
`{ "error": { "code", "message", "details?", "requestId" } }`.

| Method | Path                               | Notes                                |
| ------ | ---------------------------------- | ------------------------------------ |
| POST   | `/api/v1/auth/register`            | Creates user, organization, session  |
| POST   | `/api/v1/auth/login`               | Rate-limited per IP and per email    |
| POST   | `/api/v1/auth/logout`              |                                      |
| GET    | `/api/v1/auth/me`                  | Current user and organization        |
| GET    | `/api/v1/projects`                 | Projects in the active organization  |
| POST   | `/api/v1/projects`                 | `{ domain, country, languages[], name? }` |
| GET    | `/api/v1/projects/:projectId`      |                                      |
| DELETE | `/api/v1/projects/:projectId`      | Archives (org admin or owner)        |
| GET    | `/api/v1/admin/overview`           | System admins only                   |
| GET    | `/api/v1/admin/users`              | System admins only                   |
| PATCH  | `/api/v1/admin/users/:userId`      | `{ status: "active" \| "suspended" }` |
| GET    | `/api/v1/health`                   | Public; database reachability only   |

Audit, visibility, competitor, prompt, history and schedule endpoints arrive with Phases 2–3.

## Security model (implemented)

- Passwords: scrypt (N=2¹⁵, r=8, p=1) with per-user salt; constant-time comparison; dummy verification for unknown emails.
- Sessions: 256-bit random tokens in an `HttpOnly`, `SameSite=Lax` cookie (`__Host-` prefixed and `Secure` in
  production). Only a SHA-256 hash is stored; sessions expire after 30 days via a TTL index and are revalidated
  against the user, membership and organization on every request.
- Authorization: every service call receives an `AuthContext`; customer queries are always filtered by the active
  organization, and another organization's records are indistinguishable from missing ones (404).
- Roles: organization roles `viewer < member < admin < owner`, plus a separate system `admin` role for `/admin`.
- Suspending a user deletes their sessions immediately. Suspended organizations become read-only.
- Same-origin enforcement on cookie-authenticated API mutations; Server Actions use Next.js's built-in origin check.
- Login and registration rate limits stored in MongoDB, so they hold across serverless instances.
- Domain input is normalized and rejects IP literals, localhost and internal suffixes. Network-level SSRF
  protection for the crawler is part of Phase 2.

Not yet implemented: email verification, password reset, team invitations, per-plan quotas, billing.
