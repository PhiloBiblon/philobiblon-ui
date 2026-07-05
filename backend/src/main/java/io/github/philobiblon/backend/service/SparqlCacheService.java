package io.github.philobiblon.backend.service;

import io.github.philobiblon.backend.representation.CacheStatusResponse;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.SearchResponse;

import java.util.List;

/**
 * DB-backed SPARQL result cache: every query sent to /api/search is registered, its results
 * materialized as searchable rows (see CachedQuery/CachedQueryRow), refreshed nightly and
 * evicted when unused. Searches are served with SQL LIKE candidates re-ranked in Java.
 */
public interface SparqlCacheService {

    /** Async contract: never blocks on the SPARQL endpoint; a cold query returns indexLoading=true. */
    SearchResponse search(String sparqlQuery, String q, String searchVars, String hint, Integer limit);

    /** Transitional sync contract (legacy /api/search shape): blocks on a cold query until loaded or timed out. */
    List<Option> searchLegacy(String sparqlQuery, String q);

    /** Re-executes every registered query (nightly cron) after evicting unused ones. */
    void refreshAll();

    CacheStatusResponse status();
}
