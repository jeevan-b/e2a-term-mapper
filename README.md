# e2a-term-mapper

> Bilingual term-mapping app between English and Assamese.

## What it is

Term Mapper maps equivalent terms across English and Assamese. It is **not a dictionary** — it surfaces direct term equivalences. The relationship is many-to-many: one English term can have multiple Assamese equivalents and vice versa.

## Monorepo structure

```
term-mapper/
├── apps/
│   ├── api/               # Fastify backend (Node.js 22 + TypeScript)
│   └── mobile/            # Expo React Native (web + iOS + Android)
├── packages/
│   └── shared-types/      # Shared TypeScript types and Zod schemas
├── data/
│   └── terms.json         # Phase 1 data file
├── infra/                 # AWS infrastructure definitions
├── docker-compose.yml
├── DESIGN.md
└── pnpm-workspace.yaml
```

## Prerequisites

- [Node.js 22 LTS](https://nodejs.org/) (see `.nvmrc`)
- [pnpm](https://pnpm.io/) v9+
- [Docker](https://www.docker.com/) (for local development)

## Getting started

```bash
# Install all dependencies across the monorepo
pnpm install

# Start the API in development mode
pnpm --filter @term-mapper/api dev

# Start the mobile/web app in development mode
pnpm --filter @term-mapper/mobile start
```

## Local development with Docker

```bash
docker compose up
```

This starts the API service. The API is available at `http://localhost:3000`.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 22, Fastify, TypeScript, Zod |
| Frontend | React Native, Expo SDK 52, NativeWind v4, Expo Router |
| Data fetching | TanStack Query v5, ky |
| Phase 1 data | JSON file on AWS S3 |
| Phase 2 data | PostgreSQL 16 on AWS RDS (Drizzle ORM) |
| Hosting | AWS App Runner (API) + S3/CloudFront (web) |

## Design document

See [`DESIGN.md`](./DESIGN.md) for full architecture, data model, API reference, and phased roadmap.

## Task list

See [`TASKS.md`](./TASKS.md) for the prioritised implementation checklist.
