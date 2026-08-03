package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.helper.CacheBitagapGroup;
import io.github.philobiblon.backend.helper.CacheDb;
import io.github.philobiblon.backend.helper.CacheLang;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Map;

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
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("cervantes", "miguel"), 10, null, null, null);

        assertEquals(1, rows.size());
        assertEquals("Miguel de Cervantes", rows.get(0).getLabel());
    }

    @Test
    void isolatesByQueryHashAndGeneration() {
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("cervantes"), 10, null, null, null);

        assertEquals(2, rows.size());
        assertTrue(rows.stream().noneMatch(row -> row.getLabel().startsWith("Stale")));
        assertTrue(rows.stream().noneMatch(row -> row.getLabel().startsWith("Other")));
    }

    @Test
    void treatsLikeWildcardsAsLiterals() {
        // Escaped '%' must only match a literal percent sign, not act as a wildcard.
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("100\\%"), 10, null, null, null);
        assertEquals(1, rows.size());
        assertEquals("Cervantes 100%", rows.get(0).getLabel());

        // Escaped '_' must not match an arbitrary character.
        assertEquals(0, repository.searchCandidates(HASH, GENERATION, List.of("especiaX"), 10, null, null, null).size());
        assertEquals(1, repository.searchCandidates(HASH, GENERATION, List.of("especial\\_"), 10, null, null, null).size());
    }

    @Test
    void ordersByPositionOfFirstWord() {
        List<CachedQueryRow> rows = repository.searchCandidates(HASH, GENERATION, List.of("cervantes"), 10, null, null, null);

        // "Cervantes 100%" has the word at position 1; "Miguel de Cervantes" further in.
        assertEquals("Cervantes 100%", rows.get(0).getLabel());
        assertEquals("Miguel de Cervantes", rows.get(1).getLabel());
    }

    @Test
    void respectsCandidateLimit() {
        assertEquals(1, repository.searchCandidates(HASH, GENERATION, List.of("cervantes"), 1, null, null, null).size());
    }

    @Test
    void deletesStaleGenerationsOnly() {
        long removed = repository.deleteByQueryHashAndGenerationNot(HASH, GENERATION);

        assertEquals(1, removed);
        assertEquals(3, repository.findAll().stream().filter(row -> row.getQueryHash().equals(HASH)).count());
    }

    @Test
    void langAwareSearchMatchesAndOrdersOnTheRequestedLanguageColumnsOnly() {
        String langHash = "langhash";
        repository.saveAll(List.of(
                langAwareRow(langHash, "Cervantes (author)", "cervantes author", "Cervantes (autor)", "cervantes autor"),
                langAwareRow(langHash, "London", "london", "Londres", "londres")
        ));

        List<CachedQueryRow> caRows = repository.searchCandidates(langHash, GENERATION, List.of("autor"), 10,
                CacheLang.CA, null, null);
        assertEquals(1, caRows.size());
        assertEquals("Cervantes (autor)", caRows.get(0).getLabel(CacheLang.CA));

        // "author" only exists in the English column: the Catalan search must not see it.
        assertEquals(0, repository.searchCandidates(langHash, GENERATION, List.of("author"), 10, CacheLang.CA, null, null).size());
        assertEquals(1, repository.searchCandidates(langHash, GENERATION, List.of("author"), 10, CacheLang.EN, null, null).size());
    }

    @Test
    void dbAwareSearchFiltersByGroupMembership() {
        String dbHash = "dbhash";
        CachedQueryRow betaOnly = new CachedQueryRow(dbHash, GENERATION, "Crónica BETA", "cronica beta", "{}");
        betaOnly.setDbGroups(" BETA ");
        CachedQueryRow shared = new CachedQueryRow(dbHash, GENERATION, "Crónica compartida", "cronica compartida", "{}");
        shared.setDbGroups(" BETA BITECA ");
        repository.saveAll(List.of(betaOnly, shared));

        assertEquals(2, repository.searchCandidates(dbHash, GENERATION, List.of("cronica"), 10, null, null, null).size());
        assertEquals(2, repository.searchCandidates(dbHash, GENERATION, List.of("cronica"), 10, null, CacheDb.BETA, null).size());

        List<CachedQueryRow> biteca =
                repository.searchCandidates(dbHash, GENERATION, List.of("cronica"), 10, null, CacheDb.BITECA, null);
        assertEquals(1, biteca.size());
        assertEquals("Crónica compartida", biteca.get(0).getLabel());

        assertEquals(0, repository.searchCandidates(dbHash, GENERATION, List.of("cronica"), 10, null, CacheDb.BITAGAP, null).size());
    }

    @Test
    void bgAwareSearchFiltersBySubgroupMembership() {
        String bgHash = "bghash";
        CachedQueryRow origOnly = new CachedQueryRow(bgHash, GENERATION, "Crónica Geral", "cronica geral", "{}");
        origOnly.setBitagapGroups(" ORIG ");
        CachedQueryRow both = new CachedQueryRow(bgHash, GENERATION, "Crónica mixta", "cronica mixta", "{}");
        both.setBitagapGroups(" ORIG CARTAS ");
        CachedQueryRow noMembership = new CachedQueryRow(bgHash, GENERATION, "Crónica sense tema", "cronica sense tema", "{}");
        repository.saveAll(List.of(origOnly, both, noMembership));

        assertEquals(3, repository.searchCandidates(bgHash, GENERATION, List.of("cronica"), 10, null, null, null).size());
        assertEquals(2, repository.searchCandidates(bgHash, GENERATION, List.of("cronica"), 10, null, null,
                CacheBitagapGroup.ORIG).size());

        List<CachedQueryRow> cartas = repository.searchCandidates(bgHash, GENERATION, List.of("cronica"), 10, null, null,
                CacheBitagapGroup.CARTAS);
        assertEquals(1, cartas.size());
        assertEquals("Crónica mixta", cartas.get(0).getLabel());
    }

    private static CachedQueryRow langAwareRow(String hash, String labelEn, String searchEn, String labelCa,
                                               String searchCa) {
        return new CachedQueryRow(hash, GENERATION,
                Map.of(CacheLang.EN, labelEn, CacheLang.CA, labelCa, CacheLang.ES, labelEn,
                        CacheLang.GL, labelEn, CacheLang.PT, labelEn),
                Map.of(CacheLang.EN, searchEn, CacheLang.CA, searchCa, CacheLang.ES, searchEn,
                        CacheLang.GL, searchEn, CacheLang.PT, searchEn),
                "{}");
    }
}
