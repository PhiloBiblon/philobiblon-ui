package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.CachedQuery;
import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.repository.CachedQueryRepository;
import io.github.philobiblon.backend.repository.CachedQueryRowRepository;
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
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now());
        cq.setGeneration(42L);
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                return List.of();
            }
        };

        assertTrue(service.loadQuery("hash1"));

        assertEquals(42L, cq.getGeneration());
        // This cycle's demand was still served (from the unchanged data), so usageSinceRefresh
        // resets even though the generation doesn't change — hence save() IS called now.
        assertEquals(0L, cq.getUsageSinceRefresh());
        verify(rowRepository, never()).saveAll(any());
        verify(queryRepository).save(cq);
    }

    @Test
    void emptyResultOnFirstLoadSwapsGenerationSoItStopsLoading() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now());
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
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now());
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
    void successfulLoadResetsUsageSinceRefreshButNotTotal() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ...", "label", null, Instant.now());
        cq.setGeneration(42L);
        cq.setUsageSinceRefresh(5L);
        cq.setUsageTotal(20L);
        when(queryRepository.findById("hash1")).thenReturn(Optional.of(cq));
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            List<CachedQueryRow> fetchRows(CachedQuery query, long newGeneration) {
                return List.of(new CachedQueryRow("hash1", newGeneration, "label", "label", "{}"));
            }
        };

        assertTrue(service.loadQuery("hash1"));

        assertEquals(0L, cq.getUsageSinceRefresh());
        assertEquals(20L, cq.getUsageTotal());
    }

    // --- Selective nightly refresh (usage-based) ---

    @Test
    void refreshAllOnlyReloadsQueriesUsedSinceLastRefresh() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        when(queryRepository.findByLastAccessedAtBefore(any())).thenReturn(List.of());

        CachedQuery used = new CachedQuery("used", "SELECT ...", "label", null, Instant.now());
        used.setGeneration(1L);
        used.setUsageSinceRefresh(3L);
        CachedQuery unused = new CachedQuery("unused", "SELECT ...", "label", null, Instant.now());
        unused.setGeneration(1L);
        unused.setUsageSinceRefresh(0L);
        when(queryRepository.findAll()).thenReturn(List.of(used, unused));

        Set<String> reloaded = new HashSet<>();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            boolean loadQuery(String queryHash) {
                reloaded.add(queryHash);
                return true;
            }
        };
        service.retryMaxAttempts = 1;
        service.requireUsageForRefresh = true;
        service.init();

        service.refreshAll();

        assertEquals(Set.of("used"), reloaded);
    }

    @Test
    void refreshAllAlwaysRetriesNeverLoadedQueriesRegardlessOfUsage() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        when(queryRepository.findByLastAccessedAtBefore(any())).thenReturn(List.of());

        // Never successfully loaded: generation stays 0, and since usage only increments on the
        // warm path, a stuck query can never accrue usage — it must always get another attempt.
        CachedQuery stuck = new CachedQuery("stuck", "SELECT ...", "label", null, Instant.now());
        when(queryRepository.findAll()).thenReturn(List.of(stuck));

        Set<String> reloaded = new HashSet<>();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            boolean loadQuery(String queryHash) {
                reloaded.add(queryHash);
                return true;
            }
        };
        service.retryMaxAttempts = 1;
        service.requireUsageForRefresh = true;
        service.init();

        service.refreshAll();

        assertEquals(Set.of("stuck"), reloaded);
    }

    @Test
    void requireUsageDisabledRefreshesEverythingRegardlessOfUsage() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        when(queryRepository.findByLastAccessedAtBefore(any())).thenReturn(List.of());

        CachedQuery a = new CachedQuery("a", "SELECT ...", "label", null, Instant.now());
        a.setGeneration(1L);
        CachedQuery b = new CachedQuery("b", "SELECT ...", "label", null, Instant.now());
        b.setGeneration(1L);
        when(queryRepository.findAll()).thenReturn(List.of(a, b));

        Set<String> reloaded = new HashSet<>();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            boolean loadQuery(String queryHash) {
                reloaded.add(queryHash);
                return true;
            }
        };
        service.retryMaxAttempts = 1;
        service.requireUsageForRefresh = false;
        service.init();

        service.refreshAll();

        assertEquals(Set.of("a", "b"), reloaded);
    }

    @Test
    void refreshAllFlushesAccumulatedPendingUsageBeforeReadingCandidates() {
        CachedQueryRepository queryRepository = mock(CachedQueryRepository.class);
        CachedQueryRowRepository rowRepository = mock(CachedQueryRowRepository.class);
        CachedQuery cq = new CachedQuery("hash1", "SELECT ?label WHERE {}", "label", null, Instant.now());
        cq.setGeneration(1L);
        when(queryRepository.findById(anyString())).thenReturn(Optional.of(cq));
        when(queryRepository.findAll()).thenReturn(List.of(cq));
        when(queryRepository.findByLastAccessedAtBefore(any())).thenReturn(List.of());
        when(rowRepository.searchCandidates(any(), anyLong(), any(), anyInt())).thenReturn(List.of());

        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, rowRepository) {
            @Override
            boolean loadQuery(String queryHash) {
                return true;
            }
        };
        service.retryMaxAttempts = 1;
        service.init();

        // The first search flushes immediately (no prior throttle timestamp); the next two stay
        // pending in memory only, throttled by the 1-hour window.
        service.search("SELECT ?label WHERE {}", "x", "label", null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null);
        service.search("SELECT ?label WHERE {}", "x", "label", null, null);
        verify(queryRepository, times(1)).touch(anyString(), any(), eq(1L));

        service.refreshAll();

        // refreshAll's flushPendingUsage() persists the 2 remaining accumulated increments
        // before deciding what to reload — without it, they'd stay invisible to the DB.
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

    // --- Registration-time validation ---

    @Test
    void rejectsUnparseableSparqlWithoutRegisteringIt() {
        CachedQueryRepository queryRepository = mockQueryRepository();
        SparqlCacheServiceImpl service = new SparqlCacheServiceImpl(queryRepository, null);

        assertThrows(ResponseStatusException.class,
                () -> service.searchLegacy("SELECT ?label WHERE {", "cervantes"));

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
