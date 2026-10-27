# Progress

Updated at the end of each phase. "Verified" means checked by an automated test or a real run, and says which.

## Phase 1 — Foundation ✅

- [x] Repository inspected. Starter Next.js 16 app; the previous README described features that did not exist
      and was replaced.
- [x] Architecture and module layout ([architecture.md](architecture.md))
- [x] MongoDB connection with a clear "not configured" state
- [x] Users, organizations, memberships, sessions, projects, rate limits (Mongoose models + indexes)
- [x] Registration, login, logout, session resolution, organization switching
- [x] Organization roles (viewer/member/admin/owner) and system admin role
- [x] Organization-scoped projects service with domain normalization
- [x] Versioned JSON API (`/api/v1`) with Zod validation and consistent errors
- [x] Public site: home with domain entry, how it works, features, pricing (prices TBD), methodology, legal
      placeholders flagged for legal review, login and registration
- [x] Dashboard shell: overview with empty states, projects, project detail, settings
- [x] Admin panel: overview counts, user suspension/reactivation, configuration presence
- [x] CI: lint, typecheck, unit + MongoDB integration tests, build

Verification:

| Check                                  | Result                                                                |
| -------------------------------------- | --------------------------------------------------------------------- |
| `npm run lint`, `npm run typecheck`    | pass                                                                  |
| `npm test` — unit (51 tests)           | pass                                                                  |
| `npm test` — integration (11 tests)    | written; **not yet run** — the development sandbox could not download a MongoDB binary. CI runs them against `mongo:8` and fails if they cannot run. |
| `npm run build`                        | pass                                                                  |
| Production server smoke test (no DB)   | public pages 200; protected pages redirect to login with `next` preserved; API returns `UNAUTHENTICATED`, `CONFIG_MISSING`, cross-origin `FORBIDDEN`, and field-level `VALIDATION_FAILED` as designed; dashboard shows the error boundary |
| Signed-in flows against a real database | **not yet verified end to end** — covered by integration tests at the service level; Playwright E2E is planned for Phase 5 |

## Phase 2 — Automatic audit MVP (next)

- [ ] Choose the background job runner (see open decisions in architecture.md)
- [ ] SSRF-safe fetcher: DNS resolution, private-range blocking, pinned connections, per-hop redirect validation,
      timeouts, size limits
- [ ] Bounded crawler using robots.txt, sitemap.xml, canonical URLs, metadata, structured data
- [ ] Brand profile extraction with confidence; "unresolved" state instead of guessing
- [ ] Prompt generation (neutral, market/language-specific, branded kept separate, deduplicated)
- [ ] First provider: OpenAI Responses API with `web_search`, schema verified against current docs
- [ ] Audit records, job status transitions, idempotency keys, progress polling UI

Needs from you: `OPENAI_API_KEY` and model IDs, a MongoDB database, and the job-runner decision.

## Phase 3 — Real-data analytics

- [ ] Gemini with Google Search grounding
- [ ] Citation extraction and normalization; competitor detection and deduplication
- [ ] Metrics (mention rate, citation rate, prominence, share of voice, coverage, composite score with versioned formula)
- [ ] Audit report UI with traceability to stored answers

## Phase 4 — SaaS and admin

- [ ] Plans, quotas, usage ledger, cost estimates; Google AI Overviews via SerpApi
- [ ] Team invitations; admin job monitoring, retries, provider health, feature flags

## Phase 5 — Production readiness

- [ ] Playwright E2E, security review, email verification and password reset, data export/deletion,
      retention policies, deployment verification

## Launch checklist

- [x] Repository inspected and existing functionality preserved
- [ ] Authentication and organization isolation tested *(tests written; first CI run pending)*
- [ ] Domain crawler protected against SSRF
- [ ] At least one real AI provider successfully tested
- [ ] Real citations stored and rendered
- [ ] Visibility formulas unit-tested
- [ ] Audit usage and costs recorded
- [x] Admin routes protected *(proxy redirect + DAL check + service check)*
- [x] No fake live metrics
- [ ] Production environment and deployment verified
