# Phase 1 Implementation Plan

This plan translates the Phase 1 MVP requirements from `DESIGN.md` and the ordered stories in `TASKS.md` into an implementation sequence. Phase 1 is the file-based MVP: a bilingual English ↔ Assamese term mapper backed by JSON data, a Fastify API, an Expo web/mobile frontend, admin authentication, and deployable AWS infrastructure.

## Phase 1 Objective

Deliver a production-ready MVP that supports:

- Bidirectional English ↔ Assamese exact and partial search.
- A–Z / Assamese alphabet browsing.
- Public term-detail views with many-to-many equivalents.
- JWT-protected admin screens and APIs for term and mapping management.
- File-based persistence through `data/terms.json`, with IDs and slugs preserved for a future database migration.
- CI checks and an AWS deployment path for API, static web assets, and JSON data.

## Current Task Status

According to `TASKS.md`, Phase 1 Epics 1–12 and DevOps tasks 13.1–13.2 are already marked complete. The remaining unchecked Phase 1 work is:

1. `13.3` — GitHub Actions CI workflow: lint → type-check → test on every pull request.
2. `13.4` — GitHub Actions CD workflow: build Docker image → push to ECR → deploy to App Runner on merge to `main`.
3. `13.5` — Provision Phase 1 AWS resources: S3, CloudFront, App Runner, ECR, Secrets Manager.
4. `13.6` — Build and deploy the Expo web app static assets to S3/CloudFront.
5. `13.7` — Configure Route 53 and ACM for `termmapper.example.com`.

Because this repository currently contains only documentation files, implementation should begin by either restoring/adding the source tree described by the completed tasks or by reconciling `TASKS.md` with the actual repository state before closing any remaining Phase 1 items.

## Implementation Sequence

### 0. Repository Reconciliation Gate

Before implementing DevOps tasks, verify that the expected Phase 1 source tree exists:

- `apps/api`
- `apps/mobile`
- `packages/shared-types`
- `data/terms.json`
- `scripts/validate-data.ts`
- root workspace and tooling files
- API Dockerfile and local `docker-compose.yml`

If these files are missing, pause the DevOps-only path and rebuild the source tree in task order from Epic 1 through Epic 12. Do not mark DevOps deployment work complete until application code, seed data, tests, and local build commands exist.

### 1. Rebuild or Validate Core Phase 1 App

If the app source is missing, implement the completed stories in the same order as `TASKS.md`:

1. Create the pnpm workspace structure and root tooling.
2. Add shared TypeScript interfaces and Zod schemas.
3. Add `data/terms.json` with at least 20 English terms, Assamese equivalents, mappings, admin users, and data validation.
4. Build the Fastify API with repository, service, public route, auth, and admin route layers.
5. Add unit and integration tests for repository, service, auth, public API, and admin API behavior.
6. Build the Expo frontend with public search/browse/detail screens and protected admin screens.
7. Add API Dockerfile and local compose setup.

Acceptance criteria:

- `pnpm install` succeeds.
- `pnpm lint` succeeds.
- `pnpm typecheck` succeeds.
- `pnpm test` succeeds.
- API can run locally against `data/terms.json`.
- Expo web build succeeds with `EXPO_PUBLIC_API_URL` configured.

### 2. Implement Task 13.3 — CI Workflow

Create `.github/workflows/ci.yml`.

Recommended behavior:

- Trigger on pull requests and pushes to active branches.
- Use Node.js 22 and pnpm.
- Cache pnpm store.
- Install dependencies with frozen lockfile.
- Run data validation before app checks.
- Run lint, type-check, and tests.
- Optionally upload coverage if the test setup produces coverage output.

Suggested job steps:

1. `actions/checkout`
2. `pnpm/action-setup`
3. `actions/setup-node` with Node 22 and pnpm cache
4. `pnpm install --frozen-lockfile`
5. `pnpm validate:data`
6. `pnpm lint`
7. `pnpm typecheck`
8. `pnpm test`

Acceptance criteria:

- Workflow runs on PRs.
- Workflow fails on lint, type, data validation, or test failures.
- Workflow commands match actual package scripts.

### 3. Implement Task 13.4 — API CD Workflow

Create `.github/workflows/deploy-api.yml`.

Recommended behavior:

- Trigger on pushes to `main` and manual dispatch.
- Build the API Docker image from the API Dockerfile.
- Authenticate to AWS via GitHub OIDC, not long-lived AWS keys.
- Push image to ECR.
- Start an App Runner deployment using the pushed image or update the App Runner service source configuration.

Required GitHub variables/secrets:

- `AWS_REGION`
- `AWS_ROLE_TO_ASSUME`
- `ECR_REPOSITORY`
- `APP_RUNNER_SERVICE_ARN`

Acceptance criteria:

- Image tag includes the commit SHA.
- App Runner deployment is traceable to the image tag.
- Workflow has least-privilege AWS permissions.
- Failed deployment stops the workflow.

### 4. Implement Task 13.5 — AWS Infrastructure

Add infrastructure-as-code under `infra/`. Prefer Terraform or AWS CDK; choose one and document it in `infra/README.md`.

Provision these resources:

- S3 bucket for `terms.json` and static web assets.
- CloudFront distribution for web assets and cached JSON delivery.
- ECR repository for API images.
- App Runner service for the API container.
- Secrets Manager entries for `JWT_SECRET` and future runtime secrets.
- IAM roles for GitHub Actions OIDC deployment.
- CloudWatch log groups and basic retention settings.

Acceptance criteria:

- Infrastructure can be planned without manual console steps.
- Resource names are environment-aware, e.g. `dev`, `staging`, `prod`.
- Public access is blocked at S3 bucket level; CloudFront is the public entry point.
- Secrets are not committed.

### 5. Implement Task 13.6 — Web Static Deployment

Create `.github/workflows/deploy-web.yml` or fold web deployment into a coordinated CD workflow.

Recommended behavior:

- Trigger on pushes to `main` and manual dispatch.
- Install dependencies.
- Build the web app with `expo export --platform web`.
- Sync generated static assets to the S3 web prefix.
- Invalidate CloudFront paths for changed assets and `index.html`.

Required configuration:

- `EXPO_PUBLIC_API_URL`
- `WEB_ASSETS_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `AWS_REGION`
- `AWS_ROLE_TO_ASSUME`

Acceptance criteria:

- Web app loads from CloudFront.
- Deep links route correctly to Expo Router pages.
- Public pages can reach the deployed API.
- Admin login flow works against the deployed API.

### 6. Implement Task 13.7 — Domain, TLS, and DNS

Add domain resources to the infrastructure module:

- ACM certificate for `termmapper.example.com` in `us-east-1` for CloudFront.
- Route 53 hosted zone or DNS records, depending on domain ownership.
- Alias records for CloudFront and, if needed, API subdomain routing.

Recommended domain layout:

- `termmapper.example.com` — web app via CloudFront.
- `api.termmapper.example.com` — API endpoint via App Runner custom domain, if supported by the deployment strategy.

Acceptance criteria:

- HTTPS is enforced.
- HTTP redirects to HTTPS.
- Certificate validation is automated through DNS.
- API CORS allows only the expected web origin in production.

## Validation Checklist

Run this checklist before marking Phase 1 complete:

- `pnpm install --frozen-lockfile`
- `pnpm validate:data`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- API Docker image builds locally.
- API container starts and responds to health, search, browse, detail, login, and admin routes.
- Expo web export succeeds.
- CI workflow passes on a pull request.
- Infrastructure plan succeeds.
- API deployment workflow succeeds on `main`.
- Web deployment workflow succeeds on `main`.
- CloudFront URL serves the web app.
- Production domain serves HTTPS successfully.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `TASKS.md` marks app work complete but source files are absent | Add a repository reconciliation step before DevOps implementation. |
| AWS credentials leak into workflows | Use GitHub OIDC and Secrets Manager; never commit secret values. |
| S3 data and Git data drift | Define a single promotion process for `terms.json`; validate before upload. |
| App Runner deploys an image without matching frontend config | Tag images by SHA and pass deployed API URL explicitly to the web build. |
| Assamese sorting differs by runtime | Keep backend `Intl.Collator('as')` tests and add browser/mobile verification. |
| Admin JWT secret changes invalidate sessions | Store `JWT_SECRET` in Secrets Manager and rotate intentionally. |

## Definition of Done for Phase 1

Phase 1 is complete when the source tree matches the MVP design, all checked Phase 1 tasks are verifiably implemented, tasks 13.3–13.7 are complete, CI is green, and the deployed web app can search, browse, show term details, authenticate admins, and manage terms/mappings against the file-backed API.
