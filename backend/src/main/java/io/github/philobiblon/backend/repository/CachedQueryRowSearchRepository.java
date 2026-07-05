package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQueryRow;

import java.util.List;

/**
 * Custom fragment: candidate lookup with one LIKE per search word (AND-ed), which is the SQL
 * projection of {@code SearchServiceImpl.rank}'s match predicate (word-contiguous, order-free).
 * A single contiguous LIKE would miss reordered multi-word terms ("cervantes miguel").
 */
public interface CachedQueryRowSearchRepository {

    /**
     * @param escapedWords normalized search words, already escaped for LIKE (\, %, _)
     */
    List<CachedQueryRow> searchCandidates(String queryHash, long generation, List<String> escapedWords, int limit);
}
