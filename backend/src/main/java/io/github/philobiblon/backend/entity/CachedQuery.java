package io.github.philobiblon.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Registry of every SPARQL query whose results are materialized in {@link CachedQueryRow}.
 * Stores the full query text so the nightly refresh can re-execute it without any client involved.
 */
@Entity
@Table(name = "cached_query")
public class CachedQuery {

    /** SHA-256 hex of searchVars + "\n" + sparqlText. */
    @Id
    @Column(name = "query_hash", length = 64)
    private String queryHash;

    /** Exact query text as received; re-executed verbatim by the refresh cron. */
    @Lob
    @Column(name = "sparql_text")
    private String sparqlText;

    /**
     * Comma-separated result-var names whose values compose each row's searchText.
     * Order is significant (it defines composition order); part of the hash input.
     */
    @Column(name = "search_vars", length = 255)
    private String searchVars;

    /** 0 = never successfully loaded (index still loading). Otherwise epoch millis of the last successful load. */
    private long generation;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_refreshed_at")
    private Instant lastRefreshedAt;

    /** Eviction input; write-throttled to at most one update per hour. */
    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt;

    /** Truncated message of the last failed load, cleared on success. */
    @Column(name = "last_error", length = 2000)
    private String lastError;

    /** Optional free-text sent by clients (e.g. "bioid.author") purely for operability. */
    @Column(name = "label_hint", length = 255)
    private String labelHint;

    /** Requests served since the last successful load; reset to 0 by loadQuery(). Drives the nightly refresh decision. */
    @Column(name = "usage_since_refresh")
    private long usageSinceRefresh;

    /** Requests served over the query's whole lifetime; never reset. Observability only. */
    @Column(name = "usage_total")
    private long usageTotal;

    public CachedQuery() {
    }

    public CachedQuery(String queryHash, String sparqlText, String searchVars, String labelHint, Instant createdAt) {
        this.queryHash = queryHash;
        this.sparqlText = sparqlText;
        this.searchVars = searchVars;
        this.labelHint = labelHint;
        this.createdAt = createdAt;
        this.lastAccessedAt = createdAt;
        this.generation = 0L;
    }

    public String getQueryHash() {
        return queryHash;
    }

    public String getSparqlText() {
        return sparqlText;
    }

    public String getSearchVars() {
        return searchVars;
    }

    public long getGeneration() {
        return generation;
    }

    public void setGeneration(long generation) {
        this.generation = generation;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastRefreshedAt() {
        return lastRefreshedAt;
    }

    public void setLastRefreshedAt(Instant lastRefreshedAt) {
        this.lastRefreshedAt = lastRefreshedAt;
    }

    public Instant getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(Instant lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public String getLabelHint() {
        return labelHint;
    }

    public void setLabelHint(String labelHint) {
        this.labelHint = labelHint;
    }

    public long getUsageSinceRefresh() {
        return usageSinceRefresh;
    }

    public void setUsageSinceRefresh(long usageSinceRefresh) {
        this.usageSinceRefresh = usageSinceRefresh;
    }

    public long getUsageTotal() {
        return usageTotal;
    }

    public void setUsageTotal(long usageTotal) {
        this.usageTotal = usageTotal;
    }
}
