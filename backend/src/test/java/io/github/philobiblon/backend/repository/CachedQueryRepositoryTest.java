package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class CachedQueryRepositoryTest {

    private static final String HASH = "hash1";

    @Autowired
    private CachedQueryRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        repository.save(new CachedQuery(HASH, "SELECT ?label WHERE {}", "label", null, Instant.now()));
    }

    @Test
    void touchIncrementsBothUsageCountersAndUpdatesLastAccessedAt() {
        Instant firstAccess = Instant.now();
        repository.touch(HASH, firstAccess, 3L);

        CachedQuery cq = repository.findById(HASH).orElseThrow();
        assertEquals(3L, cq.getUsageSinceRefresh());
        assertEquals(3L, cq.getUsageTotal());
        assertEquals(firstAccess.toEpochMilli(), cq.getLastAccessedAt().toEpochMilli());

        Instant secondAccess = firstAccess.plusSeconds(60);
        repository.touch(HASH, secondAccess, 2L);

        cq = repository.findById(HASH).orElseThrow();
        assertEquals(5L, cq.getUsageSinceRefresh());
        assertEquals(5L, cq.getUsageTotal());
        assertEquals(secondAccess.toEpochMilli(), cq.getLastAccessedAt().toEpochMilli());
    }

    @Test
    void touchWithZeroDeltaOnlyUpdatesLastAccessedAt() {
        repository.touch(HASH, Instant.now(), 0L);

        CachedQuery cq = repository.findById(HASH).orElseThrow();
        assertEquals(0L, cq.getUsageSinceRefresh());
        assertEquals(0L, cq.getUsageTotal());
    }
}
