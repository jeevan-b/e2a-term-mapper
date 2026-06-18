# Term Mapper — Task List

> Prioritized user stories ordered so each builds on the previous.
> Work through these top-to-bottom; do not skip ahead.
>
> **Legend:** Each story is tagged with the layer it primarily affects.
> `[infra]` `[data]` `[api]` `[auth]` `[frontend]` `[test]` `[devops]`

---

## Phase 1 — MVP (File-based)

### 🏗️ Epic 1: Monorepo & Project Scaffolding

- [x] **1.1** `[infra]` Initialise the monorepo with `pnpm workspaces` and create the top-level folder structure (`apps/api`, `apps/mobile`, `packages/shared-types`, `data/`, `infra/`)
- [x] **1.2** `[infra]` Add root-level `pnpm-workspace.yaml`, `.gitignore`, `.nvmrc` (Node 22), and `README.md`
- [x] **1.3** `[infra]` Configure root ESLint and Prettier with a shared config that all packages extend
- [x] **1.4** `[infra]` Add a `docker-compose.yml` for local development (API service only in Phase 1)

---

### 📦 Epic 2: Shared Types Package

- [x] **2.1** `[data]` Scaffold `packages/shared-types` with its own `package.json` and `tsconfig.json` (strict mode)
- [x] **2.2** `[data]` Define and export TypeScript interfaces: `EnglishTerm`, `AssameseTerm`, `TermMapping`, `TermsData`
- [x] **2.3** `[data]` Write Zod schemas matching those interfaces: `englishTermSchema`, `assameseTermSchema`, `termMappingSchema`, `termsDataSchema`
- [x] **2.4** `[data]` Export Zod-inferred types alongside the hand-written interfaces so both `apps/api` and `apps/mobile` can import from `@term-mapper/shared-types`

---

### 🗄️ Epic 3: Seed Data File

- [x] **3.1** `[data]` Create `data/terms.json` with at least 20 English terms, their Assamese equivalents, and mappings (including multi-mapping examples like `dilemma` → two Assamese terms)
- [x] **3.2** `[data]` Validate the seed file against `termsDataSchema` (write a one-off script in `scripts/validate-data.ts`)
- [x] **3.3** `[data]` Ensure every Assamese term has a romanised slug (e.g., `domoja` for `দোমোজা`) and every English term has a lowercase ASCII slug

---

### ⚙️ Epic 4: Backend — Project Setup

- [x] **4.1** `[api]` Scaffold `apps/api` with its own `package.json`, `tsconfig.json` (strict mode), and Vitest config
- [x] **4.2** `[api]` Install and configure Fastify with `fastify-type-provider-zod` for end-to-end TypeScript safety
- [x] **4.3** `[api]` Create `src/server.ts` (Fastify instance creation + plugin registration) and `src/app.ts` (entry point that starts the server)
- [x] **4.4** `[api]` Add environment variable loading (`dotenv`) and define an `env.ts` module that reads and validates `NODE_ENV`, `PORT`, `JWT_SECRET`, `DATA_FILE_PATH`
- [x] **4.5** `[api]` Implement a global error handler that returns `{ "error": "<message>" }` for all error responses

---

### 🗂️ Epic 5: Backend — Repository Layer (Phase 1)

- [x] **5.1** `[api]` Define a `ITermRepository` interface in `src/repositories/term-repository.interface.ts` with methods for all data operations (search, get by slug, browse, list, create, update, delete, stats)
- [x] **5.2** `[api]` Implement `JsonTermRepository` in `src/repositories/json-term-repository.ts` that loads `terms.json` into memory on startup
- [x] **5.3** `[api]` Implement `search(query, options)` in `JsonTermRepository` — exact match and case-insensitive substring (fuzzy) across both languages simultaneously
- [x] **5.4** `[api]` Implement `getEnglishTermBySlug(slug)` and `getAssameseTermBySlug(slug)` with full equivalents resolved
- [x] **5.5** `[api]` Implement `browseEnglish(letter, page, limit)` and `browseAssamese(letter, page, limit)` with correct sort order (`Intl.Collator` with locale `'as'` for Assamese)
- [x] **5.6** `[api]` Implement `getStats()` returning counts of English terms, Assamese terms, and mappings
- [x] **5.7** `[api]` Implement admin write methods: `createEnglishTerm`, `updateEnglishTerm`, `deleteEnglishTerm`, `createAssameseTerm`, `updateAssameseTerm`, `deleteAssameseTerm`, `createMapping`, `deleteMapping` — each persists changes back to the JSON file
- [x] **5.8** `[test]` Write unit tests for `JsonTermRepository` covering search, browse, CRUD, and edge cases (not-found, duplicate, cascade delete)

---

### 🔧 Epic 6: Backend — Service Layer

- [x] **6.1** `[api]` Implement `TermService` in `src/services/term-service.ts`, accepting an `ITermRepository` via constructor injection
- [x] **6.2** `[api]` Implement `search` in `TermService` — delegates to repository, formats the `english_matches` / `assamese_matches` response shape
- [x] **6.3** `[api]` Implement `getEnglishTerm` and `getAssameseTerm` in `TermService` — throws a typed `NotFoundError` if missing
- [x] **6.4** `[api]` Implement `browseEnglish` and `browseAssamese` in `TermService`
- [x] **6.5** `[api]` Implement admin service methods: term CRUD and mapping CRUD, including duplicate-detection (throws `ConflictError`) and cascade-delete logic
- [x] **6.6** `[api]` Implement `getStats` in `TermService`
- [x] **6.7** `[test]` Write unit tests for `TermService` with a mocked `ITermRepository` — cover happy paths, `NotFoundError`, and `ConflictError`

---

### 🌐 Epic 7: Backend — Public API Routes

- [x] **7.1** `[api]` Register `GET /v1/search` route — validate `q`, `lang`, `mode`, `limit` query params with Zod; delegate to `TermService.search`
- [x] **7.2** `[api]` Register `GET /v1/terms/en/:slug` route — return English term with Assamese equivalents; return `404` if not found
- [x] **7.3** `[api]` Register `GET /v1/terms/as/:slug` route — return Assamese term with English equivalents; return `404` if not found
- [x] **7.4** `[api]` Register `GET /v1/browse/en` route — validate `letter`, `page`, `limit`; return paginated English terms
- [x] **7.5** `[api]` Register `GET /v1/browse/as` route — validate `letter` (Assamese Unicode character), `page`, `limit`; return paginated Assamese terms
- [x] **7.6** `[test]` Write integration tests for all public routes using Fastify's `inject()` — cover valid inputs, invalid inputs (`400`), and not-found (`404`)

---

### 🔐 Epic 8: Backend — Authentication

- [x] **8.1** `[auth]` Add a `users` entry to `terms.json` (Phase 1 admin user store) with a bcrypt-hashed password
- [x] **8.2** `[auth]` Implement `AuthService` in `src/services/auth-service.ts` with `login(email, password)` → JWT and `verifyToken(token)` → payload
- [x] **8.3** `[auth]` Register `POST /v1/auth/login` route — validate body with Zod; return `{ token, expires_in }` on success, `401` on failure
- [x] **8.4** `[auth]` Register `POST /v1/auth/logout` route — return `204` (client discards token; server-side blocklist deferred to Phase 2)
- [x] **8.5** `[auth]` Implement a Fastify `preHandler` hook (`requireAuth`) that verifies the `Authorization: Bearer <jwt>` header and attaches the decoded payload to `request.user`
- [x] **8.6** `[test]` Write unit tests for `AuthService` and integration tests for `/auth/login` (valid credentials, wrong password, missing fields)

---

### 🛠️ Epic 9: Backend — Admin API Routes

- [x] **9.1** `[api]` Register `GET /v1/admin/terms/en` — paginated list with optional `q` filter; protected by `requireAuth`
- [x] **9.2** `[api]` Register `POST /v1/admin/terms/en` — create English term; `409` on duplicate
- [x] **9.3** `[api]` Register `PUT /v1/admin/terms/en/:id` — update English term; `404` if missing
- [x] **9.4** `[api]` Register `DELETE /v1/admin/terms/en/:id` — delete English term; `409` if active mappings exist unless `?force=true`
- [x] **9.5** `[api]` Register the four Assamese term admin routes (`GET`, `POST`, `PUT`, `DELETE` `/v1/admin/terms/as`) mirroring the English routes
- [x] **9.6** `[api]` Register `GET /v1/admin/mappings` — paginated, filterable list of mappings
- [x] **9.7** `[api]` Register `POST /v1/admin/mappings` — create mapping; `409` on duplicate
- [x] **9.8** `[api]` Register `DELETE /v1/admin/mappings/:id` — delete mapping; `404` if not found
- [x] **9.9** `[api]` Register `GET /v1/admin/stats` — return aggregate counts
- [x] **9.10** `[test]` Write integration tests for all admin routes — cover auth guard (`401` without token), happy paths, and error cases

---

### 📱 Epic 10: Frontend — Project Setup

- [x] **10.1** `[frontend]` Scaffold `apps/mobile` with Expo SDK 52, TypeScript strict mode, and Expo Router
- [x] **10.2** `[frontend]` Install and configure NativeWind v4 (Tailwind CSS for React Native)
- [x] **10.3** `[frontend]` Install TanStack Query v5 and wrap the app root with `QueryClientProvider`
- [x] **10.4** `[frontend]` Install `ky` and create `src/lib/api-client.ts` — a typed `ky` instance reading the base URL from `EXPO_PUBLIC_API_URL`
- [x] **10.5** `[frontend]` Create `src/lib/detect-language.ts` — detects whether a string is Assamese (Unicode U+0980–U+09FF) or English (Latin) to drive bidirectional search
- [x] **10.6** `[frontend]` Set up a global `ErrorBoundary` and loading skeleton component for use across all screens

---

### 🖥️ Epic 11: Frontend — Public Screens

- [x] **11.1** `[frontend]` Build the Home screen (`/`) — app name, tagline, search input, and link to Browse
- [x] **11.2** `[frontend]` Wire search input to `GET /v1/search` via a TanStack Query `useQuery` with 300 ms debounce; navigate to `/search?q=` on submit
- [x] **11.3** `[frontend]` Build the Search Results screen (`/search`) — display `english_matches` and `assamese_matches` as tappable cards; handle empty state
- [x] **11.4** `[frontend]` Build the English Term Detail screen (`/term/en/[slug]`) — large term heading, list of Assamese equivalents as tappable chips/cards
- [x] **11.5** `[frontend]` Build the Assamese Term Detail screen (`/term/as/[slug]`) — large Assamese term heading (correct Unicode font), list of English equivalents
- [x] **11.6** `[frontend]` Build the Browse Index screen (`/browse`) — two tabs (English A–Z letter grid, Assamese alphabet grid)
- [x] **11.7** `[frontend]` Build the Browse by Letter screen (`/browse/en/[letter]`) — paginated English term list
- [x] **11.8** `[frontend]` Build the Browse by Letter screen (`/browse/as/[letter]`) — paginated Assamese term list with `Intl.Collator` sort order
- [x] **11.9** `[frontend]` Add a persistent bottom tab bar or header navigation linking Home and Browse

---

### 🔑 Epic 12: Frontend — Auth & Admin Screens

- [x] **12.1** `[frontend]` Build the Login screen (`/login`) — React Hook Form + Zod resolver; calls `POST /v1/auth/login`; stores JWT in secure storage; redirects to `/admin` on success
- [x] **12.2** `[frontend]` Implement a route guard that redirects unauthenticated users away from all `/admin/*` routes to `/login`
- [x] **12.3** `[frontend]` Build the Admin Dashboard (`/admin`) — stats cards (total English terms, Assamese terms, mappings) + quick-action buttons
- [x] **12.4** `[frontend]` Build the Manage Mappings screen (`/admin/mappings`) — paginated, searchable table; Add Mapping form (select or create terms); delete with confirmation
- [x] **12.5** `[frontend]` Build the Manage English Terms screen (`/admin/terms/en`) — paginated table with inline edit and delete (cascade warning)
- [x] **12.6** `[frontend]` Build the Manage Assamese Terms screen (`/admin/terms/as`) — same as above; ensure correct Unicode rendering in all inputs and displays
- [x] **12.7** `[frontend]` Implement logout — call `POST /v1/auth/logout`, clear JWT from secure storage, redirect to `/login`

---

### 🚀 Epic 13: DevOps — Phase 1 Deployment

- [x] **13.1** `[devops]` Write a `Dockerfile` for `apps/api` (multi-stage: build → production image)
- [x] **13.2** `[devops]` Add a `docker-compose.yml` entry for local end-to-end testing (API + static file server)
- [x] **13.3** `[devops]` Create a GitHub Actions CI workflow: lint → type-check → test on every pull request
- [x] **13.4** `[devops]` Create a GitHub Actions CD workflow: build Docker image → push to ECR → deploy to App Runner on merge to `main`
- [x] **13.5** `[devops]` Provision AWS resources for Phase 1: S3 bucket (JSON file + web assets), CloudFront distribution, App Runner service, ECR repository, Secrets Manager entries
- [x] **13.6** `[devops]` Build the Expo web app (`expo export --platform web`) and deploy static assets to S3/CloudFront
- [x] **13.7** `[devops]` Configure Route 53 + ACM for the placeholder domain (`termmapper.example.com`)

---

## Phase 2 — Database

### 🗃️ Epic 14: Database Layer (Optional)

> ⚠️ **These tasks are optional. Only begin Epic 14 if the Phase 1 JSON file approach becomes a performance bottleneck. Do not start these tasks as a matter of course.**

- [ ] **14.1** `[api]` Write Drizzle ORM schema files in `apps/api/src/db/schema/` for `english_terms`, `assamese_terms`, `term_mappings`, and `users`
- [ ] **14.2** `[api]` Configure Drizzle Kit and generate the initial migration
- [ ] **14.3** `[api]` Write a one-off migration script that reads `data/terms.json` and inserts all records into PostgreSQL (preserving IDs)
- [ ] **14.4** `[api]` Implement `DrizzleTermRepository` implementing `ITermRepository` — drop-in replacement for `JsonTermRepository`
- [ ] **14.5** `[api]` Enable the `pg_trgm` extension on RDS and replace in-memory fuzzy search with a `ILIKE` / trigram query in `DrizzleTermRepository.search`
- [ ] **14.6** `[test]` Write integration tests for `DrizzleTermRepository` against a local PostgreSQL instance (via Docker Compose)
- [ ] **14.7** `[devops]` Add RDS PostgreSQL 16 to infrastructure (Multi-AZ for production); store connection string in Secrets Manager
- [ ] **14.8** `[devops]` Update CD pipeline to run Drizzle migrations before deploying the new API image

---

## Phase 3 — Growth (Future)

- [ ] **15.1** `[frontend]` Add a "Suggest a missing term" form on term detail pages (public, unauthenticated)
- [ ] **15.2** `[api]` Add a `POST /v1/suggestions` endpoint that stores suggestions (new table: `suggestions`)
- [ ] **15.3** `[admin]` Add a Suggestions review screen to the admin panel to accept or reject submissions
- [ ] **15.4** `[devops]` Integrate CloudWatch dashboards for API error rates, latency, and search query volume
- [ ] **15.5** `[api]` Add a public read-only API key system for third-party access to search and browse endpoints
- [ ] **15.6** `[devops]` Prepare Expo app for iOS App Store and Google Play Store submission (app icons, splash screens, store metadata)

---

## Feature Extensions

- **[Add Mapping Flow](./add-mapping-flow.tasks.md)** — Allow users to add a new term mapping directly from search results or term detail pages (no auth required). Includes auto-generated Assamese slugs via `keys.json`.
- **[UI Polish](./ui-polish.tasks.md)** — Rebrand the app header to **পৰিভাষা**, fix spacing and visual clutter across all screens for a cleaner, more breathable layout.
- **[S3 Data Decoupling](./s3-data-decoupling.tasks.md)** — Decouple `data/terms.json` from the Git repository and load it from an AWS S3 bucket at runtime, enabling independent data updates without code deploys.

---

*Tasks derived from `DESIGN.md` v1.0 — update this file as scope changes.*
