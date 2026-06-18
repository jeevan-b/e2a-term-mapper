# Term Mapper — Design Document

> **Bilingual term-mapping app between English and Assamese**
> Version: 1.0 | Date: March 4, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Data Model](#2-data-model)
3. [Tech Stack](#3-tech-stack)
4. [App Screens & Pages](#4-app-screens--pages)
5. [API Endpoints](#5-api-endpoints)
6. [Infrastructure & Deployment](#6-infrastructure--deployment)
7. [Phased Roadmap](#7-phased-roadmap)

---

## 1. Project Overview

Term Mapper is a bilingual term-mapping application between English and Assamese. It is **not a dictionary** — it maps terms to equivalent terms across languages. The relationship is **many-to-many**: one English term can have multiple Assamese equivalents, and one Assamese term can map back to multiple English terms.

**Example:**
- `dilemma` → `উভয় সংকট`, `দোমোজা`
- `দোমোজা` → `dilemma`

### Key Characteristics

| Property | Value |
|---|---|
| Languages | English ↔ Assamese |
| Script (Assamese) | Unicode only (no transliteration) |
| Search | Exact + fuzzy/partial, bidirectional |
| Browsing | A–Z index for both languages |
| Platform | Web + Mobile (single codebase) |
| Admin access | Same app, behind authentication |
| Offline support | Not required |
| Hosting | AWS |

---

## 2. Data Model

### 2.1 Core Concept

The relationship between English and Assamese terms is **many-to-many**, modelled via a junction table:

```
EnglishTerm ──< TermMapping >── AssameseTerm
```

---

### 2.2 Phase 1 — File-Based (JSON)

Used during the MVP phase. Stored as a single JSON file in AWS S3.

**File: `data/terms.json`**

```json
{
  "version": "1.0",
  "last_updated": "2026-03-04T00:00:00Z",
  "english_terms": [
    { "id": "e001", "term": "dilemma", "slug": "dilemma" },
    { "id": "e002", "term": "hope",    "slug": "hope"    }
  ],
  "assamese_terms": [
    { "id": "a001", "term": "উভয় সংকট", "slug": "ubhay-sankat" },
    { "id": "a002", "term": "দোমোজা",    "slug": "domoja"       },
    { "id": "a003", "term": "আশা",        "slug": "aasha"        }
  ],
  "mappings": [
    { "id": "m001", "english_id": "e001", "assamese_id": "a001" },
    { "id": "m002", "english_id": "e001", "assamese_id": "a002" },
    { "id": "m003", "english_id": "e002", "assamese_id": "a003" }
  ]
}
```

**Design notes:**
- IDs are intentionally present so that a future database migration, if ever needed, would be a direct import — no remapping required.
- `slug` enables clean URLs and A–Z browsing in both phases.
- The file is version-controllable in Git for auditability.

---

### 2.3 Phase 2 — Relational Database (PostgreSQL on AWS RDS, Optional)

Three tables reflecting the many-to-many relationship:

#### `english_terms`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary Key, default `gen_random_uuid()` |
| `term` | TEXT | Not Null, Unique |
| `slug` | TEXT | Not Null, Unique |
| `created_at` | TIMESTAMPTZ | Not Null, default `now()` |
| `updated_at` | TIMESTAMPTZ | Not Null, default `now()` |

#### `assamese_terms`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary Key, default `gen_random_uuid()` |
| `term` | TEXT | Not Null, Unique |
| `slug` | TEXT | Not Null, Unique |
| `created_at` | TIMESTAMPTZ | Not Null, default `now()` |
| `updated_at` | TIMESTAMPTZ | Not Null, default `now()` |

#### `term_mappings`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary Key, default `gen_random_uuid()` |
| `english_term_id` | UUID | FK → `english_terms.id`, Not Null |
| `assamese_term_id` | UUID | FK → `assamese_terms.id`, Not Null |
| `created_at` | TIMESTAMPTZ | Not Null, default `now()` |

**Constraints:**
- `UNIQUE (english_term_id, assamese_term_id)` — prevents duplicate mappings.
- Cascade deletes: deleting a term removes its mappings automatically.

#### `users` (Admin accounts)

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary Key, default `gen_random_uuid()` |
| `email` | TEXT | Not Null, Unique |
| `password_hash` | TEXT | Not Null |
| `role` | TEXT | Not Null, default `'admin'` |
| `created_at` | TIMESTAMPTZ | Not Null, default `now()` |
| `last_login_at` | TIMESTAMPTZ | Nullable |

---

### 2.4 Indexes

```sql
-- Full-text / trigram search (Phase 2, requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_english_terms_trgm  ON english_terms  USING GIN (term gin_trgm_ops);
CREATE INDEX idx_assamese_terms_trgm ON assamese_terms USING GIN (term gin_trgm_ops);

-- A–Z browsing by first letter of slug
CREATE INDEX idx_english_terms_slug  ON english_terms  (slug);
CREATE INDEX idx_assamese_terms_slug ON assamese_terms (slug);
```

---

### 2.5 Entity Relationship Diagram

```
┌──────────────────┐        ┌───────────────────┐        ┌──────────────────┐
│  english_terms   │        │   term_mappings   │        │  assamese_terms  │
│──────────────────│        │───────────────────│        │──────────────────│
│ id (PK)          │◄──────►│ english_term_id   │◄──────►│ id (PK)          │
│ term             │   1:N  │ assamese_term_id  │  N:1   │ term             │
│ slug             │        │ id (PK)           │        │ slug             │
│ created_at       │        │ created_at        │        │ created_at       │
│ updated_at       │        └───────────────────┘        │ updated_at       │
└──────────────────┘                                     └──────────────────┘
```

---

## 3. Tech Stack

### 3.1 Backend

| Layer | Technology | Justification |
|---|---|---|
| Runtime | **Node.js 22 LTS** | Excellent Unicode/Assamese string handling; large ecosystem |
| Framework | **Fastify** | TypeScript-native, ~35% faster than Express, built-in schema validation |
| Language | **TypeScript** | Type safety; shared types can be consumed by the frontend |
| ORM (Phase 2) | **Drizzle ORM** | Lightweight, TypeScript-first, schema-as-code, great PostgreSQL support |
| Validation | **Zod** | Runtime schema validation for all API inputs; composable schemas |
| Auth | **JWT (jsonwebtoken)** | Stateless tokens for admin sessions; easy to implement and verify |
| Password hashing | **bcrypt** | Industry-standard for storing admin credentials |
| Testing | **Vitest** | Fast, TypeScript-native unit and integration tests |
| Phase 1 data | **JSON file on AWS S3** | Portable, version-controllable, zero DB cost for MVP |

### 3.2 Frontend (Web + Mobile)

| Layer | Technology | Justification |
|---|---|---|
| Framework | **React Native + Expo** | Single codebase targets iOS, Android, and Web |
| Language | **TypeScript** | Shared type definitions with the backend |
| Styling | **NativeWind v4** (Tailwind for RN) | Consistent, utility-first styling across all platforms |
| Navigation | **Expo Router** | File-based routing; works natively on web and mobile |
| Data fetching | **TanStack Query v5** | Caching, background refresh, loading/error states, search debouncing |
| HTTP client | **ky** | Lightweight fetch wrapper; works in React Native and browsers |
| Forms (admin) | **React Hook Form + Zod** | Performant form handling with shared Zod validation schemas |

### 3.3 Infrastructure (AWS)

| Service | Purpose |
|---|---|
| **S3** | Phase 1: host `terms.json`; Phase 2: static web app assets |
| **CloudFront** | CDN for web app and API caching |
| **App Runner** | Containerised backend API — simpler than ECS Fargate, no ALB required, ~$5–7/month at low traffic, migratable to Fargate later |
| **ECR** | Docker image registry; App Runner pulls directly from ECR |
| **RDS PostgreSQL 16** | Phase 2 database — optional; only needed if the JSON file approach becomes a bottleneck |
| **Secrets Manager** | Store DB credentials, JWT secret |
| **Cognito** | Optional Phase 2 upgrade for admin auth (or keep JWT) |
| **Route 53** | DNS management |
| **ACM** | SSL/TLS certificates |
| **CloudWatch** | Logging and monitoring |

### 3.4 Developer Tooling

| Tool | Purpose |
|---|---|
| **pnpm workspaces** | Monorepo package management |
| **Docker + Docker Compose** | Local development environment |
| **ESLint + Prettier** | Code quality and formatting |
| **GitHub Actions** | CI/CD pipeline |

---

## 4. App Screens & Pages

> Routes follow Expo Router file-based conventions.
> `(public)` = no auth required. `(admin)` = requires admin JWT.

---

### 4.1 Public-Facing Screens

#### `/` — Home / Search

- **Purpose:** Primary entry point for all users.
- **Content:**
  - App name and tagline.
  - Single search input (Unicode keyboard; detects language by script automatically).
  - Recent searches (stored locally).
  - Link to A–Z Browse.

---

#### `/search?q=[query]` — Search Results

- **Purpose:** Display results for a search query.
- **Content:**
  - Query echoed back with result count.
  - Results grouped by direction:
    - **English → Assamese** matches (English term + its Assamese equivalents).
    - **Assamese → English** matches (Assamese term + its English equivalents).
  - Each result is a tappable card linking to the term detail page.
  - "No results" state with a suggestion to browse A–Z.

---

#### `/term/en/[slug]` — English Term Detail

- **Purpose:** Show a single English term and all its Assamese equivalents.
- **Content:**
  - English term (large, prominent).
  - List of all mapped Assamese equivalents, each tappable (links to `/term/as/[slug]`).
  - "Suggest a correction" link (Phase 3).

---

#### `/term/as/[slug]` — Assamese Term Detail

- **Purpose:** Show a single Assamese term and all its English equivalents.
- **Content:**
  - Assamese term (large, prominent, correct Unicode rendering).
  - List of all mapped English equivalents, each tappable (links to `/term/en/[slug]`).
  - "Suggest a correction" link (Phase 3).

---

#### `/browse` — Browse Index

- **Purpose:** Entry point for A–Z browsing.
- **Content:**
  - Two tabs: **English** | **Assamese**.
  - English tab: A–Z letter grid (A, B, C … Z).
  - Assamese tab: Assamese alphabet index (ক, খ, গ …).

---

#### `/browse/en/[letter]` — Browse English by Letter

- **Purpose:** List all English terms starting with a given letter.
- **Content:**
  - Letter heading.
  - Alphabetically sorted list of English terms; each links to `/term/en/[slug]`.
  - Pagination or infinite scroll for large lists.

---

#### `/browse/as/[letter]` — Browse Assamese by Letter

- **Purpose:** List all Assamese terms starting with a given Assamese letter.
- **Content:**
  - Letter heading (Assamese script).
  - Sorted list of Assamese terms; each links to `/term/as/[slug]`.

---

### 4.2 Auth Screens

#### `/login` — Admin Login

- **Purpose:** Authenticate admin users.
- **Content:**
  - Email and password fields.
  - Submit button.
  - Error messages for invalid credentials.
  - Redirects to `/admin` on success; JWT stored in secure storage.

---

### 4.3 Admin Screens (require auth)

#### `/admin` — Admin Dashboard

- **Purpose:** Overview and navigation hub for admins.
- **Content:**
  - Stats: total English terms, total Assamese terms, total mappings.
  - Quick links to: Add Mapping, Manage English Terms, Manage Assamese Terms.
  - Recent activity log (last 10 additions/edits).

---

#### `/admin/mappings` — Manage Mappings

- **Purpose:** View, add, and delete term mappings.
- **Content:**
  - Searchable, paginated table of all mappings (English term ↔ Assamese term).
  - **Add Mapping** button → inline form or modal:
    - Select or create an English term.
    - Select or create one or more Assamese equivalents.
  - Delete mapping button per row (with confirmation).

---

#### `/admin/terms/en` — Manage English Terms

- **Purpose:** View and edit English terms.
- **Content:**
  - Paginated table: term, slug, mapping count, created date.
  - Edit term (inline or modal).
  - Delete term (only if no mappings exist, or with cascade warning).

---

#### `/admin/terms/as` — Manage Assamese Terms

- **Purpose:** View and edit Assamese terms.
- **Content:**
  - Same layout as English terms page.
  - Correct Unicode rendering for all Assamese text.

---

## 5. API Endpoints

> **Base URL (placeholder):** `https://api.termmapper.example.com/v1`
> All responses are `application/json`.
> Admin endpoints require `Authorization: Bearer <jwt>` header.

---

### 5.1 Search

#### `GET /search`

Search terms in both languages simultaneously.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (English or Assamese Unicode) |
| `lang` | `en` \| `as` \| `both` | No | Filter by direction. Default: `both` |
| `mode` | `exact` \| `fuzzy` \| `both` | No | Match mode. Default: `both` |
| `limit` | integer | No | Max results per direction. Default: `10`, max: `50` |

**Response `200 OK`:**
```json
{
  "query": "dilemma",
  "english_matches": [
    {
      "id": "e001",
      "term": "dilemma",
      "slug": "dilemma",
      "assamese_equivalents": [
        { "id": "a001", "term": "উভয় সংকট", "slug": "ubhay-sankat" },
        { "id": "a002", "term": "দোমোজা",    "slug": "domoja"       }
      ]
    }
  ],
  "assamese_matches": []
}
```

---

### 5.2 Term Lookup

#### `GET /terms/en/:slug`

Get a single English term with all its Assamese equivalents.

**Response `200 OK`:**
```json
{
  "id": "e001",
  "term": "dilemma",
  "slug": "dilemma",
  "assamese_equivalents": [
    { "id": "a001", "term": "উভয় সংকট", "slug": "ubhay-sankat" },
    { "id": "a002", "term": "দোমোজা",    "slug": "domoja"       }
  ],
  "created_at": "2026-03-04T00:00:00Z",
  "updated_at": "2026-03-04T00:00:00Z"
}
```

**Response `404 Not Found`:**
```json
{ "error": "Term not found" }
```

---

#### `GET /terms/as/:slug`

Get a single Assamese term with all its English equivalents.

**Response `200 OK`:**
```json
{
  "id": "a002",
  "term": "দোমোজা",
  "slug": "domoja",
  "english_equivalents": [
    { "id": "e001", "term": "dilemma", "slug": "dilemma" }
  ],
  "created_at": "2026-03-04T00:00:00Z",
  "updated_at": "2026-03-04T00:00:00Z"
}
```

---

### 5.3 Browse (A–Z)

#### `GET /browse/en`

List all English terms starting with a given letter.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `letter` | string (a–z) | Yes | First letter filter |
| `page` | integer | No | Page number. Default: `1` |
| `limit` | integer | No | Items per page. Default: `50`, max: `100` |

**Response `200 OK`:**
```json
{
  "letter": "d",
  "page": 1,
  "total": 4,
  "results": [
    { "id": "e001", "term": "dilemma", "slug": "dilemma" },
    { "id": "e002", "term": "doubt",   "slug": "doubt"   }
  ]
}
```

---

#### `GET /browse/as`

List all Assamese terms starting with a given Assamese letter (Unicode character).

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `letter` | string (Assamese Unicode char) | Yes | First letter filter (e.g., `ক`) |
| `page` | integer | No | Page number. Default: `1` |
| `limit` | integer | No | Items per page. Default: `50`, max: `100` |

**Response `200 OK`:**
```json
{
  "letter": "দ",
  "page": 1,
  "total": 2,
  "results": [
    { "id": "a002", "term": "দোমোজা", "slug": "domoja" }
  ]
}
```

---

### 5.4 Auth

#### `POST /auth/login`

Authenticate an admin user and receive a JWT.

**Request Body:**
```json
{
  "email": "admin@termmapper.example.com",
  "password": "••••••••"
}
```

**Response `200 OK`:**
```json
{
  "token": "<jwt>",
  "expires_in": 86400
}
```

**Response `401 Unauthorized`:**
```json
{ "error": "Invalid email or password" }
```

---

#### `POST /auth/logout`

Invalidate the current admin session (client-side token removal; server-side blocklist in Phase 2).

**Response `204 No Content`**

---

### 5.5 Admin — Term Management

> All endpoints below require `Authorization: Bearer <jwt>`.

---

#### `GET /admin/terms/en`

Paginated list of all English terms.

**Query Parameters:** `page`, `limit`, `q` (optional search filter)

**Response `200 OK`:**
```json
{
  "page": 1,
  "total": 120,
  "results": [
    {
      "id": "e001",
      "term": "dilemma",
      "slug": "dilemma",
      "mapping_count": 2,
      "created_at": "2026-03-04T00:00:00Z"
    }
  ]
}
```

---

#### `POST /admin/terms/en`

Create a new English term.

**Request Body:**
```json
{ "term": "ambiguity" }
```

**Response `201 Created`:**
```json
{
  "id": "e003",
  "term": "ambiguity",
  "slug": "ambiguity",
  "created_at": "2026-03-04T00:00:00Z"
}
```

**Response `409 Conflict`:**
```json
{ "error": "Term already exists" }
```

---

#### `PUT /admin/terms/en/:id`

Update an existing English term.

**Request Body:**
```json
{ "term": "ambiguity" }
```

**Response `200 OK`:** Updated term object.

---

#### `DELETE /admin/terms/en/:id`

Delete an English term. Fails if active mappings exist (or cascades with `?force=true`).

**Response `204 No Content`**

**Response `409 Conflict`:**
```json
{ "error": "Term has active mappings. Use ?force=true to delete with cascade." }
```

---

#### `GET /admin/terms/as`
#### `POST /admin/terms/as`
#### `PUT /admin/terms/as/:id`
#### `DELETE /admin/terms/as/:id`

Mirror of the English term endpoints above, operating on `assamese_terms`.

---

### 5.6 Admin — Mapping Management

#### `GET /admin/mappings`

Paginated list of all mappings.

**Query Parameters:** `page`, `limit`, `q` (filter by English or Assamese term)

**Response `200 OK`:**
```json
{
  "page": 1,
  "total": 200,
  "results": [
    {
      "id": "m001",
      "english": { "id": "e001", "term": "dilemma",  "slug": "dilemma"  },
      "assamese": { "id": "a001", "term": "উভয় সংকট", "slug": "ubhay-sankat" }
    }
  ]
}
```

---

#### `POST /admin/mappings`

Create a new mapping between an existing English term and an existing Assamese term.

**Request Body:**
```json
{
  "english_term_id": "e001",
  "assamese_term_id": "a003"
}
```

**Response `201 Created`:** New mapping object.

**Response `409 Conflict`:**
```json
{ "error": "Mapping already exists" }
```

---

#### `DELETE /admin/mappings/:id`

Delete a single mapping.

**Response `204 No Content`**

---

### 5.7 Admin — Stats

#### `GET /admin/stats`

**Response `200 OK`:**
```json
{
  "total_english_terms": 120,
  "total_assamese_terms": 115,
  "total_mappings": 200,
  "last_updated": "2026-03-04T12:00:00Z"
}
```

---

## 6. Infrastructure & Deployment

### 6.1 Architecture Diagram

```
                        ┌─────────────────────────────────┐
                        │     Users (Web & Mobile)        │
                        └────────────┬────────────────────┘
                                     │ HTTPS
                        ┌────────────▼────────────────────┐
                        │         CloudFront (CDN)        │
                        └────┬────────────────────┬───────┘
                             │                    │
               ┌─────────────▼──────┐   ┌─────────▼─────────────┐
               │  S3 (Static Web)   │   │  App Runner (API)     │
               │  React Native Web  │   │  Node.js + Fastify    │
               └────────────────────┘   └─────────┬─────────────┘
                                                   │
                                      ┌────────────▼─────────────┐
                                      │  Phase 1: S3 (JSON file)            │
                                      │  Phase 2: RDS PostgreSQL (optional) │
                                      └──────────────────────────┘
```

### 6.2 Monorepo Structure

```
term-mapper/
├── apps/
│   ├── api/               # Fastify backend (Node.js + TypeScript)
│   └── mobile/            # Expo React Native (web + iOS + Android)
├── packages/
│   └── shared-types/      # Shared TypeScript types & Zod schemas
├── data/
│   └── terms.json         # Phase 1 data file
├── infra/                 # AWS CDK or Terraform definitions
├── docker-compose.yml     # Local development
├── .github/workflows/     # CI/CD
├── DESIGN.md
└── pnpm-workspace.yaml
```

---

## 7. Phased Roadmap

### Phase 1 — MVP (File-based)
- [ ] JSON data file (`data/terms.json`) with seed data
- [ ] Backend API reading from JSON (search, browse, term detail)
- [ ] Admin auth (JWT login/logout)
- [ ] Admin CRUD endpoints (modifying the JSON file)
- [ ] Public-facing frontend (search, browse, term detail pages)
- [ ] Admin panel (behind login)
- [ ] Deploy: App Runner (API) + S3/CloudFront (web)

### Phase 2 — Database (Optional)

> ⚠️ **Optional.** Only warranted if the JSON file exceeds ~50,000 mappings or if search performance degrades noticeably.

- [ ] Migrate `terms.json` → PostgreSQL RDS (IDs preserved)
- [ ] Enable `pg_trgm` extension for fuzzy search
- [ ] Drizzle ORM schema & migrations
- [ ] Switch API data layer from JSON file to Drizzle queries
- [ ] Add RDS to infrastructure

### Phase 3 — Growth (Future)
- [ ] Public suggestion form ("suggest a missing term")
- [ ] Usage analytics (CloudWatch or PostHog)
- [ ] Export API / public read-only API key access
- [ ] Mobile app store releases (iOS App Store, Google Play)

---

*Document maintained in: `DESIGN.md`*
*Next step: complete the Phase 1 build and deployment. Phase 2 is optional and should only be pursued if a concrete performance or scale need arises.*
