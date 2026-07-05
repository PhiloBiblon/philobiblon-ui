package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQueryRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class CachedQueryRowRepositoryTest {

    private static final String HASH = "abc123";
    private static final long GENERATION = 100L;

    @Autowired
    private CachedQueryRowRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        repository.saveAll(List.of(
                new CachedQueryRow(HASH, GENERATION, "Miguel de Cervantes", "miguel de cervantes beta bioid 1234", "{}"),
                new CachedQueryRow(HASH, GENERATION, "Lope de Vega", "lope de vega", "{}"),
                new CachedQueryRow(HASH, GENERATION, "Cervantes 100%", "cervantes 100% especial_", "{}"),
                // Stale generation of the same query: must never be returned.
                new CachedQueryRow(HASH, GENERATION - 1, "Stale Cervantes", "stale cervantes", "{}"),
                // Same generation, different query: must never be returned.
                new CachedQueryRow("otherhash", GENERATION, "Other Cervantes", "other cervantes", "{}")
        ));
    }

    @Test
    void matchesReorderedMultiWordTerms() {
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("cervantes", "miguel"), 10);

        assertEquals(1, rows.size());
        assertEquals("Miguel de Cervantes", rows.get(0).getLabel());
    }

    @Test
    void isolatesByQueryHashAndGeneration() {
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("cervantes"), 10);

        assertEquals(2, rows.size());
        assertTrue(rows.stream().noneMatch(row -> row.getLabel().startsWith("Stale")));
        assertTrue(rows.stream().noneMatch(row -> row.getLabel().startsWith("Other")));
    }

    @Test
    void treatsLikeWildcardsAsLiterals() {
        // Escaped '%' must only match a literal percent sign, not act as a wildcard.
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("100\\%"), 10);
        assertEquals(1, rows.size());
        assertEquals("Cervantes 100%", rows.get(0).getLabel());

        // Escaped '_' must not match an arbitrary character.
        assertEquals(0, repository.searchCandidates(HASH, GENERATION, List.of("especiaX"), 10).size());
        assertEquals(1, repository.searchCandidates(HASH, GENERATION, List.of("especial\\_"), 10).size());
    }

    @Test
    void ordersByPositionOfFirstWord() {
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("cervantes"), 10);

        // "Cervantes 100%" has the word at position 1; "Miguel de Cervantes" further in.
        assertEquals("Cervantes 100%", rows.get(0).getLabel());
        assertEquals("Miguel de Cervantes", rows.get(1).getLabel());
    }

    @Test
    void respectsCandidateLimit() {
        assertEquals(1, repository.searchCandidates(HASH, GENERATION, List.of("cervantes"), 1).size());
    }

    @Test
    void deletesStaleGenerationsOnly() {
        long removed = repository.deleteByQueryHashAndGenerationNot(HASH, GENERATION);

        assertEquals(1, removed);
        assertEquals(3, repository.findAll().stream().filter(row -> row.getQueryHash().equals(HASH)).count());
    }
}
