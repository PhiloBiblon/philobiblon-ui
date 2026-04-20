# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

### Frontend (Nuxt 2 / Vue 2)

```bash
cd frontend
yarn install
yarn dev        # Dev server (sets API_BASE_URL to the staging backend)
yarn build      # Production build
yarn lint       # ESLint
```

The dev script hardcodes `API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-dev/` as the backend.

### Backend (Spring Boot / Java 17)

```bash
cd backend
./mvnw spring-boot:run   # Run locally (requires env vars)
./mvnw test              # Run tests
./mvnw package           # Build JAR
```

### Full stack (Docker)

```bash
cp .env.template .env    # Configure env vars
docker compose up --build -d
docker compose stop
docker compose down -v   # Remove everything including volumes
```

## Architecture

Two modules behind an nginx reverse proxy:

- **Frontend** (`frontend/`) — Nuxt 2 SPA (SSR disabled). Talks to Wikibase API directly for reads, and to the backend for writes (proxied through OAuth) and cached SPARQL queries.
- **Backend** (`backend/`) — Spring Boot 3 middleware. Handles OAuth 1.0a with Wikibase, proxies edit requests, and caches SPARQL queries with Caffeine LoadingCache (24h refresh, 36h expiry).

### Two-level SPARQL caching

- **Frontend** (`store/queryCache.js`): Vuex in-memory cache, 2-min TTL, 100 entries max, keyed by query hash.
- **Backend** (`SparqlServiceImpl`): Caffeine LoadingCache, 24h refresh, 36h expiry, no max-size limit. Inspect via `GET /api/sparql/cacheinfo`.

`wikibase-edit` on the frontend is configured to point to the **backend** (`apiBaseUrl`), not Wikibase directly — this ensures all writes go through the OAuth proxy.

### UI configuration via wiki pages

The frontend reads special Wikibase wiki pages to drive UI behaviour:
- `Ui_SortedProperties` — display order of claims per table type
- `Ui_SortedProperties_NewItem` — claim order for new items
- `Ui_ControlledVocabulary` — autocomplete queries and default values per field

### Item types

The app handles 8 PhiloBiblon record types, each with a dedicated search page (`pages/search/<type>/`) and item-view page (`pages/item/<type>/`): `bibid`, `bioid`, `geoid`, `insid`, `libid`, `manid`, `subid`, `texid`.

### Frontend service injection

Services are injected as Nuxt plugins and available as `this.$wikibase`, `this.$query`, `this.$oauth`, `this.$notification` in all components and pages. Never call Axios directly; use the services.

### Backend design

Controllers and services are defined as Java interfaces with implementations in `impl/` subpackages. OAuth tokens are stored in `TimedMap` (request tokens: 5-min TTL; access tokens: 60-min TTL with auto-refresh on access). Backend config is exposed to the frontend via `GET /api/config`.

## Key environment variables

| Variable | Used by |
|---|---|
| `API_BASE_URL` | Frontend build arg — backend base URL, baked into the SPA at build time |
| `BASE_URL` | Frontend build arg — router base path (e.g. `/ui-fg/`), baked into the SPA at build time |
| `WIKIBASE_BASE_URL`, `WIKIBASE_API_URL` | Both |
| `SPARQL_ENDPOINT`, `SPARQL_QUERY_PREFIX` | Both |
| `OAUTH_CONSUMER_KEY`, `OAUTH_CONSUMER_SECRET`, `OAUTH_CALLBACK_URL` | Backend |
| `ALLOWED_ORIGINS` | Backend CORS |

`API_BASE_URL` and `BASE_URL` are Docker build arguments (`ARG`), not runtime environment variables. Setting them on a running container has no effect — they must be passed at image build time.

## CI/CD

Two GitHub Actions workflows in `.github/workflows/`:

- **`staging.yml`** — triggers on push to `master` or manually (`workflow_dispatch`). Builds both images, pushes to GHCR with tags `main-{sha}` and `main-latest`, deploys via SSH to the staging server (`docker-compose.ui-dev.yml`), cleans up old GHCR versions (keeps 5, never deletes `v*` tags).
- **`production.yml`** — triggers on `v*` tag push or manually. Builds both images, pushes with tags `v1.2.3` and `latest`, deploys via SSH to the production server (`docker-compose.ui-fact.yml`).

GHCR image names:
```
ghcr.io/philobiblon/philobiblon-ui-backend
ghcr.io/philobiblon/philobiblon-ui-frontend
```

GitHub Environments (`staging` / `production`) hold the secrets and variables — see `docs/cicd.md` for the full list.

The frontend version (`publicRuntimeConfig.version` in `nuxt.config.js`) is automatically updated at build time: staging gets `{version}-{sha}`, production gets the tag version without the `v` prefix.

## i18n

Translations live in `frontend/lang/` (`en`, `ca`, `es`, `gl`, `pt`). The active locale is stored in a cookie (`language`). All user-facing strings must be added to all five locale files.