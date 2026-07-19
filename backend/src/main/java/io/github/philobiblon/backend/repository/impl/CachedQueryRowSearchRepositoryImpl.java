package io.github.philobiblon.backend.repository.impl;

import io.github.philobiblon.backend.entity.CachedQueryRow;
import io.github.philobiblon.backend.helper.CacheDb;
import io.github.philobiblon.backend.helper.CacheLang;
import io.github.philobiblon.backend.repository.CachedQueryRowSearchRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;

public class CachedQueryRowSearchRepositoryImpl implements CachedQueryRowSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<CachedQueryRow> searchCandidates(String queryHash, long generation, List<String> escapedWords,
                                                 int limit, CacheLang lang, CacheDb db) {
        // Attribute names come exclusively from the CacheLang enum (or the legacy constants),
        // never from client input, so interpolating them into the JPQL is safe. The db filter
        // value is likewise a whitelisted enum code bound as a parameter.
        String searchTextAttr = lang == null ? "searchText" : lang.getSearchTextAttribute();
        String labelAttr = lang == null ? "label" : lang.getLabelAttribute();

        StringBuilder jpql = new StringBuilder(
                "SELECT r FROM CachedQueryRow r WHERE r.queryHash = :queryHash AND r.generation = :generation");
        if (db != null) {
            jpql.append(" AND r.dbGroups LIKE :dbToken");
        }
        for (int i = 0; i < escapedWords.size(); i++) {
            jpql.append(" AND r.").append(searchTextAttr)
                    .append(" LIKE CONCAT('%', :w").append(i).append(", '%') ESCAPE '\\'");
        }
        jpql.append(" ORDER BY LOCATE(:w0, r.").append(searchTextAttr)
                .append("), LENGTH(r.").append(labelAttr)
                .append("), r.").append(labelAttr);

        TypedQuery<CachedQueryRow> query = entityManager.createQuery(jpql.toString(), CachedQueryRow.class)
                .setParameter("queryHash", queryHash)
                .setParameter("generation", generation)
                .setMaxResults(limit);
        if (db != null) {
            query.setParameter("dbToken", "% " + db.getCode() + " %");
        }
        for (int i = 0; i < escapedWords.size(); i++) {
            query.setParameter("w" + i, escapedWords.get(i));
        }
        return query.getResultList();
    }
}
