package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class CachedQueryRepositoryTest {

    private static final String HASH = "hash1";

    @Autowired
    private CachedQueryRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        repository.save(new CachedQuery(HASH, "SELECT ?label WHERE {}", "label", null, Instant.now(), false, false, false));
    }

    @Test
    void touchIncrementsUsageTotalAndUpdatesLastAccessedAt() {
        Instant firstAccess = Instant.now();
        repository.touch(HASH, firstAccess, 3L);

        CachedQuery cq = repository.findById(HASH).orElseThrow();
        assertEquals(3L, cq.getUsageTotal());
        assertEquals(firstAccess.toEpochMilli(), cq.getLastAccessedAt().toEpochMilli());

        Instant secondAccess = firstAccess.plusSeconds(60);
        repository.touch(HASH, secondAccess, 2L);

        cq = repository.findById(HASH).orElseThrow();
        assertEquals(5L, cq.getUsageTotal());
        assertEquals(secondAccess.toEpochMilli(), cq.getLastAccessedAt().toEpochMilli());
    }

    @Test
    void touchWithZeroDeltaOnlyUpdatesLastAccessedAt() {
        repository.touch(HASH, Instant.now(), 0L);

        CachedQuery cq = repository.findById(HASH).orElseThrow();
        assertEquals(0L, cq.getUsageTotal());
    }

    @Test
    void markDirtyBySourceTableMatchesWholeTokensOnly() {
        CachedQuery manid = new CachedQuery("q1", "SELECT 1", "label", null, Instant.now(), false, false, false);
        manid.setSourceTables(" manid copid ");
        CachedQuery texid = new CachedQuery("q2", "SELECT 1", "label", null, Instant.now(), false, false, false);
        texid.setSourceTables(" texid ");
        CachedQuery unknown = new CachedQuery("q3", "SELECT 1", "label", null, Instant.now(), false, false, false);
        unknown.setSourceTables("");
        repository.saveAll(java.util.List.of(manid, texid, unknown));

        assertEquals(1, repository.markDirtyBySourceTable("% copid %"));

        assertTrue(repository.findById("q1").orElseThrow().isDirty());
        assertFalse(repository.findById("q2").orElseThrow().isDirty());
        assertFalse(repository.findById("q3").orElseThrow().isDirty());
        assertFalse(repository.findById(HASH).orElseThrow().isDirty());
    }

    @Test
    void markDirtyByHashesFlagsOnlyTheGivenQueries() {
        repository.save(new CachedQuery("q2", "SELECT 1", "label", null, Instant.now(), false, false, false));

        assertEquals(1, repository.markDirtyByHashes(java.util.List.of("q2")));

        assertTrue(repository.findById("q2").orElseThrow().isDirty());
        assertFalse(repository.findById(HASH).orElseThrow().isDirty());
    }
}
