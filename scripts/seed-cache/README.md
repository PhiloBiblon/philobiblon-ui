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

By default the generator emits the 5 global-search queries plus every autocomplete
field for `group=ALL, bitagapGroup=ALL` per table × language — the combination every
user hits first. **Do not blanket-seed the full cartesian** (`--groups ALL,BETA,BITECA,BITAGAP
--bitagap-groups ALL,ORIG,CARTAS`) unless you accept millions of cached rows and a long
nightly refresh: big fields can return 10⁴–10⁵ rows per query. The long tail is
populated lazily by real usage and evicted after `search.cache.evictAfterDays` (30 days)
without accesses.

## Options

| Flag | Meaning | Default |
|---|---|---|
| `--langs ca,es` | languages | `ca,es,en,gl,pt` |
| `--tables bioid,geoid` | item tables | all 8 |
| `--groups ALL,BETA` | database filter values | `ALL` |
| `--bitagap-groups ALL,ORIG` | BITAGAP subgroup values | `ALL` |
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
