package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQueryRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CachedQueryRowRepository extends JpaRepository<CachedQueryRow, Long>, CachedQueryRowSearchRepository {

    @Transactional
    long deleteByQueryHashAndGenerationNot(String queryHash, long generation);

    @Transactional
    long deleteByQueryHash(String queryHash);

    /** Removes rows left behind by crashes or evictions (no registry entry at their generation). */
    @Transactional
    @Modifying
    @Query("DELETE FROM CachedQueryRow r WHERE NOT EXISTS " +
            "(SELECT 1 FROM CachedQuery q WHERE q.queryHash = r.queryHash AND q.generation = r.generation)")
    int deleteOrphans();

    /** (queryHash, generation, rowCount) triples for the status endpoint. */
    @Query("SELECT r.queryHash, r.generation, COUNT(r) FROM CachedQueryRow r GROUP BY r.queryHash, r.generation")
    List<Object[]> countByQueryAndGeneration();
}
