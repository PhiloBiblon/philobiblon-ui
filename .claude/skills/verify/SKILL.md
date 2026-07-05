---
name: verify
description: How to launch and drive this project's backend (and frontend) locally to verify changes end-to-end against the real staging Wikibase/SPARQL endpoints.
---

# Verifying philobiblon-ui changes locally

## Backend (Spring Boot, port of your choice)

Real endpoint values can be fetched from the staging backend:

```bash
curl -s https://philobiblon.cog.berkeley.edu/ui-local/api/config
# → wikibaseBaseUrl/apiUrl, sparqlBaseUrl, sparqlEndpoint, sparqlQueryPrefix
```

Launch (OAuth vars can be dummies unless you verify edit flows):

```bash
cd backend
ALLOWED_ORIGINS='*' \
OAUTH_CONSUMER_KEY=dummy OAUTH_CONSUMER_SECRET=dummy OAUTH_CALLBACK_URL=http://localhost/cb \
WIKIBASE_BASE_URL=https://database.factgrid.de WIKIBASE_API_URL=https://database.factgrid.de/w/api.php \
WIKIBASE_INDEX_URL=https://database.factgrid.de/w/index.php WIKIBASE_NICE_URL_BASE=https://database.factgrid.de/wiki/ \
SPARQL_BASE_URL=https://database.factgrid.de/query \
SPARQL_ENDPOINT=https://database.factgrid.de/sparql/bigdata/namespace/wdq/sparql \
SPARQL_QUERY_PREFIX='' \
SEARCH_DB_PATH=/tmp/<scratch>/searchcache \
./mvnw -q spring-boot:run -Dspring-boot.run.arguments="--search.index.languages= --server.port=8087"
```

Gotchas:
- `--search.index.languages=` (empty) disables the QuickSearch startup load — otherwise boot fires 5 heavy SPARQL loads (one per language) against the real endpoint.
- Startup takes ~20–40 s; poll `GET /api/search/cache/status` until 200.
- `SEARCH_DB_PATH` is the H2 file — point it at scratch space to start cold, reuse it to test persistence across restarts.

## Driving the search endpoints

`POST /api/search` expects form-urlencoded `q` (typed text) + `sparqlQuery` (full query with PREFIXes, built client-side). Grab a real autocomplete template from `frontend/pages/search/<table>/query.vue` (field `autocomplete.query`), fill `{{database}}`→`(.*)`, `{{table}}`→table id, `{{bitagapGroupFilter}}`→'' and the lang filters per `frontend/service/query.service.js` (`generateSearchLangFilters`, `generateDescLangFilters`), prepend the prefixes from `/api/config`, then:

```bash
curl -s -X POST http://localhost:8087/api/search \
  --data-urlencode "q=barcelona" --data-urlencode "sparqlQuery@query.rq" \
  -H 'Content-Type: application/x-www-form-urlencoded'
```

The geoid `simple_search` template is a good small-ish probe (~22k rows).

## Frontend

`cd frontend && yarn dev` (needs `corepack enable`; hardcodes the staging backend as API). Search pages live at `/<locale>/search/<table>/query`.

Gotchas when pointing dev at a local backend (`API_BASE_URL=http://localhost:8087 npx nuxt dev`):
- No trailing slash on `API_BASE_URL`: `AutocompleteField` concatenates `apiBaseUrl + '/api/search'`; nginx normalizes the `//` in staging/prod but a local Tomcat 404s it.
- `SPARQL_QUERY_PREFIX` set at dev-server launch does NOT reach the client runtime config (dev-server quirk; the served `__NUXT__.config` has it but the SPA client config ends up empty — real Docker builds are fine). Workaround for browser testing: patch it in the console:
  `const q = useNuxtApp().$wikibase.$query; q.$config = { ...q.$config, sparqlQueryPrefix: 'PREFIX ...' }`
- The Playwright/browser may serve stale Vite chunks across dev-server restarts; if runtime config looks wrong, clear `frontend/node_modules/.vite` + `frontend/.nuxt/dev` and use a fresh origin (127.0.0.1 vs localhost).
