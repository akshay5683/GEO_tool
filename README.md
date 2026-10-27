# Radar · AI Visibility Intelligence

A real-data AI visibility monitoring application for SEO agencies. Includes persistent accounts and client projects, approved prompts, repeat scans, competitor/source reporting, Actions, expiring reports, a read-only data assistant, and public website checks. Built with Next.js, TypeScript, MongoDB/Mongoose, Trigger.dev, OpenAI, Gemini, and Tavily.

## Local setup

Requires Node 22.20+ and npm. From this directory in PowerShell:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
```

Edit `.env.local` locally. Do not paste secrets into the client UI or commit them.

| Setting                                 | Needed for                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `MONGODB_URI`                           | An existing MongoDB database or Atlas deployment; required                                       |
| `OPENAI_API_KEY`                        | Structured prompt generation, and OpenAI search if enabled; required                             |
| `OPENAI_PROMPT_MODEL`                   | Explicit model ID that supports structured text output; required                                 |
| `OPENAI_SEARCH_MODEL`                   | Explicit Responses API model ID supporting `web_search`; optional if Gemini search is configured |
| `GEMINI_API_KEY`, `GEMINI_SEARCH_MODEL` | Gemini API with Google Search grounding; optional if OpenAI search is configured                 |
| `TAVILY_API_KEY`                        | Optional independent traditional search evidence                                                 |
| `TRIGGER_PROJECT_ID`                    | Your Trigger.dev project reference; required                                                     |
| `TRIGGER_SECRET_KEY`                    | Trigger.dev environment secret, matching the dev or production worker; required                  |
| `APP_BASE_URL`                          | Exact browser origin, e.g. `http://localhost:3000`; required in production                       |
| `AUDIT_ACCESS_TOKEN`                    | Private beta signup / legacy audit code; required for production collection                      |

Model IDs must be available to your provider account. See [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search), [structured output](https://developers.openai.com/api/docs/guides/structured-outputs), and [Gemini grounding](https://ai.google.dev/gemini-api/docs/google-search). The application deliberately does not guess current model availability.

The quick-audit default is 15 generated questions and up to 46 paid calls including generation. Projects support up to 150 active questions, but every run must fit the configured call and estimated-budget limits. Defaults remain conservative: two concurrent requests, five scans per owner per UTC day, and ten globally. Selecting fewer providers changes the number of calls needed. Saved-project scans reuse approved questions and do not require prompt generation.

## Trigger.dev

1. Create a project in your Trigger.dev account and copy its project reference into `TRIGGER_PROJECT_ID`.
2. Use the development secret in local `.env.local`.
3. Authenticate the official CLI once:

   ```powershell
   npx.cmd trigger.dev@4.8.1 login
   ```

4. Start the two processes in separate terminals, both from this project:

   ```powershell
   npm.cmd run dev
   ```

   ```powershell
   npm.cmd run jobs:dev
   ```

The worker script explicitly loads `.env.local`. The task directory is `src/trigger`, the task ID is `visibility-audit`, and task configuration lives in `trigger.config.ts`. Next.js only creates and enqueues an audit; the durable task does the crawl and provider calls.

## Run the first real audit

1. Open `http://localhost:3000/settings`. Confirm required settings are configured. This checks their presence; the first actual run verifies connectivity and access.
2. Open `/audit`, enter a public domain such as `backlinksfusion.com`, choose Germany and German or English, and provide the beta code if configured.
3. Submit. You are redirected to `/audit/<auditId>`, which polls persisted progress every four seconds while the task runs.
4. Keep the Trigger.dev worker process running. Its dashboard should show the `visibility-audit` run.
5. Inspect provider comparisons, prompt answers and direct source links. Tavily results appear in their own search-evidence tab. Export the report as JSON if needed.

Provider and Trigger.dev credentials are still needed for a live AI scan. No synthetic report is presented as customer data. Store real credentials only in ignored `.env.local` or deployment secret settings; `.env.example` contains no connection credentials.

## Project monitoring workflow

1. Start the app and open `/projects`. Create an account with a password of at least 12 characters, then create a client project.
2. Review the profile, market, language, own brand, competitors and aliases. Add questions individually, paste one per line, or import CSV. Existing owned audits can be imported as suggestions.
3. Review Suggested prompts, then activate the intended set. Archive questions to stop future collection without removing history. Set topics and tags for filtering.
4. Start a scan. The approved prompt set, roster, providers, model IDs and project version are preserved with the run. Inspect each saved answer and citation behind the metrics.
5. Use domain/URL reports and competitor-only answer evidence to investigate gaps. Build reviewable Actions, add a brief, and track progress through completion.
6. Choose Daily or Weekly in project settings if recurring collection is wanted. Deploy the Trigger.dev worker, including `project-monitoring-scheduler`; its 15-minute dispatcher enqueues due projects and skips catch-up bursts.
7. Export JSON/CSV or create a seven-day read-only aggregate report link. Links can be replaced or revoked; raw answers and private facts are excluded from public reports. Use Print / Save PDF for a browser-generated PDF.

Project Overview separates branded and non-branded question performance. First-mention order is a text-order metric, not a recommendation rank. Trends disclose configuration and recorded-model differences. Connections includes an on-demand public homepage/robots/sitemap/llms.txt check. The data assistant reads saved project evidence and cannot change tracking or execute external tools.

See [platform scope and operation](docs/platform.md) for limits and remaining integrations.

## Checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

With the app running and no live service credentials configured:

```powershell
node scripts/verify-http.mjs
```

The smoke check verifies all interface routes, configuration/list endpoints, unsafe domain rejection, and the missing-configuration error. Set `SMOKE_BASE_URL` to change its origin. The creation expectations deliberately assume an unconfigured local server; do not run this script against a configured production app.

Unit/integration tests mock paid providers. The separate [platform HTTP verifier](scripts/verify-platform-http.mjs) exercises real MongoDB persistence and HTTP account/project/report boundaries against an explicitly isolated loopback QA database. It refuses non-QA database names or configured paid-provider environments. A real provider-backed audit remains necessary to verify credentials and permissions.

## Architecture

```text
src/app                 Public UI and short route handlers
src/components          Dashboard, form, progress, report and charts
src/lib                 Shared types, validation, configuration and DB connection
src/models              Namespaced Mongoose schemas and additive indexes
src/server/audit         Discovery, prompt generation, scoring and orchestration
src/server/providers     OpenAI, Gemini and Tavily adapters
src/trigger             Durable audit task
tests                   Unit and integration tests with mocked external boundaries
```

The score is versioned: **70% brand mention rate + 30% own-domain citation rate**. Rates count successful AI answers once; repeated source links never inflate the denominator. Tavily, failed requests and skipped requests are excluded. With no valid AI answers, metrics are unavailable, not an invented zero score.

## Security and operational limits

- Homepage requests allow public HTTP(S) domains only. DNS answers are checked, the connection is pinned to a validated address, and every redirect is revalidated. Fetches have a 15-second total deadline, at most three redirects and a 1 MB uncompressed HTML limit. No cookies or authorization headers are forwarded.
- Accounts use salted scrypt passwords and opaque, hashed, expiring server sessions. Project ownership persists across sign-ins. Anonymous quick audits retain their browser-session access model; the current browser's anonymous audits are claimed on registration. All private reports and mutations check ownership.
- Production creation fails closed unless an exact `APP_BASE_URL` and private beta `AUDIT_ACCESS_TOKEN` are set. Mutations verify their origin. Creation has durable global/session rate limits, a ten-minute deduplication key, and Trigger.dev idempotency keys.
- Each `(audit, prompt, provider)` has a unique record. Completed results are reused on retries. Requests whose outcome is uncertain are not automatically repeated. If queue acknowledgement fails, inspect the audit ID in Trigger.dev before resubmitting.
- Hard call limits, output limits, concurrency and configurable estimated spend reservations are implemented. **Estimated reservations are not a guaranteed monetary cap.** Set provider-account spend controls as well.
- Collections use the `radar_` prefix. Existing data is preserved. The app never resets databases, drops collections or requires transactions.
- Team editor/viewer memberships, email verification/recovery, subscriptions, automatic consumer-UI collection, GA4/server-log ingestion, Ads and Shopping integrations are not implemented. The product does not fabricate these data sources. Browser printing is available; a dedicated white-label PDF renderer is not included.

## Production deployment

Deploy the Next.js application to Vercel with the same environment variable names and a production `APP_BASE_URL`. Use production Trigger.dev credentials and set `AUDIT_ACCESS_TOKEN` to restrict the initial beta. Set the worker's MongoDB and provider settings in Trigger.dev's environment-variable dashboard; Vercel variables are not automatically shared with the worker. Deploy the worker separately:

```powershell
npm.cmd run jobs:deploy
```

Ensure Atlas/network rules allow both the web server and Trigger.dev worker, use a database-scoped credential, and configure provider budgets. This implementation does not publish or create paid services automatically.

See [implementation notes](docs/implementation.md) for scope, evidence limitations, dependency notes and official integration references.
#   G E O _ t o o l  
 