package io.github.philobiblon.backend.repository.impl;

import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.repository.CachedQueryRowSearchRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;

public class CachedQueryRowSearchRepositoryImpl implements CachedQueryRowSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<CachedQueryRow> searchCandidates(String queryHash, long generation, List<String> escapedWords, int limit) {
        StringBuilder jpql = new StringBuilder(
                "SELECT r FROM CachedQueryRow r WHERE r.queryHash = :queryHash AND r.generation = :generation");
        for (int i = 0; i < escapedWords.size(); i++) {
            jpql.append(" AND r.searchText LIKE CONCAT('%', :w").append(i).append(", '%') ESCAPE '\\'");
        }
        jpql.append(" ORDER BY LOCATE(:w0, r.searchText), LENGTH(r.label), r.label");

        TypedQuery<CachedQueryRow> query = entityManager.createQuery(jpql.toString(), CachedQueryRow.class)
                .setParameter("queryHash", queryHash)
                .setParameter("generation", generation)
                .setMaxResults(limit);
        for (int i = 0; i < escapedWords.size(); i++) {
            query.setParameter("w" + i, escapedWords.get(i));
        }
        return query.getResultList();
    }
}
