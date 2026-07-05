package io.github.philobiblon.backend.representation;

import java.time.Instant;
import java.util.List;

/** State of the DB-backed SPARQL result cache, per stored query. Replaces the old Caffeine cacheinfo. */
public class CacheStatusResponse {

    public long totalQueries;
    public long totalRows;
    public long loadingCount;
    public long failedCount;
    public List<QueryStatus> queries;

    public static class QueryStatus {
        public String queryHash;
        public String hint;
        public String snippet;
        public String searchVars;
        public long generation;
        public long rowCount;
        public Instant createdAt;
        public Instant lastRefreshed;
        public Instant lastAccessed;
        public String lastError;
        public boolean loading;
        public long usageSinceRefresh;
        public long usageTotal;
    }
}
