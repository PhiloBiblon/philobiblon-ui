# R5 — Remove the quick-search stack and the legacy /api/search contract

Prompt for a future Claude Code session (or a human) to execute the final phase of the
SPARQL cache unification. Phases R1–R4 were delivered in PR "Unify SPARQL caching"
(branch `feat/unified-sparql-cache-r1`); the plan lives in the PR description and
`docs/backend/caching.md` documents the final architecture.

## Preconditions — check before touching code

1. R1–R4 have been **deployed to production** (not just staging) for **at least 2–4 weeks**,
   so browser-cached SPAs that still call `GET /api/search/quick` or the param-less
   `POST /api/search` have cycled out.
2. Verify in the production/staging **nginx access logs** that `GET /api/search/quick`
   traffic has dropped to zero (or a negligible trickle of stale clients you accept breaking).
3. The cache has been **seeded** in each environment (`scripts/seed-cache/README.md`)
   and `GET /api/search/cache/status` shows the 5 `global.<lang>` queries materialized —
   otherwise removing quick breaks the global search bar for everyone.

## Prompt

> Executa la fase R5 de la unificació de la cache SPARQL (vegeu
> `docs/agents/r5-remove-quick-search.md` i `docs/backend/caching.md`):
>
> **Backend — eliminar l'stack quick:**
> - Mapping `GET /quick` de `SearchController` + mètode a `SearchControllerImpl`
> - `service/QuickSearchService.java` + `service/impl/QuickSearchServiceImpl.java`
> - `entity/SearchItem.java` + `repository/SearchItemRepository.java`
> - `resources/sparql/load-search-items.rq`
> - `representation/QuickResult.java` + `representation/QuickSearchResponse.java`
> - `QuickSearchServiceImplTest` (els tests de retry ja es van portar a
>   `SparqlCacheServiceImplTest` a R1)
> - Propietats `search.index.languages`, `search.index.candidateLimit`,
>   `search.index.resultLimit` si ja no tenen cap consumidor (les `search.index.retry.*`
>   i `search.index.refreshCron` **es queden**: les usa `SparqlCacheServiceImpl`)
>
> **Backend — eliminar el contracte legacy de /api/search:**
> - Mapping `params = "!v"` de `SearchController(+Impl)` — deixar el mapping v=2 com a
>   únic (decidir si es manté la discriminació `params = "v=2"` o s'accepta qualsevol crida)
> - `SparqlCacheService.searchLegacy()` + `awaitLoad()` + la propietat
>   `search.cache.syncTimeoutSeconds`
>
> **Neteja:**
> - `ddl-auto=update` no esborra taules: documentar (o executar via consola H2 en dev)
>   el `DROP TABLE SEARCH_ITEM` opcional — és inofensiu deixar-la
> - Actualitzar `docs/backend/caching.md` (treure les notes "transitional alias" i
>   "legacy contract" i la secció History si es vol), `AGENTS.md` si cal, i aquest fitxer
>   (esborrar-lo en acabar)
>
> **Verificació** (skill `verify` del projecte — `.claude/skills/verify/SKILL.md` té la
> recepta d'arrencada local i els seus gotchas):
> - `./mvnw test` verd
> - Backend local sobre una BD seedejada: `GET /api/search/quick` → 404,
>   `POST /api/search` sense `v` → 404/400, `POST /api/search` amb `v=2` serveix
>   resultats, `GET /api/search/cache/status` intacte
> - UI amb Playwright: cerca global i un autocomplete funcionen
> - Sigues escrupolós amb les instàncies zombis de backend (pgrep java) i el lock de l'H2

## Context tècnic que estalvia redescobrir

- El global search (`components/search/Simple.vue`) crida
  `$wikibase.cachedSearch(globalSearchQuery(locale), text, {searchVars: GLOBAL_SEARCH_VARS, ...})`
  — ja NO usa quick des de R3; el mapping quick del backend només serveix SPAs velles.
- `SearchServiceImpl` és una utilitat estàtica (`normalize`/`rank`) compartida per
  `SparqlCacheServiceImpl` i `QuickSearchServiceImpl`; en eliminar quick, l'únic
  consumidor que queda és la cache.
- Els tests del contracte dual viuen a `SearchControllerImplTest` — el test del shape
  legacy s'ha d'eliminar amb el contracte.
