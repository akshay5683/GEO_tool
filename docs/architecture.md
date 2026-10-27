# Architecture

## Shape: one Next.js app, layered server modules

The brief proposes four applications (public site, user dashboard, admin panel, backend API + engine). They are
implemented as **route areas of a single Next.js application** sharing one service layer, rather than a
multi-package monorepo:

| Application        | Location                              | Access                          |
| ------------------ | ------------------------------------- | ------------------------------- |
| Public website     | `src/app/(marketing)`, `src/app/(auth)` | Anyone                          |
| User dashboard     | `src/app/dashboard`                   | Signed-in users, org-scoped     |
| Admin panel        | `src/app/admin`                       | `systemRole = admin`            |
| Backend API        | `src/app/api/v1`                      | Session cookie; admin namespace |

Reasons: one deployment and one auth/session implementation; no duplicated models or types; strict permission
separation is enforced in the service layer, not by process boundaries. The background **worker** for long
audits will be a separate process entry point (Phase 2) that imports the same `src/server` modules. If a
separate admin deployment is ever needed, `src/server` can be extracted into a package without changes to the
services themselves.

## Layers

```text
src/app/**/page.tsx, actions.ts   UI and Server Actions — thin; parse form data, call services
src/app/api/v1/**/route.ts        JSON API — thin; wrapped by route() for errors, request ids, origin checks
src/server/auth/session.ts        Data Access Layer: cookie → AuthContext (per-request, deduplicated)
src/server/<module>/service.ts    Business logic; every function takes an AuthContext and enforces roles
src/server/db/models              Mongoose schemas, indexes, collection names
src/lib                           Isomorphic code: Zod schemas, domain normalization, markets
src/components                    UI primitives and shared components
```

Rules:

- Pages, actions and route handlers never query models directly — they call services.
- Services never trust ids from the client: organization scope comes from the `AuthContext`.
- Errors meant for users are `AppError`s with a code; anything else is logged and returned as a generic 500.

## Backend modules (from the brief) and where they live

| Module                | Location                    | Status        |
| --------------------- | --------------------------- | ------------- |
| Auth & users          | `src/server/auth`           | Phase 1 ✓     |
| Projects & domains    | `src/server/projects`       | Phase 1 ✓     |
| Website intelligence  | `src/server/crawler`        | Phase 2       |
| Prompt engine         | `src/server/prompts`        | Phase 2       |
| AI provider engine    | `src/server/providers`      | Phase 2–3     |
| Visibility analytics  | `src/server/analytics`      | Phase 3       |
| Scheduler & jobs      | `src/server/jobs`           | Phase 2–4     |
| Billing & usage       | `src/server/billing`        | Phase 4       |
| Admin                 | `src/server/admin`          | Phase 1 (users, system status) |

## Next.js 16 specifics

- `cacheComponents` is enabled. Anything that reads the session runs behind a `<Suspense>` boundary (the
  `AppShell` wraps page content), and the DAL calls `connection()` before touching the database so session
  reads never run during prerendering or prefetching.
- `src/proxy.ts` (formerly `middleware`) only performs an optimistic cookie-presence redirect. Real
  authorization is in the DAL and services.
- Route handlers use `unstable_rethrow` so Next.js control-flow signals are not swallowed by error handling.

## Data model (Phase 1)

| Collection      | Purpose                                     | Key indexes                                    |
| --------------- | ------------------------------------------- | ---------------------------------------------- |
| `users`         | Accounts, system role, status               | `email` unique                                 |
| `organizations` | Tenants                                     |                                                |
| `memberships`   | User ↔ organization with role               | `(organizationId, userId)` unique              |
| `sessions`      | Hashed session tokens                       | `tokenHash` unique, `expiresAt` TTL            |
| `projects`      | Domain + market per organization            | `(organizationId, domain, country)` unique     |
| `rateLimits`    | Fixed-window counters                       | `(key, windowStart)` unique, TTL               |

Later phases add `brandProfiles`, `competitors`, `prompts`, `audits`, `auditJobs`, `providerExecutions`,
`responses`, `citations`, `visibilitySnapshots`, `subscriptions`, `usageLedger` and `systemSettings`. Every
customer-owned collection carries `organizationId` (and `projectId` where relevant) and is queried through
organization-scoped services.

No operation requires MongoDB transactions, so standalone servers work. Multi-document writes that must not
leave partial state (registration) compensate on failure.

## Decisions still open

- **Background jobs**: Inngest vs Trigger.dev vs a MongoDB-backed queue with a separate worker. To be decided at
  the start of Phase 2, based on where you want to deploy and whether an external account is acceptable.
- **UI kit**: lightweight in-house primitives (`src/components/ui.tsx`) styled like shadcn/ui. shadcn/ui and
  Recharts can be adopted when charts and complex widgets arrive in Phase 3.
