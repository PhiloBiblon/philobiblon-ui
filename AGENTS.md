# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

### Frontend (Nuxt 3 / Vue 3 / Vuetify 4)

```bash
cd frontend
yarn install
yarn dev        # Dev server (sets API_BASE_URL to the staging backend)
yarn build      # Production build
yarn preview    # Preview production build locally
yarn lint       # ESLint
```

The dev script hardcodes `API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-local/` as the backend.
Yarn 4 (Berry) is required — enable it with `corepack enable`.

### Backend (Spring Boot / Java 21)

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

- **Frontend** (`frontend/`) — Nuxt 3 SPA (SSR disabled), Vue 3 + Vuetify 4 + Pinia. Talks to Wikibase API directly for reads, and to the backend for writes (proxied through OAuth) and cached SPARQL queries.
- **Backend** (`backend/`) — Spring Boot 4 middleware. Handles OAuth 1.0a with Wikibase, proxies edit requests, and caches SPARQL queries with Caffeine LoadingCache (24h refresh, 36h expiry).

### Two-level SPARQL caching

- **Frontend** (`stores/queryCache.js`): Pinia in-memory cache, 2-min TTL, 100 entries max, keyed by query hash.
- **Backend** (`SparqlServiceImpl`): Caffeine LoadingCache, 24h refresh, 36h expiry, no max-size limit. Inspect via `GET /api/sparql/cacheinfo`.

`wikibase-edit` on the frontend is configured to point to the **backend** (`apiBaseUrl`), not Wikibase directly — this ensures all writes go through the OAuth proxy.

### UI configuration via wiki pages

The frontend reads special Wikibase wiki pages to drive UI behaviour. All three are parsed in `frontend/service/wikibase.service.js` and fetched via `getWikibasePage(pageName)`.

- **`Ui_SortedProperties`** — display order of claims per table type, on existing items. Consumed via `getClaimsOrder(table)`.
- **`Ui_SortedProperties_NewItem`** — which claims/qualifiers get pre-filled by default when creating a new item of a given table, in what order, and their validation/behaviour rules (see modifiers below). `getNewItemConfig(table)` fetches and parses the page once and returns both the ordering and the rules; `getClaimsOrderForNewItem(table)` (ordering only, delegates to `getClaimsOrder(table, pageName)` with the page name overridden — used by `Base.vue` for existing items) and `getNewItemFieldRules(table)` (rules only) are thin views over it for callers that only need one half. `frontend/components/item/Create.vue` calls `getNewItemConfig` directly to avoid parsing the page twice on the same page load. The page name itself is configurable per environment via the `WIKIBASE_NEW_ITEM_PAGE` build arg (defaults to `Ui_SortedProperties_NewItem`, see below and `nuxt.config.ts`).
- **`Ui_ControlledVocabulary`** — autocomplete queries and default values per field, per table and per bibliography (BETA/BITECA/BITAGAP). Consumed via `getControlledVocabularyConfig(table, bibliography)`.

Both `Ui_SortedProperties` and `Ui_SortedProperties_NewItem` share the same wikitext format, parsed by `parseSortedPropertiesConfig`: one `====<table>====` section per item table, with `* Pxxx` lines listing properties in order and `:: qualifier Pxxx` sub-lines listing that property's qualifier order. In `Ui_SortedProperties_NewItem` these lines also accept trailing space-separated modifiers, and validation-only "at least one of" groups are declared with a dedicated `::` line:

- `* Pxxx required` — the claim must have a value before the item can be created.
- `* Pxxx not-removable` — the user can't remove the claim from the create form.
- `* Pxxx hidden` — the claim isn't shown on the create form (e.g. a claim that only carries a forced default).
- `:: qualifier Pxxx hidden` — same as above, for a qualifier.
- `:: required-group:<name> Pxxx,Pyyy,Pzzz` — at least one of the listed properties must have a value; independent of whether those properties are also `* Pxxx` lines (group members don't need to be pre-filled claims).

`Ui_ControlledVocabulary` uses a different, table-based wikitext format (`==== <table> (...) ====` sections with `| property || bibliographies || default_value || query` rows), parsed by `parseControlledVocabularySections`. The `property` column also accepts a composite id `Pxxx.Pyyy`, meaning "the default value of qualifier Pyyy on claim Pxxx" (the `query` column is ignored for these rows).

**Implication for new-item defaults:** when a new claim/qualifier needs to be forced onto item creation, made required, or given a default value for a specific table, the correct place to express that is `Ui_SortedProperties_NewItem` (presence, order, required/removable/hidden flags, groups) and `Ui_ControlledVocabulary` (default values) — not a hardcoded `if (props.table === 'x') { ... }` branch in `frontend/components/item/Create.vue`. Hardcoding per-table property IDs in `getDefaultClaims`/`getCreateDisabledReason` bypasses the wiki-driven config, is easy to get wrong during merges (see the P799/P106 gating regression across PRs #475/#476/#478, where per-table `if` guards were dropped during a merge and silently became unconditional for every table), and requires a code deploy instead of a wiki edit for what should be config-only changes. Both `getNewItemFieldRules` and `getClaimsOrder` fail soft (return an empty ruleset / log an error) when a table isn't configured yet, so a page missing the new modifiers doesn't break item creation — it just stops enforcing/pre-filling whatever isn't declared, which is why wiki edits for these pages should land together with any code change that depends on them.

### Item types

The app handles 8 PhiloBiblon record types, each with a dedicated search page (`pages/search/<type>/query.vue`) and item-view page (`pages/item/[id].vue`): `bibid`, `bioid`, `geoid`, `insid`, `libid`, `manid`, `subid`, `texid`. Item creation uses `pages/item/[table]/create.vue`.

### Frontend service injection

Services are injected as Nuxt plugins and accessed in `<script setup>` via `useNuxtApp()`:
`const { $wikibase, $notification, $sanitize } = useNuxtApp()`. Never call `fetch` directly in components; use the services.

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

The frontend version (`runtimeConfig.public.version` in `nuxt.config.ts`) is automatically updated at build time: staging gets `{version}-{sha}`, production gets the tag version without the `v` prefix.

## i18n

Translations live in `frontend/lang/` (`en`, `ca`, `es`, `gl`, `pt`). The active locale is stored in a cookie (`language`) and all routes are prefixed with the locale code (e.g. `/ca/search/manid/query`). All user-facing strings must be added to all five locale files. Use `const { t } = useI18n()` in `<script setup>` components.

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on `PhiloBiblon/philobiblon-ui`, via the `gh` CLI. External PRs are not pulled into the triage queue. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default canonical label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.