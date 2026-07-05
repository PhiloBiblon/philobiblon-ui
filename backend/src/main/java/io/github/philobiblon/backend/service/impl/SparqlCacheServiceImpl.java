package io.github.philobiblon.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.philobiblon.backend.entity.CachedQuery;
import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.helper.QueryHasher;
import io.github.philobiblon.backend.repository.CachedQueryRepository;
import io.github.philobiblon.backend.repository.CachedQueryRowRepository;
import io.github.philobiblon.backend.representation.CacheStatusResponse;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.representation.SearchResponse;
import io.github.philobiblon.backend.service.SparqlCacheService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryException;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.RDFNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.LongAdder;

@Service
public class SparqlCacheServiceImpl implements SparqlCacheService {

    private static final Logger logger = LoggerFactory.getLogger(SparqlCacheServiceImpl.class);

    private static final String LABEL_VAR = "label";
    private static final String DEFAULT_SEARCH_VARS = LABEL_VAR;
    private static final int LABEL_MAX_LENGTH = 1000;
    private static final int SEARCH_TEXT_MAX_LENGTH = 10000;
    private static final int MAX_SEARCH_WORDS = 5;
    private static final int LAST_ERROR_MAX_LENGTH = 2000;
    private static final long TOUCH_THROTTLE_MILLIS = TimeUnit.HOURS.toMillis(1);

    @Value("${sparql.endpoint}")
    private String sparqlEndpoint;
    @Value("${search.cache.candidateLimit:1000}")
    private int candidateLimit;
    @Value("${search.cache.maxResultLimit:300}")
    private int maxResultLimit;
    @Value("${search.cache.loadConcurrency:2}")
    private int loadConcurrency;
    @Value("${search.cache.syncTimeoutSeconds:60}")
    private long syncTimeoutSeconds;
    @Value("${search.cache.evictAfterDays:30}")
    private int evictAfterDays;
    @Value("${search.cache.refresh.requireUsage:true}")
    boolean requireUsageForRefresh;
    @Value("${search.cache.dbFilePath}")
    String dbFilePath;
    @Value("${search.index.retry.maxAttempts:3}")
    int retryMaxAttempts;
    @Value("${search.index.retry.initialBackoffMs:5000}")
    long retryInitialBackoffMs;
    @Value("${search.index.retry.backoffMultiplier:3}")
    double retryBackoffMultiplier;

    private final CachedQueryRepository queryRepository;
    private final CachedQueryRowRepository rowRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, Long> generationByHash = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<Boolean>> inFlight = new ConcurrentHashMap<>();
    private final Map<String, Long> lastTouchMillis = new ConcurrentHashMap<>();
    /** Usage increments not yet persisted (throttled with lastTouchMillis); flushed in full before the nightly refresh. */
    private final Map<String, LongAdder> pendingUsage = new ConcurrentHashMap<>();
    private final AtomicBoolean refreshing = new AtomicBoolean(false);
    private ExecutorService loadExecutor;
    private final HttpClient http1Client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public SparqlCacheServiceImpl(CachedQueryRepository queryRepository, CachedQueryRowRepository rowRepository) {
        this.queryRepository = queryRepository;
        this.rowRepository = rowRepository;
    }

    @PostConstruct
    void init() {
        loadExecutor = Executors.newFixedThreadPool(Math.max(1, loadConcurrency), runnable -> {
            Thread thread = new Thread(runnable, "sparql-cache-loader");
            thread.setDaemon(true);
            return thread;
        });
        for (CachedQuery cq : queryRepository.findAll()) {
            generationByHash.put(cq.getQueryHash(), cq.getGeneration());
        }
        logger.info("SPARQL cache initialized with {} registered queries", generationByHash.size());
    }

    @PreDestroy
    void shutdown() {
        if (loadExecutor != null) {
            loadExecutor.shutdownNow();
        }
    }

    /** Cleans up crash/eviction leftovers and resumes never-loaded queries, without blocking startup. */
    @EventListener(ApplicationReadyEvent.class)
    void loadOnStartup() {
        Thread thread = new Thread(() -> {
            int orphans = rowRepository.deleteOrphans();
            if (orphans > 0) {
                logger.info("SPARQL cache: removed {} orphan rows", orphans);
            }
            generationByHash.forEach((hash, generation) -> {
                if (generation == 0L) {
                    scheduleLoad(hash);
                }
            });
        }, "sparql-cache-startup");
        thread.setDaemon(true);
        thread.start();
    }

    @Override
    public SearchResponse search(String sparqlQuery, String q, String searchVars, String hint, Integer limit) {
        String vars = normalizeSearchVars(searchVars);
        String queryHash = QueryHasher.hash(vars, sparqlQuery);
        long generation = ensureRegistered(queryHash, sparqlQuery, vars, hint);
        if (generation == 0L) {
            scheduleLoad(queryHash);
            return new SearchResponse(true, List.of());
        }
        touch(queryHash);
        return new SearchResponse(false, searchRows(queryHash, generation, q, effectiveLimit(limit)));
    }

    @Override
    public List<Option> searchLegacy(String sparqlQuery, String q) {
        String queryHash = QueryHasher.hash(DEFAULT_SEARCH_VARS, sparqlQuery);
        long generation = ensureRegistered(queryHash, sparqlQuery, DEFAULT_SEARCH_VARS, null);
        if (generation == 0L) {
            generation = awaitLoad(queryHash);
        }
        touch(queryHash);
        return searchRows(queryHash, generation, q, maxResultLimit);
    }

    /** Blocks until the query is loaded (or the sync timeout expires); the load keeps running in background. */
    private long awaitLoad(String queryHash) {
        CompletableFuture<Boolean> future = scheduleLoad(queryHash);
        try {
            future.get(syncTimeoutSeconds, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            throw new RuntimeException("SPARQL query load timed out after " + syncTimeoutSeconds + " seconds");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("SPARQL query load interrupted", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("SPARQL query execution failed", e.getCause());
        }
        long generation = generationByHash.getOrDefault(queryHash, 0L);
        if (generation == 0L) {
            throw new RuntimeException("SPARQL query execution failed");
        }
        return generation;
    }

    @Override
    @Scheduled(cron = "${search.index.refreshCron:0 0 3 * * *}")
    public void refreshAll() {
        if (!refreshing.compareAndSet(false, true)) {
            logger.info("SPARQL cache refresh already in progress, skipping");
            return;
        }
        long startedAt = System.currentTimeMillis();
        try {
            flushPendingUsage();
            int evicted = evictUnused();

            List<CachedQuery> candidates = queryRepository.findAll();
            List<String> hashes = new ArrayList<>();
            int skipped = 0;
            for (CachedQuery cq : candidates) {
                // Never-loaded queries (generation 0) always get another attempt: the usage-based
                // skip only makes sense for queries that already have data to keep fresh, and
                // touch()/usage is only ever incremented on the warm (already-loaded) path.
                boolean neverLoaded = cq.getGeneration() == 0L;
                if (neverLoaded || !requireUsageForRefresh || cq.getUsageSinceRefresh() > 0L) {
                    hashes.add(cq.getQueryHash());
                } else {
                    skipped++;
                }
            }

            int succeeded = 0;
            int failed = 0;
            for (String hash : hashes) {
                // Sequential on purpose: the nightly refresh should not hammer the SPARQL endpoint.
                if (Boolean.TRUE.equals(scheduleLoad(hash).join())) {
                    succeeded++;
                } else {
                    failed++;
                }
            }
            long elapsedMs = System.currentTimeMillis() - startedAt;
            long dbFileSizeMb = currentDbFileSizeBytes() / (1024 * 1024);
            String summary = "SPARQL cache refresh finished in {} ms: {} queries succeeded, {} failed, "
                    + "{} skipped (unused since last refresh), {} evicted, db file size {} MB";
            if (failed == 0) {
                logger.info(summary, elapsedMs, succeeded, failed, skipped, evicted, dbFileSizeMb);
            } else {
                logger.warn(summary, elapsedMs, succeeded, failed, skipped, evicted, dbFileSizeMb);
            }
        } finally {
            refreshing.set(false);
        }
    }

    @Override
    public CacheStatusResponse status() {
        Map<String, Long> rowCounts = new LinkedHashMap<>();
        for (Object[] row : rowRepository.countByQueryAndGeneration()) {
            rowCounts.put(row[0] + ":" + row[1], (Long) row[2]);
        }

        CacheStatusResponse response = new CacheStatusResponse();
        response.queries = new ArrayList<>();
        for (CachedQuery cq : queryRepository.findAll()) {
            CacheStatusResponse.QueryStatus status = new CacheStatusResponse.QueryStatus();
            status.queryHash = cq.getQueryHash();
            status.hint = cq.getLabelHint();
            status.snippet = snippet(cq.getSparqlText());
            status.searchVars = cq.getSearchVars();
            status.generation = cq.getGeneration();
            status.rowCount = rowCounts.getOrDefault(cq.getQueryHash() + ":" + cq.getGeneration(), 0L);
            status.createdAt = cq.getCreatedAt();
            status.lastRefreshed = cq.getLastRefreshedAt();
            status.lastAccessed = cq.getLastAccessedAt();
            status.lastError = cq.getLastError();
            status.loading = inFlight.containsKey(cq.getQueryHash());
            status.usageSinceRefresh = cq.getUsageSinceRefresh();
            status.usageTotal = cq.getUsageTotal();
            response.queries.add(status);
            response.totalRows += status.rowCount;
            if (status.generation == 0L) {
                response.loadingCount++;
            }
            if (status.lastError != null) {
                response.failedCount++;
            }
        }
        response.totalQueries = response.queries.size();
        response.dbFileSizeBytes = currentDbFileSizeBytes();
        return response;
    }

    /**
     * Size of the H2 MVStore file on disk. Cheap way to notice, over time, whether the
     * generation-swap delete/insert churn is outgrowing H2's default background compaction
     * (AUTO_COMPACT_FILL_RATE) — not a signal that triggers any action by itself.
     */
    long currentDbFileSizeBytes() {
        try {
            return Files.size(Path.of(dbFilePath + ".mv.db"));
        } catch (IOException e) {
            return 0L;
        }
    }

    /** Returns the query's current generation, registering it first if unknown. */
    private long ensureRegistered(String queryHash, String sparqlQuery, String searchVars, String hint) {
        Long generation = generationByHash.get(queryHash);
        if (generation != null) {
            return generation;
        }
        Optional<CachedQuery> existing = queryRepository.findById(queryHash);
        if (existing.isPresent()) {
            generationByHash.put(queryHash, existing.get().getGeneration());
            return existing.get().getGeneration();
        }
        // Parse errors are not transient: reject before persisting so the registry never
        // accumulates queries that every retry, startup and nightly refresh would fail on.
        try {
            QueryFactory.create(sparqlQuery);
        } catch (QueryException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SPARQL query: " + e.getMessage(), e);
        }
        queryRepository.save(new CachedQuery(queryHash, sparqlQuery, searchVars, truncate(hint, 255), Instant.now()));
        generationByHash.put(queryHash, 0L);
        logger.info("SPARQL cache: registered new query {} (hint: {})", queryHash, hint);
        return 0L;
    }

    /** Single-flight: concurrent requests for the same query share one load. */
    CompletableFuture<Boolean> scheduleLoad(String queryHash) {
        return inFlight.computeIfAbsent(queryHash, hash -> {
            CompletableFuture<Boolean> future = CompletableFuture.supplyAsync(() -> loadQueryWithRetry(hash), loadExecutor);
            future.whenComplete((ok, error) -> inFlight.remove(hash));
            return future;
        });
    }

    /** Loads a query's rows, retrying with exponential backoff. Returns false if all attempts fail. */
    boolean loadQueryWithRetry(String queryHash) {
        int attempt = 1;
        long backoffMs = retryInitialBackoffMs;
        while (true) {
            try {
                return loadQuery(queryHash);
            } catch (Exception e) {
                if (attempt >= retryMaxAttempts) {
                    logger.error("SPARQL cache: giving up loading query {} after {} attempts; keeping previous generation {}",
                            queryHash, attempt, generationByHash.getOrDefault(queryHash, 0L), e);
                    recordError(queryHash, e);
                    return false;
                }
                logger.warn("SPARQL cache: attempt {}/{} failed for query {}, retrying in {} ms",
                        attempt, retryMaxAttempts, queryHash, backoffMs, e);
                sleep(backoffMs);
                backoffMs = (long) (backoffMs * retryBackoffMultiplier);
                attempt++;
            }
        }
    }

    /** Executes the query and swaps in a new generation of rows. Returns false if the query was evicted meanwhile. */
    boolean loadQuery(String queryHash) {
        CachedQuery cq = queryRepository.findById(queryHash).orElse(null);
        if (cq == null) {
            logger.warn("SPARQL cache: query {} no longer registered, skipping load", queryHash);
            return false;
        }
        long newGeneration = System.currentTimeMillis();
        List<CachedQueryRow> rows = fetchRows(cq, newGeneration);

        if (rows.isEmpty() && cq.getGeneration() > 0L) {
            logger.warn("SPARQL cache: query {} produced no rows; keeping previous generation {}",
                    queryHash, cq.getGeneration());
            // This cycle's demand has still been served with the (unchanged) current data.
            cq.setUsageSinceRefresh(0L);
            queryRepository.save(cq);
            return true;
        }
        rowRepository.saveAll(rows);
        cq.setGeneration(newGeneration);
        cq.setLastRefreshedAt(Instant.now());
        cq.setLastError(null);
        cq.setUsageSinceRefresh(0L);
        queryRepository.save(cq);
        generationByHash.put(queryHash, newGeneration);
        long removed = rowRepository.deleteByQueryHashAndGenerationNot(queryHash, newGeneration);
        logger.info("SPARQL cache: loaded query {}: {} rows, generation {}, {} stale rows removed",
                queryHash, rows.size(), newGeneration, removed);
        return true;
    }

    /** Executes the query against the SPARQL endpoint and decomposes the result into rows. */
    List<CachedQueryRow> fetchRows(CachedQuery cq, long newGeneration) {
        Query query = QueryFactory.create(cq.getSparqlText());
        try (QueryExecution qexec = QueryExecution.service(sparqlEndpoint)
                .query(query)
                .httpClient(http1Client)
                .timeout(15, TimeUnit.MINUTES)
                .build()) {
            return buildRows(qexec.execSelect(), splitSearchVars(cq.getSearchVars()), cq.getQueryHash(), newGeneration);
        }
    }

    List<CachedQueryRow> buildRows(ResultSet resultSet, List<String> searchVars, String queryHash, long generation) {
        List<String> resultVars = resultSet.getResultVars();
        List<CachedQueryRow> rows = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        while (resultSet.hasNext()) {
            QuerySolution solution = resultSet.next();
            Map<String, String> valueMap = new LinkedHashMap<>();
            for (String varName : resultVars) {
                if (!solution.contains(varName)) {
                    continue;
                }
                RDFNode node = solution.get(varName);
                if (node.isLiteral()) {
                    valueMap.put(varName, node.asLiteral().getString());
                } else if (node.isResource()) {
                    valueMap.put(varName, extractQNumber(node.asResource().getURI()));
                }
            }
            String label = valueMap.get(LABEL_VAR);
            if (label == null && searchVars.contains("pbid")) {
                label = valueMap.get("pbid");
            }
            if (label == null) {
                continue;
            }
            StringBuilder searchSource = new StringBuilder();
            for (String varName : searchVars) {
                String value = LABEL_VAR.equals(varName) ? label : valueMap.get(varName);
                if (value != null && !value.isBlank()) {
                    if (searchSource.length() > 0) {
                        searchSource.append(' ');
                    }
                    searchSource.append(value);
                }
            }
            String payload = toJson(valueMap);
            if (seen.add(label + ' ' + payload)) {
                rows.add(new CachedQueryRow(queryHash, generation,
                        truncate(label, LABEL_MAX_LENGTH),
                        truncate(SearchServiceImpl.normalize(searchSource.toString()), SEARCH_TEXT_MAX_LENGTH),
                        payload));
            }
        }
        return rows;
    }

    private List<Option> searchRows(String queryHash, long generation, String q, int resultLimit) {
        String term = SearchServiceImpl.normalize(q);
        if (term == null || term.isBlank()) {
            return List.of();
        }
        List<String> words = Arrays.stream(term.split("\\s+"))
                .filter(word -> !word.isBlank())
                .limit(MAX_SEARCH_WORDS)
                .toList();
        if (words.isEmpty()) {
            return List.of();
        }
        List<String> escapedWords = words.stream().map(SparqlCacheServiceImpl::escapeLike).toList();
        List<CachedQueryRow> candidates = rowRepository.searchCandidates(queryHash, generation, escapedWords, candidateLimit);

        List<Option> options = new ArrayList<>();
        candidates.stream()
                .map(row -> Map.entry(row, SearchServiceImpl.rank(row.getSearchText(), words)))
                .filter(entry -> entry.getValue() < Integer.MAX_VALUE)
                .sorted(Map.Entry.comparingByValue())
                .limit(resultLimit)
                .forEach(entry -> options.add(new Option(entry.getKey().getLabel(), fromJson(entry.getKey().getPayload()))));
        return options;
    }

    private int evictUnused() {
        Instant cutoff = Instant.now().minus(Duration.ofDays(evictAfterDays));
        int evicted = 0;
        for (CachedQuery cq : queryRepository.findByLastAccessedAtBefore(cutoff)) {
            String hash = cq.getQueryHash();
            if (inFlight.containsKey(hash)) {
                continue;
            }
            rowRepository.deleteByQueryHash(hash);
            queryRepository.deleteById(hash);
            generationByHash.remove(hash);
            lastTouchMillis.remove(hash);
            evicted++;
            logger.info("SPARQL cache: evicted query {} (hint: {}), last accessed {}", hash, cq.getLabelHint(), cq.getLastAccessedAt());
        }
        return evicted;
    }

    /**
     * Records a usage for the nightly refresh decision, and updates last_accessed_at.
     * The usage increment is always counted in memory; the DB write (both counters plus
     * last_accessed_at) is throttled to at most once per hour per query.
     */
    private void touch(String queryHash) {
        pendingUsage.computeIfAbsent(queryHash, h -> new LongAdder()).increment();
        long now = System.currentTimeMillis();
        Long lastFlush = lastTouchMillis.get(queryHash);
        if (lastFlush == null || now - lastFlush > TOUCH_THROTTLE_MILLIS) {
            lastTouchMillis.put(queryHash, now);
            flushPendingUsage(queryHash);
        }
    }

    /** Persists one query's pending usage delta (if any) and clears it. */
    private void flushPendingUsage(String queryHash) {
        LongAdder adder = pendingUsage.remove(queryHash);
        long delta = adder == null ? 0 : adder.sum();
        queryRepository.touch(queryHash, Instant.now(), delta);
    }

    /**
     * Persists every pending usage delta. Called before the nightly refresh decides what to
     * reload, so a query touched only in memory since the last throttled flush isn't
     * mistaken for unused.
     */
    private void flushPendingUsage() {
        for (String queryHash : List.copyOf(pendingUsage.keySet())) {
            flushPendingUsage(queryHash);
        }
    }

    private void recordError(String queryHash, Exception e) {
        try {
            queryRepository.findById(queryHash).ifPresent(cq -> {
                cq.setLastError(truncate(String.valueOf(e), LAST_ERROR_MAX_LENGTH));
                queryRepository.save(cq);
            });
        } catch (Exception persistError) {
            logger.warn("SPARQL cache: could not record load error for query {}", queryHash, persistError);
        }
    }

    private int effectiveLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return maxResultLimit;
        }
        return Math.min(limit, maxResultLimit);
    }

    static String normalizeSearchVars(String searchVars) {
        if (searchVars == null || searchVars.isBlank()) {
            return DEFAULT_SEARCH_VARS;
        }
        Set<String> vars = new LinkedHashSet<>();
        for (String var : searchVars.split(",")) {
            String trimmed = var.trim();
            if (!trimmed.isEmpty()) {
                vars.add(trimmed);
            }
        }
        return vars.isEmpty() ? DEFAULT_SEARCH_VARS : String.join(",", vars);
    }

    private static List<String> splitSearchVars(String searchVars) {
        return Arrays.asList(normalizeSearchVars(searchVars).split(","));
    }

    private static String escapeLike(String word) {
        return word.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private String toJson(Map<String, String> valueMap) {
        try {
            return objectMapper.writeValueAsString(valueMap);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize cached row payload", e);
        }
    }

    private Map<String, String> fromJson(String payload) {
        try {
            return objectMapper.readValue(payload, new TypeReference<Map<String, String>>() {
            });
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not deserialize cached row payload", e);
        }
    }

    private static String extractQNumber(String uri) {
        return uri.substring(uri.lastIndexOf('/') + 1);
    }

    private static String snippet(String sparqlText) {
        if (sparqlText == null) {
            return null;
        }
        String collapsed = sparqlText.replaceAll("\\s+", " ").trim();
        return truncate(collapsed, 120);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() > max ? value.substring(0, max) : value;
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
