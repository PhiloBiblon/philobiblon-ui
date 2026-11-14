package io.github.philobiblon.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.philobiblon.backend.entity.CacheRefreshState;
import io.github.philobiblon.backend.repository.CacheRefreshStateRepository;
import io.github.philobiblon.backend.repository.CachedQueryRepository;
import io.github.philobiblon.backend.repository.CachedQueryRowRepository;
import io.github.philobiblon.backend.service.CacheChangeTracker;
import io.github.philobiblon.backend.service.WikibaseChangeService;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.RDFNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class CacheChangeTrackerImpl implements CacheChangeTracker {

    private static final Logger logger = LoggerFactory.getLogger(CacheChangeTrackerImpl.class);

    private static final int SPARQL_BATCH_SIZE = 200;
    private static final int SQL_BATCH_SIZE = 500;
    private static final int ERROR_MAX_LENGTH = 2000;

    private final CacheRefreshStateRepository stateRepository;
    private final CachedQueryRepository queryRepository;
    private final CachedQueryRowRepository rowRepository;
    private final WikibaseChangeService changeService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient http1Client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    @Value("${sparql.endpoint}")
    String sparqlEndpoint;
    @Value("${sparql.queryPrefix:}")
    String queryPrefix;
    @Value("${search.cache.refresh.fullEveryDays:7}")
    int fullEveryDays = 7;
    @Value("${search.cache.refresh.maxChangedItems:30000}")
    int maxChangedItems = 30000;
    @Value("${search.cache.refresh.overlapMinutes:60}")
    int overlapMinutes = 60;

    public CacheChangeTrackerImpl(CacheRefreshStateRepository stateRepository, CachedQueryRepository queryRepository,
                                  CachedQueryRowRepository rowRepository, WikibaseChangeService changeService) {
        this.stateRepository = stateRepository;
        this.queryRepository = queryRepository;
        this.rowRepository = rowRepository;
        this.changeService = changeService;
    }

    @Override
    public Detection detect(Instant cycleStart) {
        CacheRefreshState state = loadState();
        if (state.getLastChangePollAt() == null || state.getLastFullRefreshAt() == null
                || state.getLastFullRefreshAt().isBefore(cycleStart.minus(Duration.ofDays(fullEveryDays)))) {
            return new Detection(Mode.FULL_REFRESH, -1);
        }
        try {
            Instant since = state.getLastChangePollAt().minus(Duration.ofMinutes(overlapMinutes));
            Set<String> changed = changeService.changedItems(since, cycleStart);
            Set<String> deleted = changeService.deletedItems(since, cycleStart);
            Set<String> all = new LinkedHashSet<>(changed);
            all.addAll(deleted);
            if (all.size() > maxChangedItems) {
                logger.info("Cache change detection: {} changed items exceed the limit of {}, full refresh",
                        all.size(), maxChangedItems);
                return new Detection(Mode.FULL_REFRESH, all.size());
            }

            Set<String> tables = new HashSet<>(resolveTables(changed));
            tables.addAll(resolveDeletedTables(deleted));
            for (String table : tables) {
                queryRepository.markDirtyBySourceTable("% " + table + " %");
            }
            Set<String> hashes = new HashSet<>();
            for (List<String> batch : batches(new ArrayList<>(all), SQL_BATCH_SIZE)) {
                hashes.addAll(rowRepository.findQueryHashesByItemIdIn(batch));
            }
            if (!hashes.isEmpty()) {
                queryRepository.markDirtyByHashes(hashes);
            }

            state = loadState();
            state.setLastChangePollAt(cycleStart);
            state.setLastChangeDetectionError(null);
            state.setLastChangeDetectionErrorAt(null);
            stateRepository.save(state);
            logger.info("Cache change detection: {} changed/deleted items, tables affected {}, {} queries by item",
                    all.size(), tables, hashes.size());
            return new Detection(Mode.MARKED, all.size());
        } catch (Exception e) {
            logger.error("Cache change detection failed; nothing new marked and watermark kept", e);
            recordError(e);
            return new Detection(Mode.UNAVAILABLE, -1);
        }
    }

    @Override
    public void recordFullRefresh(Instant cycleStart) {
        CacheRefreshState state = loadState();
        state.setLastFullRefreshAt(cycleStart);
        state.setLastChangePollAt(cycleStart);
        stateRepository.save(state);
    }

    @Override
    public CacheRefreshState currentState() {
        return loadState();
    }

    private CacheRefreshState loadState() {
        return stateRepository.findById(CacheRefreshState.SINGLETON_ID).orElseGet(CacheRefreshState::new);
    }

    private void recordError(Exception e) {
        try {
            CacheRefreshState state = loadState();
            String message = String.valueOf(e);
            state.setLastChangeDetectionError(
                    message.length() > ERROR_MAX_LENGTH ? message.substring(0, ERROR_MAX_LENGTH) : message);
            state.setLastChangeDetectionErrorAt(Instant.now());
            stateRepository.save(state);
        } catch (Exception persistError) {
            logger.warn("Could not persist the change detection error", persistError);
        }
    }

    /** Tables of the changed items, from their pbid (P476) in the SPARQL endpoint; items without one are ignored. */
    private Set<String> resolveTables(Set<String> items) {
        Set<String> tables = new HashSet<>();
        for (List<String> batch : batches(new ArrayList<>(items), SPARQL_BATCH_SIZE)) {
            for (String pbid : fetchPbids(batch)) {
                String table = tableOfPbid(pbid);
                if (table != null) {
                    tables.add(table);
                }
            }
        }
        return tables;
    }

    /** Tables of items deleted upstream, from the pbid kept in their cached payloads (the global query projects it). */
    private Set<String> resolveDeletedTables(Set<String> deleted) {
        Set<String> tables = new HashSet<>();
        for (List<String> batch : batches(new ArrayList<>(deleted), SQL_BATCH_SIZE)) {
            for (String payload : rowRepository.findPayloadsByItemIdIn(batch)) {
                try {
                    Map<String, String> values = objectMapper.readValue(payload, new TypeReference<Map<String, String>>() {
                    });
                    String table = tableOfPbid(values.get("pbid"));
                    if (table != null) {
                        tables.add(table);
                    }
                } catch (Exception e) {
                    logger.debug("Cache change detection: unreadable cached payload ignored", e);
                }
            }
        }
        return tables;
    }

    /** Second token of a pbid ("BETA manid 1234" gives "manid"); null when malformed. */
    static String tableOfPbid(String pbid) {
        if (pbid == null) {
            return null;
        }
        String[] tokens = pbid.trim().split("\\s+");
        return tokens.length >= 2 && tokens[1].matches("\\w+") ? tokens[1] : null;
    }

    /** pbid values (P476) of the given items; overridable seam for tests. */
    List<String> fetchPbids(List<String> items) {
        for (String item : items) {
            if (!item.matches("Q\\d+")) {
                throw new IllegalArgumentException("Unexpected item id " + item);
            }
        }
        StringBuilder values = new StringBuilder();
        items.forEach(item -> values.append("wd:").append(item).append(' '));
        String query = (queryPrefix == null || queryPrefix.isBlank() ? "" : queryPrefix + "\n")
                + "SELECT ?item ?pbid WHERE { VALUES ?item { " + values + "} ?item wdt:P476 ?pbid }";
        List<String> pbids = new ArrayList<>();
        try (QueryExecution qexec = QueryExecution.service(sparqlEndpoint)
                .query(query)
                .httpClient(http1Client)
                .timeout(2, TimeUnit.MINUTES)
                .build()) {
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution solution = results.next();
                RDFNode pbid = solution.get("pbid");
                if (pbid != null && pbid.isLiteral()) {
                    pbids.add(pbid.asLiteral().getString());
                }
            }
        }
        return pbids;
    }

    private static <T> List<List<T>> batches(List<T> list, int size) {
        List<List<T>> batches = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            batches.add(list.subList(i, Math.min(list.size(), i + size)));
        }
        return batches;
    }
}
