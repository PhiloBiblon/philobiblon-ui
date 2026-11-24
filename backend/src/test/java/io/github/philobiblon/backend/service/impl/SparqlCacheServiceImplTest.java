package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.CachedQuery;
import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.helper.CacheBitagapGroup;
import io.github.philobiblon.backend.helper.CacheDb;
import io.github.philobiblon.backend.helper.CacheLang;
import io.github.philobiblon.backend.repository.CachedQueryRepository;
import io.github.philobiblon.backend.repository.CachedQueryRowRepository;
import io.github.philobiblon.backend.representation.Option;
import io.github.philobiblon.backend.service.CacheChangeTracker;
import io.github.philobiblon.backend.representation.SearchResponse;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SparqlCacheServiceImplTest {

    // --- Retry behaviour (ported from QuickSearchServiceImplTest) ---

    @Test
    void retriesAndEventuallySucceeds() {
        AtomicInteger calls = new AtomicInteger();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null) {
            @Override
            boolean loadQuery(String queryHash) {
                if (calls.incrementAndGet() < 3) {
                    throw new RuntimeException("simulated 429");
                }
                return true;
            }
        };
        service.retryMaxAttempts = 3;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;

        assertTrue(service.loadQueryWithRetry("hash1"));
        assertEquals(3, calls.get());
    }

    @Test
    void givesUpAfterMaxAttemptsAndReturnsFalse() {
        AtomicInteger calls = new AtomicInteger();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(mockQueryRepository(), null) {
            @Override
            boolean loadQuery(String queryHash) {
                calls.incrementAndGet();
                throw new RuntimeException("simulated 429");
            }
        };
        service.retryMaxAttempts = 3;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;

        assertFalse(service.loadQueryWithRetry("hash1"));
        assertEquals(3, calls.get());
    }

    @Test
    void succeedsOnFirstAttemptWithoutRetrying() {
        AtomicInteger calls = new AtomicInteger();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null) {
            @Override
            boolean loadQuery(String queryHash) {
                calls.incrementAndGet();
                return true;
            }
        };
        service.retryMaxAttempts = 3;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;

        assertTrue(service.loadQueryWithRetry("hash1"));
        assertEquals(1, calls.get());
    }

    // --- Single-flight ---

    @Test
    void concurrentSchedulesShareOneLoad() throws Exception {
        AtomicInteger calls = new AtomicInteger();
        CountDownLatch started = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(mockQueryRepository(), null) {
            @Override
            boolean loadQuery(String queryHash) {
                calls.incrementAndGet();
                started.countDown();
                try {
                    release.await(5, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                return true;
            }
        };
        service.retryMaxAttempts = 1;
        service.init();

        CompletableFuture<Boolean> first = service.scheduleLoad("hash1");
        assertTrue(started.await(5, TimeUnit.SECONDS));
        CompletableFuture<Boolean> second = service.scheduleLoad("hash1");

        assertSame(first, second);
        release.countDown();
        assertTrue(first.get(5, TimeUnit.SECONDS));
        assertEquals(1, calls.get());
    }

    // --- Generation swap semantics of loadQuery ---

    @Test
    void emptyResultKeepsPreviousGeneration() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now(), false, false, false);
        cq.setGeneration(42L);
        cq.setDirty(true);
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                return List.of();
            }
        };

        assertTrue(service.loadQuery("hash1"));

        assertEquals(42L, cq.getGeneration());
        // Kept dirty so the query is retried the next night.
        assertTrue(cq.isDirty());
        verify(rowRepository, never()).saveAll(any());
        verify(queryRepository, never()).save(any());
    }

    @Test
    void emptyResultOnFirstLoadSwapsGenerationSoItStopsLoading() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now(), false, false, false);
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                return List.of();
            }
        };

        assertTrue(service.loadQuery("hash1"));

        ArgumentCaptor<CachedQuery> saved = ArgumentCaptor.forClass(CachedQuery.class);
        verify(queryRepository).save(saved.capture());
        assertTrue(saved.getValue().getGeneration() > 0L);
        assertNull(saved.getValue().getLastError());
    }

    @Test
    void successfulLoadSwapsGenerationAndRemovesStaleRows() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now(), false, false, false);
        cq.setGeneration(42L);
        cq.setLastError("previous failure");
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                return List.of(new CachedQueryRow("hash1", newGeneration, "label", "label", "{}"));
            }
        };

        assertTrue(service.loadQuery("hash1"));

        assertTrue(cq.getGeneration() > 42L);
        assertNull(cq.getLastError());
        verify(rowRepository).saveAll(any());
        verify(rowRepository).deleteByQueryHashAndGenerationNot("hash1", cq.getGeneration());
        verify(queryRepository).save(cq);
    }

    @Test
    void successfulLoadClearsDirtyAndKeepsUsageTotal() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now(), false, false, false);
        cq.setGeneration(42L);
        cq.setDirty(true);
        cq.setUsageTotal(20L);
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                return List.of(new CachedQueryRow("hash1", newGeneration, "label", "label", "{}"));
            }
        };

        assertTrue(service.loadQuery("hash1"));

        assertFalse(cq.isDirty());
        assertEquals(20L, cq.getUsageTotal());
    }

    @Test
    void failedLoadKeepsDirty() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now(), false, false, false);
        cq.setGeneration(42L);
        cq.setDirty(true);
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, mock(CachedQueryRowRepository.class)) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                throw new RuntimeException("boom");
            }
        };
        service.retryMaxAttempts = 1;

        assertFalse(service.loadQueryWithRetry("hash1"));

        assertTrue(cq.isDirty());
        assertEquals(42L, cq.getGeneration());
    }

    // --- Change-driven nightly refresh ---

    private static CachedQuery loadedQuery(String hash, String sourceTables, boolean dirty) {
        CachedQuery cq = new CachedQuery(hash, "SELECT ...", "label", null, Instant.now(), false, false, false);
        cq.setGeneration(1L);
        cq.setSourceTables(sourceTables);
        cq.setDirty(dirty);
        return cq;
    }

    private static Set<String> refreshWith(CacheChangeTracker.Mode mode, CacheChangeTracker tracker,
                                           CachedQueryRepository queryRepository, CachedQuery... queries) {
        when(queryRepository.findByLastAccessedAtBefore(any())).thenReturn(List.of());
        when(queryRepository.findAll()).thenReturn(List.of(queries));
        when(tracker.detect(any())).thenReturn(new CacheChangeTracker.Detection(mode, 3));
        Set<String> reloaded = new HashSet<>();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository,
                mock(CachedQueryRowRepository.class), tracker) {
            @Override
            boolean loadQuery(String queryHash) {
                reloaded.add(queryHash);
                return !queryHash.startsWith("fail");
            }
        };
        service.retryMaxAttempts = 1;
        service.init();
        service.refreshAll();
        return reloaded;
    }

    @Test
    void fullRefreshReloadsEveryQueryAndRecordsIt() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CacheChangeTracker tracker = mock(CacheChangeTracker.class);

        Set<String> reloaded = refreshWith(CacheChangeTracker.Mode.FULL_REFRESH, tracker, queryRepository,
                loadedQuery("a", " manid ", false), loadedQuery("b", " texid ", false), loadedQuery("fail1", "", false));

        assertEquals(Set.of("a", "b", "fail1"), reloaded);
        verify(tracker).recordFullRefresh(any());
        verify(queryRepository).markDirtyByHashes(List.of("fail1"));
    }

    @Test
    void markedRefreshReloadsDirtyNeverLoadedAndUnknownSourceQueries() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CacheChangeTracker tracker = mock(CacheChangeTracker.class);
        CachedQuery neverLoaded = new CachedQuery("never", "SELECT ...", "label", null, Instant.now(), false, false, false);
        neverLoaded.setSourceTables(" manid ");

        Set<String> reloaded = refreshWith(CacheChangeTracker.Mode.MARKED, tracker, queryRepository,
                loadedQuery("dirty", " manid ", true), loadedQuery("clean", " manid ", false),
                loadedQuery("empty", "", false), loadedQuery("nulltables", null, false), neverLoaded);

        assertEquals(Set.of("dirty", "empty", "nulltables", "never"), reloaded);
        verify(tracker, never()).recordFullRefresh(any());
    }

    @Test
    void unavailableDetectionOnlyReloadsAlreadyDirtyAndNeverLoadedQueries() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CacheChangeTracker tracker = mock(CacheChangeTracker.class);
        CachedQuery neverLoaded = new CachedQuery("never", "SELECT ...", "label", null, Instant.now(), false, false, false);
        neverLoaded.setSourceTables(" manid ");

        Set<String> reloaded = refreshWith(CacheChangeTracker.Mode.UNAVAILABLE, tracker, queryRepository,
                loadedQuery("dirty", " manid ", true), loadedQuery("clean", " manid ", false),
                loadedQuery("empty", "", false), neverLoaded);

        assertEquals(Set.of("dirty", "never"), reloaded);
        verify(tracker, never()).recordFullRefresh(any());
    }

    // --- Source tables ---

    @Test
    void derivesSourceTablesFromPbidPatterns() {
        assertEquals(" manid copid ", SparqlCacheServiceImpl.deriveSourceTables(
                "?item wdt:P476 ?pbid . FILTER regex(?pbid, '(.*) manid ') ?c wdt:P476 ?x FILTER(?t = \"copid\")"));
        assertEquals(" texid cnum ", SparqlCacheServiceImpl.deriveSourceTables(
                "FILTER regex(?p, '(.*) texid ') . FILTER regex(?a, '(.*) cnum ') . FILTER regex(?b, '(.*) cnum ')"));
        assertEquals(" bioid geoid ", SparqlCacheServiceImpl.deriveSourceTables(
                "regex(?p, '(.*) bioid ') regex(?q, '(.*) geoid ')"));
        assertEquals(" manid ", SparqlCacheServiceImpl.deriveSourceTables(
                "regex(?p, '(.*) manid ') FILTER(?bg = 'BITAGAP subid ')"));
        assertEquals("", SparqlCacheServiceImpl.deriveSourceTables("SELECT ?label WHERE { ?item wdt:P2 ?label }"));
        assertEquals("", SparqlCacheServiceImpl.deriveSourceTables(null));
    }

    @Test
    void globalQueryDerivesAllEightTables() {
        StringBuilder query = new StringBuilder("SELECT * WHERE {");
        for (String table : List.of("bibid", "bioid", "geoid", "insid", "libid", "manid", "subid", "texid")) {
            query.append(" FILTER regex(?p, '(.*) ").append(table).append(" ')");
        }
        assertEquals(" bibid bioid geoid insid libid manid subid texid ",
                SparqlCacheServiceImpl.deriveSourceTables(query.toString()));
    }

    @Test
    void registrationStoresSourceTables() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, null) {
            @Override
            CompletableFuture<Boolean> scheduleLoad(String queryHash) {
                return CompletableFuture.completedFuture(true);
            }
        };

        service.search("SELECT ?label WHERE { ?item <http://x/p> ?pbid . FILTER regex(?pbid, '(.*) manid ') }",
                "x", "label", null, null, null, null, null);

        ArgumentCaptor<CachedQuery> saved = ArgumentCaptor.forClass(CachedQuery.class);
        verify(queryRepository).save(saved.capture());
        assertEquals(" manid ", saved.getValue().getSourceTables());
    }

    @Test
    void initBackfillsSourceTablesOfExistingRows() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQuery old = new CachedQuery("old", "regex(?p, '(.*) texid ')", "label", null, Instant.now(), false, false, false);
        CachedQuery current = loadedQuery("current", " manid ", false);
        when(queryRepository.findAll()).thenReturn(List.of(old, current));

        new SparqlCacheServiceImpl(queryRepository, null).init();

        assertEquals(" texid ", old.getSourceTables());
        verify(queryRepository).save(old);
        verify(queryRepository, never()).save(current);
    }

    @Test
    void refreshAllFlushesAccumulatedPendingUsageBeforeEvicting() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ?label WHERE {}", "label", null, Instant.now(), false, false, false);
        cq.setGeneration(1L);
        when(queryRepository.findById(anyString())).thenReturn(Optional.of(cq));
        when(queryRepository.findAll()).thenReturn(List.of(cq));
        when(queryRepository.findByLastAccessedAtBefore(any())).thenReturn(List.of());
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        CacheChangeTracker tracker = mock(CacheChangeTracker.class);
        when(tracker.detect(any())).thenReturn(new CacheChangeTracker.Detection(CacheChangeTracker.Mode.MARKED, 0));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository, tracker) {
            @Override
            boolean loadQuery(String queryHash) {
                return true;
            }
        };
        service.retryMaxAttempts = 1;
        service.init();

        // The first search flushes immediately (no prior throttle timestamp); the next two stay
        // pending in memory only, throttled by the 1-hour window.
        service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null);
        verify(queryRepository, times(1)).touch(anyString(), any(), eq(1L));

        service.refreshAll();

        // refreshAll's flushPendingUsage() persists the 2 remaining accumulated increments
        // before the eviction decision — without it, they'd stay invisible to the DB.
        verify(queryRepository).touch(anyString(), any(), eq(2L));
    }

    // --- Row building from a SPARQL result set ---

    @Test
    void buildsRowsWithValueMapPayloadAndNormalizedSearchText() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "label", "desc"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "label": { "type": "literal", "value": "Núñez (poeta)" },
                      "desc": { "type": "literal", "value": "Autor" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        CachedQueryRow row = rows.get(0);
        assertEquals("Núñez (poeta)", row.getLabel());
        assertEquals("nunez poeta", row.getSearchText());
        assertEquals(7L, row.getGeneration());
        assertTrue(row.getPayload().contains("\"item\":\"Q42\""));
        assertTrue(row.getPayload().contains("\"desc\":\"Autor\""));
    }

    @Test
    void searchTextComposesConfiguredVarsInOrder() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "label", "aliases", "pbid"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "label": { "type": "literal", "value": "Cervantes" },
                      "aliases": { "type": "literal", "value": "Miguel" },
                      "pbid": { "type": "literal", "value": "BETA bioid 1234" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label", "aliases", "pbid", "item"), "hash1", 7L);

        assertEquals("cervantes miguel beta bioid 1234 q42", rows.get(0).getSearchText());
    }

    @Test
    void fallsBackToPbidWhenLabelMissingAndSkipsRowsWithoutEither() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["label", "pbid", "desc"] },
                  "results": { "bindings": [
                    { "pbid": { "type": "literal", "value": "BETA bioid 1234" } },
                    { "desc": { "type": "literal", "value": "no label, no pbid" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label", "pbid"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("BETA bioid 1234", rows.get(0).getLabel());
    }

    @Test
    void skipsRowsWithoutLabelWhenPbidIsNotASearchVar() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["label", "pbid"] },
                  "results": { "bindings": [
                    { "pbid": { "type": "literal", "value": "BETA bioid 1234" } }
                  ]}
                }
                """);

        assertEquals(0, service.buildRows(resultSet, List.of("label"), "hash1", 7L).size());
    }

    @Test
    void deduplicatesIdenticalRows() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["label"] },
                  "results": { "bindings": [
                    { "label": { "type": "literal", "value": "Cervantes" } },
                    { "label": { "type": "literal", "value": "Cervantes" } }
                  ]}
                }
                """);

        assertEquals(1, service.buildRows(resultSet, List.of("label"), "hash1", 7L).size());
    }

    // --- item_id ---

    @Test
    void plainRowsCarryTheItemId() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "label": { "type": "literal", "value": "Cervantes" } },
                    { "label": { "type": "literal", "value": "No item" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals("Q42", rows.get(0).getItemId());
        assertNull(rows.get(1).getItemId());
    }

    @Test
    void pivotedRowsTakeTheFirstNonNullOfItemTargetItemAndAnalyticItem() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["target_item", "analytic_item", "lang", "label"] },
                  "results": { "bindings": [
                    { "target_item": { "type": "uri", "value": "http://philobiblon.org/entity/Q1" },
                      "analytic_item": { "type": "uri", "value": "http://philobiblon.org/entity/Q2" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Both" } },
                    { "analytic_item": { "type": "uri", "value": "http://philobiblon.org/entity/Q3" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Analytic only" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(2, rows.size());
        assertEquals("Q1", rows.get(0).getItemId());
        assertEquals("Q3", rows.get(1).getItemId());
    }

    // --- Lang-aware pivot (queries projecting ?lang) ---

    @Test
    void pivotsLangAwareResultsIntoOneRowPerItemWithPerLanguageColumns() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "pbid", "lang", "label", "desc"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "pbid": { "type": "literal", "value": "BETA bioid 1234" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Cervantes (author)" },
                      "desc": { "type": "literal", "value": "Spanish writer" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "pbid": { "type": "literal", "value": "BETA bioid 1234" },
                      "lang": { "type": "literal", "value": "ca" },
                      "label": { "type": "literal", "value": "Cervantes (autor)" },
                      "desc": { "type": "literal", "value": "Escriptor" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label", "pbid"), "hash1", 7L);

        assertEquals(1, rows.size());
        CachedQueryRow row = rows.get(0);
        assertNull(row.getLabel());
        assertEquals("Cervantes (author)", row.getLabel(CacheLang.EN));
        assertEquals("Cervantes (autor)", row.getLabel(CacheLang.CA));
        assertEquals("cervantes author beta bioid 1234", row.getSearchText(CacheLang.EN));
        assertEquals("cervantes autor beta bioid 1234", row.getSearchText(CacheLang.CA));
        assertTrue(row.getPayload().contains("\"item\":\"Q42\""));
        assertTrue(row.getPayload().contains("\"label_en\":\"Cervantes (author)\""));
        assertTrue(row.getPayload().contains("\"desc_ca\":\"Escriptor\""));
    }

    @Test
    void fallbackFillsLanguagesWithoutLabelFromEnglish() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "London" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("London", rows.get(0).getLabel(CacheLang.CA));
        assertEquals("london", rows.get(0).getSearchText(CacheLang.CA));
        // Payload keeps only the raw values: no fabricated label_ca.
        assertFalse(rows.get(0).getPayload().contains("label_ca"));
    }

    @Test
    void fallbackUsesFirstAvailableLanguageWhenEnglishMissing() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "gl" },
                      "label": { "type": "literal", "value": "Lisboa" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals("Lisboa", rows.get(0).getLabel(CacheLang.EN));
        assertEquals("Lisboa", rows.get(0).getLabel(CacheLang.PT));
    }

    @Test
    void itemWithOnlyAliasesUsesAnAliasAsDisplayLabelAndStaysSearchable() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label", "aliases"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "ca" },
                      "aliases": { "type": "literal", "value": "Londres" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label", "aliases"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("Londres", rows.get(0).getLabel(CacheLang.CA));
        assertEquals("Londres", rows.get(0).getLabel(CacheLang.EN));
        assertEquals("londres londres", rows.get(0).getSearchText(CacheLang.CA));
    }

    @Test
    void langUnboundRowFallsBackToPbidAndIsSkippedWithoutIt() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        String json = """
                {
                  "head": { "vars": ["item", "pbid", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "pbid": { "type": "literal", "value": "BETA bioid 1234" } }
                  ]}
                }
                """;

        List<CachedQueryRow> withPbid = service.buildRows(resultSet(json), List.of("label", "pbid"), "hash1", 7L);
        assertEquals(1, withPbid.size());
        assertEquals("BETA bioid 1234", withPbid.get(0).getLabel(CacheLang.ES));
        assertEquals("beta bioid 1234 beta bioid 1234", withPbid.get(0).getSearchText(CacheLang.ES));

        assertEquals(0, service.buildRows(resultSet(json), List.of("label"), "hash1", 7L).size());
    }

    @Test
    void mergesMultipleLabelsOfOneLanguageIntoDisplayLabelPlusSearchText() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "es" },
                      "label": { "type": "literal", "value": "Cervantes" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "es" },
                      "label": { "type": "literal", "value": "Miguel de Cervantes" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("Cervantes", rows.get(0).getLabel(CacheLang.ES));
        assertEquals("cervantes miguel de cervantes", rows.get(0).getSearchText(CacheLang.ES));
    }

    // --- Lang-aware search path ---

    @Test
    void registrationDetectsLangAwareQueriesFromTheProjection() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, mock(CachedQueryRowRepository.class));
        service.init();

        service.search("SELECT ?label ?lang WHERE {}", "x", "label", null, null, null, null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null);

        ArgumentCaptor<CachedQuery> saved = ArgumentCaptor.forClass(CachedQuery.class);
        verify(queryRepository, times(2)).save(saved.capture());
        assertTrue(saved.getAllValues().get(0).isLangAware());
        assertFalse(saved.getAllValues().get(1).isLangAware());
    }

    // --- Registration guards ---

    @Test
    void newQueryIsRefusedWithServiceUnavailableOnceTheRegistryIsFull() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        when(queryRepository.count()).thenReturn(3L);
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, mock(CachedQueryRowRepository.class));
        service.maxRegisteredQueries = 3;
        service.init();

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null));

        assertEquals(503, e.getStatusCode().value());
        assertEquals("Search cache is full", e.getReason());
        verify(queryRepository, never()).save(any());
    }

    @Test
    void registeredQueryIsStillServedOnceTheRegistryIsFull() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?item ?label WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), false, false, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(queryRepository.count()).thenReturn(10L);
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.maxRegisteredQueries = 1;
        service.init();

        SearchResponse response = service.search(sparql, "x", "label", null, null, null, null, null);

        assertFalse(response.isIndexLoading());
        verify(queryRepository, never()).save(any());
    }

    @Test
    void disallowedQueriesAreRejectedWithBadRequestAndNotPersisted() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, mock(CachedQueryRowRepository.class));
        service.init();

        for (String query : new String[] {"CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }",
                "SELECT ?label WHERE { SERVICE <http://example.org/sparql> { ?s ?p ?label } }"}) {
            ResponseStatusException e = assertThrows(ResponseStatusException.class,
                    () -> service.search(query, "x", "label", null, null, null, null, null));
            assertEquals(400, e.getStatusCode().value(), query);
        }
        verify(queryRepository, never()).save(any());
    }

    @Test
    void rejectsUnknownLangWithBadRequest() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(mockQueryRepository(), mock(CachedQueryRowRepository.class));
        service.init();

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> service.search("SELECT ?label ?lang WHERE {}", "x", "label", null, null, "xx", null, null));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void warmLangAwareSearchTargetsRequestedLanguageAndResolvesDisplayValues() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?item ?lang ?label ?desc WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), true, false, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));

        CachedQueryRow row = new CachedQueryRow(hash, 7L,
                Map.of(CacheLang.EN, "Cervantes (author)", CacheLang.CA, "Cervantes (autor)",
                        CacheLang.ES, "x", CacheLang.GL, "x", CacheLang.PT, "x"),
                Map.of(CacheLang.EN, "cervantes author", CacheLang.CA, "cervantes autor",
                        CacheLang.ES, "x", CacheLang.GL, "x", CacheLang.PT, "x"),
                "{\"item\":\"Q42\",\"label_en\":\"Cervantes (author)\",\"label_ca\":\"Cervantes (autor)\",\"desc_en\":\"Spanish writer\"}");
        when(rowRepository.searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq(CacheLang.CA), any(), any()))
                .thenReturn(List.of(row));

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.candidateLimit = 1000;
        service.maxResultLimit = 300;
        service.init();

        SearchResponse response = service.search(sparql, "cervantes", "label", null, null, "ca", null, null);

        assertFalse(response.isIndexLoading());
        assertEquals(1, response.getResults().size());
        Option option = response.getResults().get(0);
        assertEquals("Cervantes (autor)", option.getText());
        assertEquals("Cervantes (autor)", option.getValue().get("label"));
        // desc only exists in English: display falls back to it, per-lang keys stay internal.
        assertEquals("Spanish writer", option.getValue().get("desc"));
        assertEquals("Q42", option.getValue().get("item"));
        assertFalse(option.getValue().containsKey("label_en"));
    }

    @Test
    void langAwareSearchDefaultsToEnglishWhenNoLangGiven() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?label ?lang WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), true, false, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.init();

        service.search(sparql, "cervantes", "label", null, null, null, null, null);

        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq(CacheLang.EN), eq((CacheDb) null), any());
    }

    @Test
    void legacyQueryIgnoresLangParam() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?label WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), false, false, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.init();

        service.search(sparql, "cervantes", "label", null, null, "ca", null, null);

        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null), eq((CacheDb) null), any());
    }

    // --- Untagged literals (solutions with the per-lang var bound but ?lang unbound) ---

    @Test
    void untaggedTitleFeedsEverySearchTextAndPayloadPlainKey() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Chronicle" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "label": { "type": "literal", "value": "Cronica Geral" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        CachedQueryRow row = rows.get(0);
        // Tagged labels win the display; the untagged title feeds every language's search text.
        assertEquals("Chronicle", row.getLabel(CacheLang.EN));
        assertEquals("Chronicle", row.getLabel(CacheLang.CA));
        assertEquals("chronicle cronica geral", row.getSearchText(CacheLang.EN));
        assertEquals("chronicle cronica geral", row.getSearchText(CacheLang.CA));
        assertTrue(row.getPayload().contains("\"label\":\"Cronica Geral\""));
        assertTrue(row.getPayload().contains("\"label_en\":\"Chronicle\""));
    }

    @Test
    void itemWithOnlyAnUntaggedTitleIsKeptAndSearchable() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "label": { "type": "literal", "value": "Livro das Fortalezas" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("Livro das Fortalezas", rows.get(0).getLabel(CacheLang.PT));
        assertEquals("Livro das Fortalezas", rows.get(0).getLabel(CacheLang.EN));
        assertEquals("livro das fortalezas", rows.get(0).getSearchText(CacheLang.CA));
    }

    @Test
    void valuesTaggedWithANonUiLanguageStayExcluded() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Chronicle" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "de" },
                      "label": { "type": "literal", "value": "Chronik" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertFalse(rows.get(0).getSearchText(CacheLang.EN).contains("chronik"));
        assertFalse(rows.get(0).getPayload().contains("Chronik"));
    }

    // --- Db-aware pivot (queries projecting ?db) ---

    @Test
    void dbOnlyPivotFillsLegacyColumnsAndCollectsMembership() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["label", "db"] },
                  "results": { "bindings": [
                    { "label": { "type": "literal", "value": "Crónica general" },
                      "db": { "type": "literal", "value": "BETA" } },
                    { "label": { "type": "literal", "value": "Crónica general" },
                      "db": { "type": "literal", "value": "BITECA" } },
                    { "label": { "type": "literal", "value": "Cancioneiro" },
                      "db": { "type": "literal", "value": "BITAGAP" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(2, rows.size());
        CachedQueryRow shared = rows.get(0);
        assertEquals("Crónica general", shared.getLabel());
        assertEquals("cronica general", shared.getSearchText());
        assertNull(shared.getLabel(CacheLang.EN));
        assertEquals(" BETA BITECA ", shared.getDbGroups());
        assertEquals(" BITAGAP ", rows.get(1).getDbGroups());
        // ?db never enters the payload.
        assertFalse(shared.getPayload().contains("db"));
    }

    @Test
    void langAndDbAwareQueryCollectsMembershipAlongsidePerLanguageColumns() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label", "db"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "London" },
                      "db": { "type": "literal", "value": "BETA" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "ca" },
                      "label": { "type": "literal", "value": "Londres" },
                      "db": { "type": "literal", "value": "BITECA" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("London", rows.get(0).getLabel(CacheLang.EN));
        assertEquals("Londres", rows.get(0).getLabel(CacheLang.CA));
        assertEquals(" BETA BITECA ", rows.get(0).getDbGroups());
    }

    @Test
    void unknownDbTokenIsIgnoredAndTheRowKept() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["label", "db"] },
                  "results": { "bindings": [
                    { "label": { "type": "literal", "value": "Crónica" },
                      "db": { "type": "literal", "value": "WHATEVER" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertNull(rows.get(0).getDbGroups());
    }

    @Test
    void registrationDetectsDbAwareQueriesFromTheProjection() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, mock(CachedQueryRowRepository.class));
        service.init();

        service.search("SELECT ?label ?db WHERE {}", "x", "label", null, null, null, null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null);

        ArgumentCaptor<CachedQuery> saved = ArgumentCaptor.forClass(CachedQuery.class);
        verify(queryRepository, times(2)).save(saved.capture());
        assertTrue(saved.getAllValues().get(0).isDbAware());
        assertFalse(saved.getAllValues().get(1).isDbAware());
    }

    @Test
    void rejectsUnknownGroupWithBadRequest() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(mockQueryRepository(), mock(CachedQueryRowRepository.class));
        service.init();

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> service.search("SELECT ?label ?db WHERE {}", "x", "label", null, null, null, "FOO", null));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void dbAwareSearchFiltersByRequestedGroupAndAllMeansNoFilter() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?label ?db WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), false, true, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.init();

        service.search(sparql, "cronica", "label", null, null, null, "BETA", null);
        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null), eq(CacheDb.BETA), any());

        service.search(sparql, "cronica", "label", null, null, null, "ALL", null);
        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null),
                eq((CacheDb) null), any());
    }

    @Test
    void legacyQueryIgnoresGroupParam() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?label WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), false, false, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.init();

        service.search(sparql, "cronica", "label", null, null, null, "BETA", null);

        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null), eq((CacheDb) null), any());
    }

    // --- Bg-aware pivot (queries projecting ?bg) ---

    @Test
    void collectsBitagapSubgroupMembershipAlongsideDbAndLang() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["item", "lang", "label", "db", "bg"] },
                  "results": { "bindings": [
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Lisbon" },
                      "db": { "type": "literal", "value": "BITAGAP" },
                      "bg": { "type": "literal", "value": "ORIG" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q42" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Lisbon" },
                      "db": { "type": "literal", "value": "BITAGAP" },
                      "bg": { "type": "literal", "value": "CARTAS" } },
                    { "item": { "type": "uri", "value": "http://philobiblon.org/entity/Q7" },
                      "lang": { "type": "literal", "value": "en" },
                      "label": { "type": "literal", "value": "Porto" },
                      "db": { "type": "literal", "value": "BITAGAP" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(2, rows.size());
        assertEquals(" ORIG CARTAS ", rows.get(0).getBitagapGroups());
        assertEquals(" BITAGAP ", rows.get(0).getDbGroups());
        // No related BITAGAP subject → no subgroup membership, row kept.
        assertNull(rows.get(1).getBitagapGroups());
        assertFalse(rows.get(0).getPayload().contains("bg"));
    }

    @Test
    void bgOnlyQueryPivotsWithLegacyColumns() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        ResultSet resultSet = resultSet("""
                {
                  "head": { "vars": ["label", "bg"] },
                  "results": { "bindings": [
                    { "label": { "type": "literal", "value": "[Cartas de] Afonso V" },
                      "bg": { "type": "literal", "value": "CARTAS" } }
                  ]}
                }
                """);

        List<CachedQueryRow> rows = service.buildRows(resultSet, List.of("label"), "hash1", 7L);

        assertEquals(1, rows.size());
        assertEquals("[Cartas de] Afonso V", rows.get(0).getLabel());
        assertEquals(" CARTAS ", rows.get(0).getBitagapGroups());
    }

    @Test
    void registrationDetectsBgAwareQueriesFromTheProjection() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, mock(CachedQueryRowRepository.class));
        service.init();

        service.search("SELECT ?label ?bg WHERE {}", "x", "label", null, null, null, null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null, null, null, null);

        ArgumentCaptor<CachedQuery> saved = ArgumentCaptor.forClass(CachedQuery.class);
        verify(queryRepository, times(2)).save(saved.capture());
        assertTrue(saved.getAllValues().get(0).isBgAware());
        assertFalse(saved.getAllValues().get(1).isBgAware());
    }

    @Test
    void rejectsUnknownBitagapGroupWithBadRequest() {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(mockQueryRepository(), mock(CachedQueryRowRepository.class));
        service.init();

        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> service.search("SELECT ?label ?bg WHERE {}", "x", "label", null, null, null, null, "FOO"));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void bgAwareSearchFiltersByRequestedSubgroupAndIsIgnoredOtherwise() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?label ?bg WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), false, false, true);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.init();

        service.search(sparql, "cartas", "label", null, null, null, null, "CARTAS");
        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null),
                eq((CacheDb) null), eq(CacheBitagapGroup.CARTAS));

        service.search(sparql, "cartas", "label", null, null, null, null, "ALL");
        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null),
                eq((CacheDb) null), eq((CacheBitagapGroup) null));
    }

    @Test
    void nonBgAwareQueryIgnoresBitagapGroupParam() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        String sparql = "SELECT ?label WHERE {}";
        String hash = io.github.philobiblon.backend.helper.QueryHasher.hash("label", sparql);
        CachedQuery cq = new CachedQuery(hash, sparql, "label", null, Instant.now(), false, false, false);
        cq.setGeneration(7L);
        when(queryRepository.findById(hash)).thenReturn(Optional.of(cq));
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt(), any(), any(), any())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository);
        service.init();

        service.search(sparql, "cartas", "label", null, null, null, null, "ORIG");

        verify(rowRepository).searchCandidates(eq(hash), eq(7L), any(), anyInt(), eq((CacheLang) null),
                eq((CacheDb) null), eq((CacheBitagapGroup) null));
    }

    // --- Registration-time validation ---

    @Test
    void rejectsUnparseableSparqlWithoutRegisteringIt() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, null);

        assertThrows(ResponseStatusException.class,
                () -> service.search("SELECT ?label WHERE {", "cervantes", "label", null, null, null, null, null));

        verify(queryRepository, never()).save(any());
    }

    // --- DB file size observability ---

    @Test
    void reportsActualDbFileSizeInBytes(@TempDir Path tempDir) throws Exception {
        Path dbPath = tempDir.resolve("searchcache");
        Files.write(Path.of(dbPath + ".mv.db"), new byte[12345]);
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        service.dbFilePath = dbPath.toString();

        assertEquals(12345L, service.currentDbFileSizeBytes());
    }

    @Test
    void returnsZeroWhenDbFileDoesNotExist(@TempDir Path tempDir) {
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(null, null);
        service.dbFilePath = tempDir.resolve("does-not-exist").toString();

        assertEquals(0L, service.currentDbFileSizeBytes());
    }

    // --- searchVars normalization ---

    @Test
    void normalizesSearchVars() {
        assertEquals("label", SparqlCacheServiceImpl.normalizeSearchVars(null));
        assertEquals("label", SparqlCacheServiceImpl.normalizeSearchVars("  "));
        assertEquals("label,pbid", SparqlCacheServiceImpl.normalizeSearchVars(" label , pbid ,label,"));
        // Order is significant: it defines searchText composition order.
        assertEquals("pbid,label", SparqlCacheServiceImpl.normalizeSearchVars("pbid,label"));
        // ?lang, ?db and ?bg are reserved pivot discriminators, never searchable values.
        assertEquals("label,pbid", SparqlCacheServiceImpl.normalizeSearchVars("label,lang,pbid"));
        assertEquals("label,pbid", SparqlCacheServiceImpl.normalizeSearchVars("label,db,pbid"));
        assertEquals("label,pbid", SparqlCacheServiceImpl.normalizeSearchVars("label,bg,pbid"));
        assertEquals("label", SparqlCacheServiceImpl.normalizeSearchVars("lang,db,bg"));
    }

    private static CachedQueryRepository mockQueryRepository() {
        CachedQueryRepository repository = mock(CachedQueryRepository.class);
        when(repository.findById(anyString())).thenReturn(Optional.empty());
        return repository;
    }

    private static ResultSet resultSet(String json) {
        return ResultSetFactory.fromJSON(new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8)));
    }
}
