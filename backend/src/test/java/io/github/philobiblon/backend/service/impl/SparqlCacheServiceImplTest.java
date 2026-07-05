package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.CachedQuery;
import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.repository.CachedQueryRepository;
import io.github.philobiblon.backend.repository.CachedQueryRowRepository;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFactory;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
        verify(rowRepository, never()).saveAll(any());
        verify(queryRepository, never()).save(any());
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
