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

    /**
     * Async contract: never blocks on the SPARQL endpoint; a cold query returns indexLoading=true.
     *
     * @param lang  UI language whose column lang-aware queries match and display (default en);
     *              ignored for legacy per-language queries
     * @param group database group (BETA/BITECA/BITAGAP) filtering db-aware queries' rows by
     *              membership; absent or ALL means no filter; ignored for legacy queries
     */
    SearchResponse search(String sparqlQuery, String q, String searchVars, String hint, Integer limit, String lang,
                          String group);

    /** Transitional sync contract (legacy /api/search shape): blocks on a cold query until loaded or timed out. */
    List<Option> searchLegacy(String sparqlQuery, String q);

    /** Re-executes every registered query (nightly cron) after evicting unused ones. */
    void refreshAll();

    CacheStatusResponse status();
}
