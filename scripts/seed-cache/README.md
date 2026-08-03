# seed-cache

Seeds the backend's DB-backed SPARQL cache (`POST /api/search`) so users never hit a
cold query. The generator imports the **real frontend code** (`frontend/service/query.templates.js`
and `frontend/service/search-forms/*.js`), guaranteeing the generated queries are
byte-identical to the ones the app sends — the cache is keyed by the exact query text.

## Requirements

- Node ≥ 18 (the repo's frontend toolchain already requires it)
- `jq` and `curl` for the executor

## Usage

```bash
cd scripts/seed-cache

# 1. Generate the query list (fetches the SPARQL prefix from the target backend's /api/config)
API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-local node generate-queries.mjs --out queries.json

# 2. Fire them at the backend and wait until every index is materialized
API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-local ./seed.sh queries.json

# 3. Watch progress
curl -s $API_BASE_URL/api/search/cache/status | jq '{totalQueries, totalRows, loadingCount, failedCount}'
```

## Default scope (deliberately conservative)

By default the generator emits the global-search query plus every autocomplete field
per table — one entry per field, full stop. Query texts carry no dimension: each one
fetches all five UI languages, all three bibliographies and the BITAGAP subgroup
membership at once; the backend stores per-language columns plus per-row memberships,
and the `lang`/`group`/`bitagapGroup` request params pick what is matched. Nothing
else needs seeding — the single entry serves every locale, database and subgroup
selection.

## Options

| Flag | Meaning | Default |
|---|---|---|
| `--tables bioid,geoid` | item tables | all 8 |
| `--only-global` / `--no-global` | only/skip the global-search queries | include |
| `--out queries.json` | write to file instead of stdout | stdout |

Env: `SPARQL_QUERY_PREFIX` overrides the prefix fetched from `/api/config`;
`POLL_SECONDS` (30) and `MAX_WAIT` (3600) tune the executor's polling.

## When to run

- **Initial seed** after deploying the DB-backed cache, per environment.
- **After adding/changing filters** in the frontend (a changed template is a new
  cache key; the old entry ages out via eviction).
- Not needed periodically: the backend's nightly cron (`search.index.refreshCron`)
  re-executes every registered query by itself.
